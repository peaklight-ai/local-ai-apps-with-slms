"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // File dialogs
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  saveFile: (defaultName) => electron.ipcRenderer.invoke("dialog:saveFile", defaultName),
  // File system
  writeFile: (filePath, data) => electron.ipcRenderer.invoke("fs:writeFile", filePath, data),
  // App paths
  getPath: (name) => electron.ipcRenderer.invoke("app:getPath", name)
});
