import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { documentService } from './services/documentService'
import { llmService } from './services/llmService'
import { pdfExportService } from './services/pdfExportService'

// Lazy load RAG service to avoid loading heavy dependencies at startup
let ragService: any = null
async function getRAGService() {
  if (!ragService) {
    const { ragService: service } = await import('./services/ragService')
    ragService = service
  }
  return ragService
}

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff'
  })

  // Load the app
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
  const isDev = process.env.NODE_ENV !== 'production'

  console.log('[Main] Environment:', {
    VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
    NODE_ENV: process.env.NODE_ENV,
    isDev,
    devServerUrl
  })

  if (isDev) {
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'md'] },
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'Word Documents', extensions: ['docx', 'doc'] },
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    const fileBuffer = await fs.readFile(filePath)
    const fileName = path.basename(filePath)
    const fileExtension = path.extname(filePath)

    return {
      filePath,
      fileName,
      fileExtension,
      buffer: Array.from(fileBuffer) // Convert Buffer to array for IPC
    }
  }

  return null
})

ipcMain.handle('dialog:saveFile', async (_, defaultName: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  })

  if (!result.canceled && result.filePath) {
    return result.filePath
  }

  return null
})

ipcMain.handle('fs:writeFile', async (_, filePath: string, data: number[]) => {
  await fs.writeFile(filePath, Buffer.from(data))
  return true
})

ipcMain.handle('app:getPath', (_, name: 'home' | 'appData' | 'userData' | 'temp') => {
  return app.getPath(name)
})

// Document parsing
ipcMain.handle('document:parse', async (_, buffer: number[], fileName: string) => {
  try {
    const uint8Buffer = new Uint8Array(buffer)
    const result = await documentService.parseDocument(uint8Buffer, fileName)
    return { text: result.text }
  } catch (error: any) {
    console.error('Error parsing document:', error)
    throw new Error(`Failed to parse document: ${error.message}`)
  }
})

// LLM summarization
ipcMain.handle('llm:summarize', async (_, text: string) => {
  try {
    const summary = await llmService.summarize(text)
    return summary
  } catch (error: any) {
    console.error('Error generating summary:', error)
    throw new Error(`Failed to generate summary: ${error.message}`)
  }
})

// PDF export
ipcMain.handle('pdf:exportSummary', async (_, documentName: string, summary: string) => {
  try {
    const pdfData = await pdfExportService.exportSummary(documentName, summary)
    return Array.from(pdfData) // Convert Uint8Array to regular array for IPC
  } catch (error: any) {
    console.error('Error exporting PDF:', error)
    throw new Error(`Failed to export PDF: ${error.message}`)
  }
})

// RAG operations
ipcMain.handle('rag:indexDocument', async (_, documentId: string, content: string) => {
  try {
    const rag = await getRAGService()
    await rag.indexDocument(documentId, content)
    const indexSize = rag.getIndexSize()
    console.log(`[RAG] Indexed document ${documentId}, chunks: ${indexSize}`)
    return { success: true, chunks: indexSize }
  } catch (error: any) {
    console.error('Error indexing document:', error)
    throw new Error(`Failed to index document: ${error.message}`)
  }
})

ipcMain.handle('rag:chatWithDocument', async (_, documentId: string, question: string) => {
  try {
    const rag = await getRAGService()

    // Get RAG prompt with context
    const promptWithContext = await rag.query(question, 3)

    // Use LLM to generate answer
    const answer = await llmService.chat([
      { role: 'user', content: promptWithContext }
    ])

    return { content: answer }
  } catch (error: any) {
    console.error('Error chatting with document:', error)
    throw new Error(`Failed to chat with document: ${error.message}`)
  }
})
