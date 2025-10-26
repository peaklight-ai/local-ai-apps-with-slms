"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs/promises");
let mainWindow = null;
const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    titleBarStyle: "hiddenInset",
    backgroundColor: "#ffffff"
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("dialog:openFile", async () => {
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Documents", extensions: ["pdf", "docx", "doc", "txt", "md"] },
      { name: "PDF Files", extensions: ["pdf"] },
      { name: "Word Documents", extensions: ["docx", "doc"] },
      { name: "Text Files", extensions: ["txt", "md"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath);
    return {
      filePath,
      fileName,
      fileExtension,
      buffer: Array.from(fileBuffer)
      // Convert Buffer to array for IPC
    };
  }
  return null;
});
electron.ipcMain.handle("dialog:saveFile", async (_, defaultName) => {
  const result = await electron.dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: "PDF Files", extensions: ["pdf"] }
    ]
  });
  if (!result.canceled && result.filePath) {
    return result.filePath;
  }
  return null;
});
electron.ipcMain.handle("fs:writeFile", async (_, filePath, data) => {
  await fs.writeFile(filePath, Buffer.from(data));
  return true;
});
electron.ipcMain.handle("app:getPath", (_, name) => {
  return electron.app.getPath(name);
});
//# sourceMappingURL=main.js.map
