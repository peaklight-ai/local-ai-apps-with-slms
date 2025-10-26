import { contextBridge, ipcRenderer } from 'electron'

export interface FileData {
  filePath: string
  fileName: string
  fileExtension: string
  buffer: number[]
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  openFile: (): Promise<FileData | null> => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultName: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:saveFile', defaultName),

  // File system
  writeFile: (filePath: string, data: number[]): Promise<boolean> =>
    ipcRenderer.invoke('fs:writeFile', filePath, data),

  // App paths
  getPath: (name: 'home' | 'appData' | 'userData' | 'temp'): Promise<string> =>
    ipcRenderer.invoke('app:getPath', name),

  // Document processing
  parseDocument: (buffer: number[], fileName: string): Promise<{ text: string }> =>
    ipcRenderer.invoke('document:parse', buffer, fileName),

  // LLM operations
  summarizeDocument: (text: string): Promise<string> =>
    ipcRenderer.invoke('llm:summarize', text),

  // PDF export
  exportSummaryPDF: (documentName: string, summary: string): Promise<number[]> =>
    ipcRenderer.invoke('pdf:exportSummary', documentName, summary),

  // RAG operations
  indexDocument: (documentId: string, content: string): Promise<{ success: boolean; chunks: number }> =>
    ipcRenderer.invoke('rag:indexDocument', documentId, content),
  chatWithDocument: (documentId: string, question: string): Promise<{ content: string }> =>
    ipcRenderer.invoke('rag:chatWithDocument', documentId, question),
})

// Type definitions for window object
declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<FileData | null>
      saveFile: (defaultName: string) => Promise<string | null>
      writeFile: (filePath: string, data: number[]) => Promise<boolean>
      getPath: (name: 'home' | 'appData' | 'userData' | 'temp') => Promise<string>
      parseDocument: (buffer: number[], fileName: string) => Promise<{ text: string }>
      summarizeDocument: (text: string) => Promise<string>
      exportSummaryPDF: (documentName: string, summary: string) => Promise<number[]>
      indexDocument: (documentId: string, content: string) => Promise<{ success: boolean; chunks: number }>
      chatWithDocument: (documentId: string, question: string) => Promise<{ content: string }>
    }
  }
}
