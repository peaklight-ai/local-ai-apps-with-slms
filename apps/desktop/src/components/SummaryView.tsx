import { useState, useEffect } from 'react'
import { Download, Sparkles, Loader2, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import type { Document } from '../App'

interface Props {
  document: Document
}

export function SummaryView({ document }: Props) {
  const [summary, setSummary] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)

  useEffect(() => {
    // Auto-generate summary when document changes
    generateSummary()
  }, [document.id])

  const generateSummary = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate summary using LLM via IPC
      const generatedSummary = await window.electronAPI.summarizeDocument(document.content)
      setSummary(generatedSummary)
    } catch (error: any) {
      console.error('Error generating summary:', error)
      setError(error.message || 'Failed to generate summary. Make sure Ollama is running.')
      setSummary('')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    if (!summary) return

    try {
      setIsExporting(true)
      setExportSuccess(false)

      const fileName = `${document.name.replace(/\.[^/.]+$/, '')}_summary.pdf`
      const filePath = await window.electronAPI.saveFile(fileName)

      if (filePath) {
        const pdfData = await window.electronAPI.exportSummaryPDF(document.name, summary)
        await window.electronAPI.writeFile(filePath, pdfData)

        setExportSuccess(true)
        setTimeout(() => setExportSuccess(false), 3000)
      }
    } catch (error: any) {
      console.error('Error exporting PDF:', error)
      setError(error.message || 'Failed to export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 break-words">{document.name}</h2>
              <p className="text-sm text-gray-500">Document Summary</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateSummary}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Regenerate
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!summary || isExporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Exported!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-800 mt-1">{error}</p>
                <button
                  onClick={generateSummary}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing document...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          ) : summary ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {summary}
                </div>
              </div>
            </div>
          ) : !error ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No summary generated yet</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
