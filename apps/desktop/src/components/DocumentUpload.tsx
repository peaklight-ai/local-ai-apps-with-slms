import React, { useState } from 'react'
import { Upload, File, Loader2, AlertCircle } from 'lucide-react'
import type { Document } from '../App'
import { documentService } from '../services/documentService'

interface Props {
  onDocumentLoaded: (doc: Document) => void
}

export function DocumentUpload({ onDocumentLoaded }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // Use Electron API to open file dialog
      const fileData = await window.electronAPI.openFile()

      if (!fileData) {
        setIsProcessing(false)
        return
      }

      // Parse document content
      const parsed = await documentService.parseDocument(
        fileData.buffer,
        fileData.fileName
      )

      // Create document object
      const doc: Document = {
        id: Date.now().toString(),
        name: fileData.fileName,
        type: fileData.fileExtension,
        content: parsed.text,
        filePath: fileData.filePath
      }

      onDocumentLoaded(doc)

      // Add to recent docs
      setRecentDocs(prev => [doc, ...prev.slice(0, 4)])

      setIsProcessing(false)
    } catch (error: any) {
      console.error('Error loading document:', error)
      setError(error.message || 'Failed to load document')
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Upload Document</h2>
        <button
          onClick={handleFileSelect}
          disabled={isProcessing}
          className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-600">Processing...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Click to upload</span>
              <span className="text-xs text-gray-500">PDF, DOCX, TXT, MD</span>
            </>
          )}
        </button>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {recentDocs.length > 0 && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Recent Documents
          </h3>
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onDocumentLoaded(doc)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-start gap-2">
                  <File className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
