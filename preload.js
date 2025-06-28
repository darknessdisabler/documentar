const { contextBridge, ipcRenderer } = require('electron');

// Експозиція безпечних API для рендер процесу
contextBridge.exposeInMainWorld('electronAPI', {
  // Управління вікном
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // Діалоги файлів
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // Слухачі подій меню
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action, data) => {
      callback(action, data);
    });
  },

  // Видалення слухачів
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});