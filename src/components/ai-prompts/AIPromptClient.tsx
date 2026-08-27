'use client'

import { useState, useEffect } from 'react'
import { Search, Copy, Edit, Trash2, Download, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AIPrompt {
  id: string
  title: string
  model: string
  characterSheet: string
  videoPrompt: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function AIPromptClient() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<AIPrompt[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [searchTerm, selectedModel, prompts])

  const loadPrompts = () => {
    const stored = localStorage.getItem('ai-prompts')
    if (stored) {
      const parsed = JSON.parse(stored)
      setPrompts(parsed)
    }
  }

  const filterPrompts = () => {
    let filtered = [...prompts]

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.characterSheet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.videoPrompt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedModel !== 'all') {
      filtered = filtered.filter(p => p.model === selectedModel)
    }

    setFilteredPrompts(filtered)
  }

  const deletePrompt = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus prompt ini?')) {
      const updated = prompts.filter(p => p.id !== id)
      setPrompts(updated)
      localStorage.setItem('ai-prompts', JSON.stringify(updated))
    }
  }

  const copyToClipboard = (text: string, id: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(`${id}-${type}`)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const exportPrompts = () => {
    const dataStr = JSON.stringify(prompts, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-prompts-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importPrompts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          const merged = [...prompts, ...imported]
          setPrompts(merged)
          localStorage.setItem('ai-prompts', JSON.stringify(merged))
          alert(`Berhasil mengimpor ${imported.length} prompt`)
        } catch (error) {
          alert('Gagal mengimpor file. Pastikan format JSON valid.')
        }
      }
      reader.readAsText(file)
    }
  }

  const uniqueModels = ['all', ...Array.from(new Set(prompts.map(p => p.model)))]

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari berdasarkan judul, tag, atau isi prompt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {uniqueModels.map(model => (
                  <option key={model} value={model}>
                    {model === 'all' ? 'Semua Model' : model}
                  </option>
                ))}
              </select>
              <Button
                onClick={exportPrompts}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={importPrompts}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt List */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              {prompts.length === 0 
                ? 'Belum ada prompt. Klik "Tambah Prompt Baru" untuk mulai.'
                : 'Tidak ada prompt yang sesuai dengan filter.'}
            </CardContent>
          </Card>
        ) : (
          filteredPrompts.map(prompt => (
            <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{prompt.title}</CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {prompt.model}
                      </span>
                      {prompt.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/ai-prompts/${prompt.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deletePrompt(prompt.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Character Sheet */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Character Sheet</h3>
                    <Button
                      onClick={() => copyToClipboard(prompt.characterSheet, prompt.id, 'character')}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {copiedId === `${prompt.id}-character` ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{prompt.characterSheet}</pre>
                  </div>
                </div>

                {/* Video Prompt */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Video Prompt</h3>
                    <Button
                      onClick={() => copyToClipboard(prompt.videoPrompt, prompt.id, 'video')}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {copiedId === `${prompt.id}-video` ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{prompt.videoPrompt}</pre>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Dibuat: {new Date(prompt.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

