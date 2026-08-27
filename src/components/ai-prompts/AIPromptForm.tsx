'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

interface AIPromptFormProps {
  promptId?: string
}

const AI_MODELS = [
  'Runway Gen-3',
  'Runway Gen-2',
  'Pika Labs',
  'Stable Video Diffusion',
  'AnimateDiff',
  'Deforum',
  'Leonardo AI',
  'Midjourney Video',
  'Custom Model'
]

export default function AIPromptForm({ promptId }: AIPromptFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    model: AI_MODELS[0],
    characterSheet: '',
    videoPrompt: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (promptId) {
      loadPrompt(promptId)
    }
  }, [promptId])

  const loadPrompt = (id: string) => {
    const stored = localStorage.getItem('ai-prompts')
    if (stored) {
      const prompts: AIPrompt[] = JSON.parse(stored)
      const prompt = prompts.find(p => p.id === id)
      if (prompt) {
        setFormData({
          title: prompt.title,
          model: prompt.model,
          characterSheet: prompt.characterSheet,
          videoPrompt: prompt.videoPrompt,
          tags: prompt.tags
        })
        if (!AI_MODELS.includes(prompt.model)) {
          setCustomModel(prompt.model)
          setFormData(prev => ({ ...prev, model: 'Custom Model' }))
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const stored = localStorage.getItem('ai-prompts')
      const prompts: AIPrompt[] = stored ? JSON.parse(stored) : []

      const model = formData.model === 'Custom Model' ? customModel : formData.model

      if (promptId) {
        const index = prompts.findIndex(p => p.id === promptId)
        if (index !== -1) {
          prompts[index] = {
            ...prompts[index],
            ...formData,
            model,
            updatedAt: new Date().toISOString()
          }
        }
      } else {
        const newPrompt: AIPrompt = {
          id: Date.now().toString(),
          ...formData,
          model,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        prompts.push(newPrompt)
      }

      localStorage.setItem('ai-prompts', JSON.stringify(prompts))
      router.push('/ai-prompts')
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Gagal menyimpan prompt')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const characterSheetTemplates = {
    'Anime Character': `Character Design:
- Gender: [male/female]
- Age: [age]
- Hair: [color, style, length]
- Eyes: [color, shape]
- Body Type: [slim/athletic/etc]
- Height: [height]
- Clothing: [detailed description]
- Accessories: [accessories]
- Personality Traits: [traits]
- Expression: [default expression]`,
    
    'Realistic Person': `Character Sheet:
- Ethnicity: [ethnicity]
- Age: [age range]
- Face: [face shape, features]
- Hair: [style, color]
- Build: [body type]
- Clothing Style: [style description]
- Distinguishing Features: [unique features]`,
    
    '3D Character': `3D Character Reference:
- Model Style: [stylized/realistic/lowpoly]
- Gender: [gender]
- Proportions: [proportions]
- Color Palette: [main colors]
- Texture: [texture style]
- Rigging: [rigging notes]
- Expression Range: [expressions]`
  }

  const videoPromptTemplates = {
    'Camera Movement': `[Subject] [action], [camera movement], [lighting], [mood], [duration]

Examples:
- Close-up shot, camera slowly zooming in, soft lighting, dramatic mood
- Wide establishing shot, camera panning left to right, golden hour lighting
- Medium shot, camera tracking forward, studio lighting, professional`,
    
    'Scene Description': `Scene: [location]
Action: [what's happening]
Camera: [camera angles/movements]
Lighting: [lighting conditions]
Style: [visual style]
Duration: [length]
Additional notes: [any specific requirements]`,
    
    'Runway Gen-3 Format': `[Main subject and action], [camera movement], [environment], [lighting], [style/mood], [technical details]

Example: A woman walking through a busy street, camera tracking shot following from behind, urban downtown setting, warm sunset lighting, cinematic style, 4 seconds`
  }

  const insertTemplate = (template: string, field: 'characterSheet' | 'videoPrompt') => {
    setFormData(prev => ({ ...prev, [field]: template }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Prompt *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Character Portrait - Fantasy Warrior"
              required
            />
          </div>

          <div>
            <Label htmlFor="model">Model AI *</Label>
            <select
              id="model"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {AI_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {formData.model === 'Custom Model' && (
            <div>
              <Label htmlFor="customModel">Nama Model Custom *</Label>
              <Input
                id="customModel"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Masukkan nama model custom"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tambah tag (tekan Enter)"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Character Sheet *</CardTitle>
            <div className="flex gap-2">
              {Object.entries(characterSheetTemplates).map(([name, template]) => (
                <Button
                  key={name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(template, 'characterSheet')}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.characterSheet}
            onChange={(e) => setFormData(prev => ({ ...prev, characterSheet: e.target.value }))}
            placeholder="Masukkan deskripsi character sheet yang detail..."
            className="min-h-[300px] font-mono text-sm"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Tip: Semakin detail character sheet, semakin konsisten hasil video AI Anda
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Video Prompt *</CardTitle>
            <div className="flex gap-2">
              {Object.entries(videoPromptTemplates).map(([name, template]) => (
                <Button
                  key={name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(template, 'videoPrompt')}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.videoPrompt}
            onChange={(e) => setFormData(prev => ({ ...prev, videoPrompt: e.target.value }))}
            placeholder="Masukkan prompt untuk video AI sesuai dengan model yang digunakan..."
            className="min-h-[300px] font-mono text-sm"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Tip: Sesuaikan format prompt dengan model AI yang Anda pilih untuk hasil optimal
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/ai-prompts')}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : promptId ? 'Update Prompt' : 'Simpan Prompt'}
        </Button>
      </div>
    </form>
  )
}

