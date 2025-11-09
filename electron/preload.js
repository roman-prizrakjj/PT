import { contextBridge } from 'electron';

// Экспортируем API для использования в renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Здесь можно добавить методы для взаимодействия с main process
});
