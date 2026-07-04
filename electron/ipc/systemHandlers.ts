import { ipcMain, BrowserWindow, app } from 'electron';
import { hostname as osHostname, networkInterfaces, userInfo } from 'os';
import * as fs from 'fs';
import { generateFingerprint } from '../services/keygenService';
import { logger } from '../services/logger';

// Estado da sessão ativa (guardado no main process para cleanup ao fechar)
let activeSessionInfo: { sessionId: number; token: string; apiUrl: string } | null = null;

export function getActiveSession() {
  return activeSessionInfo;
}

export function registerSystemHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.on('window:minimize', () => {
    console.log('[IPC] window:minimize received');
    getWindow()?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    console.log('[IPC] window:maximize received');
    const win = getWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    console.log('[IPC] window:close received');
    getWindow()?.close();
  });

  // Coletar informações do dispositivo (hostname, IP real, OS, usuário)
  ipcMain.handle('system:get-os-info', async () => {
    const hostname = osHostname();
    const user = userInfo();
    const platform = `${process.platform} ${process.arch}`;

    // IP local real (não 127.0.0.1) via networkInterfaces
    const ip = getLocalIPAddress();

    // Fingerprint baseado em dados únicos do PC
    const fingerprint = generateFingerprint(
      `${hostname}|${user.username}|${platform}|${ip}`
    );

    return {
      hostname,                       // Ex: "PC-JOAO-01"
      username: user.username,         // Ex: "joao.silva"
      ip_address: ip,                  // Ex: "192.168.1.100"
      platform,                        // Ex: "linux x64"
      os_release: getOSRelease(),      // Ex: "Ubuntu 22.04"
      fingerprint,
    };
  });
}

/**
 * Obtém o IP local real (não loopback 127.0.0.1).
 * Itera pelas interfaces de rede e pega o primeiro IPv4 não interno.
 */
function getLocalIPAddress(): string {
  const interfaces = networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (!nets) continue;

    for (const net of nets) {
      // Pula IPv6 e loopback
      if (net.family === 'IPv6') continue;
      if (net.internal) continue;

      // Retorna o primeiro IPv4 não interno
      return net.address;
    }
  }

  // Fallback: hostname pode resolver para IP
  return osHostname();
}

/**
 * Retorna release do OS (ex: "Ubuntu 22.04", "Windows 11")
 */
function getOSRelease(): string {
  try {
    const release = app.getVersion();
    if (process.platform === 'linux') {
      // Tenta ler /etc/os-release
      if (fs.existsSync('/etc/os-release')) {
        const content = fs.readFileSync('/etc/os-release', 'utf-8');
        const match = content.match(/PRETTY_NAME="?([^"\n]+)"?/);
        if (match) return match[1];
      }
    } else if (process.platform === 'darwin') {
      return `macOS ${process.getSystemVersion()}`;
    } else if (process.platform === 'win32') {
      return `Windows ${process.getSystemVersion()}`;
    }
    return release;
  } catch {
    return process.platform;
  }
}

// ── Session tracking (para cleanup ao fechar app) ──────────────

ipcMain.on('session:activated', (_event, data: { sessionId: number; token: string; apiUrl: string }) => {
  activeSessionInfo = data;
  logger.info('main', 'Sessão registrada para cleanup', { sessionId: data.sessionId });
});

ipcMain.on('session:deactivated', () => {
  activeSessionInfo = null;
  logger.info('main', 'Sessão removida do tracking');
});