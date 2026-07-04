import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';

let tray: Tray | null = null;

export function createTray(getWindow: () => BrowserWindow | null): Tray {
  // Ícone pequeno para a bandeja (16x16)
  const icon = nativeImage.createEmpty();

  // Se o ícone não existir, cria um vazio (Electron usa ícone padrão)
  tray = new Tray(icon.isEmpty() ? nativeImage.createFromDataURL(getDefaultTrayIcon()) : icon);
  tray.setToolTip('CertGuard Desktop');

  updateContextMenu(getWindow);

  // Click no ícone → mostra/esconde janela
  tray.on('click', () => {
    const win = getWindow();
    if (!win) return;
    if (win.isVisible() && !win.isMinimized()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  // Double-click → mostra janela
  tray.on('double-click', () => {
    const win = getWindow();
    if (!win) return;
    win.show();
    win.focus();
  });

  return tray;
}

export function updateContextMenu(getWindow: () => BrowserWindow | null): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir CertGuard',
      click: () => {
        const win = getWindow();
        if (!win) return;
        win.show();
        win.focus();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Sobre',
      click: () => {
        const win = getWindow();
        if (!win) return;
        win.webContents.send('show-about');
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Sair',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

/**
 * Ícone padrão em SVG inline (data URL).
 * Shield azul 16x16.
 */
function getDefaultTrayIcon(): string {
  return (
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA' +
    'OklEQVQ4y2NgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYB' +
    'SMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBQQDQAVDQH8Wz5sDwAAAABJRU5ErkJggg=='
  );
}