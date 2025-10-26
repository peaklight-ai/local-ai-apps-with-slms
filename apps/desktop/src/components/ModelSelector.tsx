import React, { useState, useEffect } from 'react'
import { Search, Download, Check, Loader2, ExternalLink } from 'lucide-react'

interface Model {
  id: string
  name: string
  size: string
  description: string
  downloaded: boolean
  isDownloading?: boolean
  source: 'ollama' | 'huggingface'
}

export function ModelSelector() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('qwen3-8b')
  const [models, setModels] = useState<Model[]>([
    {
      id: 'qwen3-8b',
      name: 'Qwen3 8B',
      size: '4.7 GB',
      description: 'Recommended for desktop. Excellent performance on summarization and Q&A.',
      downloaded: true,
      source: 'ollama'
    },
    {
      id: 'phi-4-3.2b',
      name: 'Phi-4 3.2B',
      size: '2.1 GB',
      description: 'Optimized for mobile. Fast inference with good quality.',
      downloaded: false,
      source: 'ollama'
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      size: '4.1 GB',
      description: 'High quality general-purpose model.',
      downloaded: false,
      source: 'ollama'
    }
  ])
  const [isSearching, setIsSearching] = useState(false)

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearchHuggingFace = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // TODO: Implement Hugging Face API search
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulated results
      const hfModels: Model[] = [
        {
          id: 'meta-llama/Llama-2-7b',
          name: 'Llama 2 7B',
          size: '13.5 GB',
          description: 'Meta\'s Llama 2 model, excellent for various tasks',
          downloaded: false,
          source: 'huggingface'
        }
      ]

      setModels(prev => [...prev, ...hfModels.filter(hf => !prev.some(p => p.id === hf.id))])
    } catch (error) {
      console.error('Error searching Hugging Face:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDownloadModel = async (modelId: string) => {
    setModels(prev =>
      prev.map(m =>
        m.id === modelId ? { ...m, isDownloading: true } : m
      )
    )

    try {
      // TODO: Implement actual model download via Ollama/HF
      await new Promise(resolve => setTimeout(resolve, 3000))

      setModels(prev =>
        prev.map(m =>
          m.id === modelId
            ? { ...m, isDownloading: false, downloaded: true }
            : m
        )
      )
    } catch (error) {
      console.error('Error downloading model:', error)
      setModels(prev =>
        prev.map(m =>
          m.id === modelId ? { ...m, isDownloading: false } : m
        )
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Model Selection</h3>
        <p className="text-sm text-gray-500">
          Choose which AI model to use for summarization and chat. Models run entirely on your device.
        </p>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearchHuggingFace}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Search HF
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Search Hugging Face for additional models (requires internet)
        </p>
      </div>

      {/* Model List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Available Models</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => model.downloaded && setSelectedModel(model.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-gray-900">{model.name}</h5>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {model.size}
                    </span>
                    {model.source === 'huggingface' && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                        HuggingFace
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {model.downloaded ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Installed</span>
                    </div>
                  ) : model.isDownloading ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Downloading...</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadModel(model.id)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Selection */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Currently selected model:</p>
            <p className="font-semibold text-gray-900">
              {models.find(m => m.id === selectedModel)?.name || 'None'}
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
