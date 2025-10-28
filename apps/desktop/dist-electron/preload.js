"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // File dialogs
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  saveFile: (defaultName) => electron.ipcRenderer.invoke("dialog:saveFile", defaultName),
  // File system
  writeFile: (filePath, data) => electron.ipcRenderer.invoke("fs:writeFile", filePath, data),
  // App paths
  getPath: (name) => electron.ipcRenderer.invoke("app:getPath", name),
  // Document processing
  parseDocument: (buffer, fileName) => electron.ipcRenderer.invoke("document:parse", buffer, fileName),
  // LLM operations
  summarizeDocument: (text) => electron.ipcRenderer.invoke("llm:summarize", text),
  // PDF export
  exportSummaryPDF: (documentName, summary) => electron.ipcRenderer.invoke("pdf:exportSummary", documentName, summary),
  // RAG operations
  indexDocument: (documentId, content) => electron.ipcRenderer.invoke("rag:indexDocument", documentId, content),
  chatWithDocument: (documentId, question) => electron.ipcRenderer.invoke("rag:chatWithDocument", documentId, question)
});
