import { app, BrowserWindow, globalShortcut } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { registerSystemHandlers, getActiveSession } from './ipc/systemHandlers'
import { registerCertHandlers } from './ipc/certHandlers'
import { PowerShellService } from './services/powershellService'
import { createTray, destroyTray } from './services/trayService'
import { logger } from './services/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let isQuitting = false
let cleanupInProgress = false

const CLEANUP_TIMEOUT_MS = 30000

function createWindow() {
  win = new BrowserWindow({
    width: 820,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    titleBarStyle: 'hidden',
    frame: false,
    show: false, // Não mostra até estar pronto
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.once('ready-to-show', () => {
    win?.show()
    logger.info('main', 'Janela principal exibida')
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Intercepta navegação para URLs externas
  win.webContents.setWindowOpenHandler(({ url }) => {
    logger.warn('main', 'Tentativa de abrir URL externa bloqueada', { url })
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Esconde ao fechar em vez de fechar (vai pro tray)
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win?.hide()
      logger.debug('main', 'Janela ocultada para o tray')
    }
  })
}

app.on('window-all-closed', () => {
  // No macOS, app fica no dock. Em outros, fica no tray.
  if (process.platform !== 'darwin') {
    // NÃO fecha o app, apenas esconde (RN: System Tray)
    logger.info('main', 'Todas as janelas fechadas - app continua no tray')
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Cleanup antes de fechar o app
app.on('before-quit', async (event) => {
  // Proteção contra duplo-trigger (tray quit + before-quit)
  if (cleanupInProgress) {
    logger.debug('main', 'Cleanup já em andamento, ignorando')
    return
  }

  cleanupInProgress = true
  isQuitting = true
  destroyTray()
  globalShortcut.unregisterAll()

  const session = getActiveSession()
  logger.info('main', 'before-quit iniciado', {
    hasSession: !!session,
    certThumbprint: session?.certThumbprint ?? null,
    platform: process.platform,
  })

  if (session) {
    event.preventDefault()

    // Timeout de segurança para garantir que app.exit() é chamado
    const forceExitTimer = setTimeout(() => {
      logger.warn('main', 'Timeout do cleanup - forçando saída')
      app.exit(0)
    }, CLEANUP_TIMEOUT_MS)

    try {
      // 1. Encerrar sessão no backend
      const url = `${session.apiUrl}/api/desktop/sessoes/${session.sessionId}`
      try {
        await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Accept': 'application/json',
          },
        })
        logger.info('main', 'Sessão encerrada no backend', { sessionId: session.sessionId })
      } catch (e) {
        logger.warn('main', 'Erro ao encerrar sessão no backend', { error: String(e) })
      }

      // 2. Remover certificado do Windows Store
      if (process.platform === 'win32') {
        if (session.certThumbprint) {
          const result = await PowerShellService.removeCertByThumbprint(session.certThumbprint)
          if (result.success) {
            logger.info('main', 'Certificado removido do store', {
              thumbprint: session.certThumbprint,
              output: result.output,
            })
          } else {
            logger.warn('main', 'Falha ao remover certificado específico', {
              thumbprint: session.certThumbprint,
              output: result.output,
              error: result.error,
            })
            // Fallback: cleanup de órfãos
            const orphanResult = await PowerShellService.cleanupOrphanCerts()
            logger.info('main', 'Fallback cleanup de órfãos', {
              removed: orphanResult.removed.length,
              errors: orphanResult.errors.length,
            })
          }
        } else {
          // Sem thumbprint específico - cleanup genérico
          logger.warn('main', 'Sem certThumbprint - usando cleanup genérico')
          const orphanResult = await PowerShellService.cleanupOrphanCerts()
          logger.info('main', 'Cleanup genérico', {
            removed: orphanResult.removed.length,
            errors: orphanResult.errors.length,
          })
        }
      }
    } catch (e) {
      logger.error('main', 'Erro no cleanup', { error: String(e) })
    } finally {
      clearTimeout(forceExitTimer)
      logger.info('main', 'Cleanup concluído, saindo')
      app.exit(0)
    }
  } else {
    logger.info('main', 'Sem sessão ativa, fechando diretamente')
  }
})

// Captura erros não tratados no main process
process.on('uncaughtException', (error) => {
  logger.error('main', 'Erro não capturado', {
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 5).join('\n'),
  })
})

process.on('unhandledRejection', (reason) => {
  logger.error('main', 'Promise rejeitada não tratada', {
    reason: String(reason),
  })
})

app.whenReady().then(() => {
  logger.info('main', 'App iniciando', { version: app.getVersion() })

  createWindow()
  registerSystemHandlers(() => win)
  registerCertHandlers()

  // DevTools shortcut (Ctrl+Shift+I)
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win?.webContents.toggleDevTools()
  })

  // System Tray (RN: Bandeja do Sistema)
  try {
    createTray(() => win)
    logger.info('main', 'System tray criado')
  } catch (e) {
    logger.warn('main', 'Falha ao criar tray', { error: String(e) })
  }

  // Cleanup órfãos no startup (recuperação de crashes)
  if (process.platform === 'win32') {
    PowerShellService.cleanupOrphanCerts().catch((e) => {
      logger.warn('main', 'Cleanup de órfãos falhou', { error: String(e) })
    })
  }

  logger.info('main', 'App pronto')
})
