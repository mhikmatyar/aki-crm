import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AIPromptClient from '@/components/ai-prompts/AIPromptClient'

export default async function AIPromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Video Prompts Manager</h1>
          <p className="text-gray-600 mt-2">Kelola prompt untuk character sheet dan video AI</p>
        </div>
        <Link 
          href="/ai-prompts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Prompt Baru
        </Link>
      </div>
      
      <AIPromptClient />
    </div>
  )
}
