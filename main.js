const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
    backgroundColor: '#1a1a1a',
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Завантажуємо додаток
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/public/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Створюємо меню
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Новий проект',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-project');
          }
        },
        {
          label: 'Відкрити',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'DocumentA Projects', extensions: ['doca'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-action', 'open-project', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Зберегти',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-action', 'save-project');
          }
        },
        {
          label: 'Зберегти як...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'DocumentA Projects', extensions: ['doca'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-action', 'save-project-as', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Експорт',
          submenu: [
            {
              label: 'Експорт у PPTX',
              click: () => {
                mainWindow.webContents.send('menu-action', 'export-pptx');
              }
            },
            {
              label: 'Експорт у DOCX',
              click: () => {
                mainWindow.webContents.send('menu-action', 'export-docx');
              }
            },
            {
              label: 'Експорт у XLSX',
              click: () => {
                mainWindow.webContents.send('menu-action', 'export-xlsx');
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Вихід',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Редагування',
      submenu: [
        {
          label: 'Скасувати',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            mainWindow.webContents.send('menu-action', 'undo');
          }
        },
        {
          label: 'Повторити',
          accelerator: 'CmdOrCtrl+Y',
          click: () => {
            mainWindow.webContents.send('menu-action', 'redo');
          }
        },
        { type: 'separator' },
        {
          label: 'Копіювати',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Вставити',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        }
      ]
    },
    {
      label: 'Вигляд',
      submenu: [
        {
          label: 'Повний екран',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: 'Мінімізувати',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          }
        },
        { type: 'separator' },
        {
          label: 'Налаштування',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-action', 'open-settings');
          }
        }
      ]
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'Генерувати презентацію',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send('menu-action', 'generate-presentation');
          }
        },
        {
          label: 'Генерувати документ',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow.webContents.send('menu-action', 'generate-document');
          }
        },
        {
          label: 'Покращити текст',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.send('menu-action', 'improve-text');
          }
        },
        { type: 'separator' },
        {
          label: 'Завантажити моделі',
          click: () => {
            mainWindow.webContents.send('menu-action', 'download-models');
          }
        }
      ]
    },
    {
      label: 'Допомога',
      submenu: [
        {
          label: 'Про DocumentA®',
          click: () => {
            mainWindow.webContents.send('menu-action', 'about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC обробники
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Події додатка
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Безпека
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
  });
});