import { useState } from 'react'
import { DocumentUpload } from './components/DocumentUpload'
import { SummaryView } from './components/SummaryView'
import { ChatInterface } from './components/ChatInterface'
import { ModelSelector } from './components/ModelSelector'
import { FileText, MessageSquare, Settings } from 'lucide-react'

export interface Document {
  id: string
  name: string
  type: string
  content: string
  summary?: string
  filePath: string
}

function App() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary')
  const [showSettings, setShowSettings] = useState(false)

  console.log('[App] Rendering App component')

  const handleDocumentLoaded = (doc: Document) => {
    setCurrentDocument(doc)
    setActiveTab('summary')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between drag-region">
        <div className="flex items-center gap-3">
          <img
            src="/baynetna-logo.png"
            alt="Baynetna Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">Baynetna</h1>
            <p className="text-xs text-gray-500 break-words">powered by peaklight.ai</p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Document Upload */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <DocumentUpload onDocumentLoaded={handleDocumentLoaded} />
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          {currentDocument ? (
            <>
              {/* Tabs */}
              <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-3 flex items-center gap-2 font-medium transition-colors relative ${
                    activeTab === 'summary'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Summary
                  {activeTab === 'summary' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-3 flex items-center gap-2 font-medium transition-colors relative ${
                    activeTab === 'chat'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                  {activeTab === 'chat' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'summary' ? (
                  <SummaryView document={currentDocument} />
                ) : (
                  <ChatInterface document={currentDocument} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No document loaded
                </h2>
                <p className="text-gray-500">
                  Upload a document to get started with AI-powered summarization
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <ModelSelector />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
