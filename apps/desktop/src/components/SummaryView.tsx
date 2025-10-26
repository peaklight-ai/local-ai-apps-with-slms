import React, { useState, useEffect } from 'react'
import { Download, Sparkles, Loader2, FileText } from 'lucide-react'
import type { Document } from '../App'

interface Props {
  document: Document
}

export function SummaryView({ document }: Props) {
  const [summary, setSummary] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Auto-generate summary when document changes
    generateSummary()
  }, [document.id])

  const generateSummary = async () => {
    setIsGenerating(true)

    try {
      // TODO: Call LLM API to generate summary
      // For now, simulate with timeout
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSummary(`This is a summary of ${document.name}.

The document contains important information about various topics. Key points include:

• Main topic discussion and analysis
• Supporting evidence and examples
• Conclusions and recommendations

This summary was generated locally using on-device AI to ensure your privacy.`)

    } catch (error) {
      console.error('Error generating summary:', error)
      setSummary('Error generating summary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const fileName = `${document.name.replace(/\.[^/.]+$/, '')}_summary.pdf`
      const filePath = await window.electronAPI.saveFile(fileName)

      if (filePath) {
        // TODO: Generate PDF and save
        console.log('Exporting to:', filePath)
        alert('PDF export will be implemented soon!')
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{document.name}</h2>
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
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
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No summary generated yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
