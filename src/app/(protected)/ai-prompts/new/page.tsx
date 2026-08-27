import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AIPromptForm from '@/components/ai-prompts/AIPromptForm'

export default async function NewAIPromptPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/ai-prompts"
          className="text-red-600 hover:text-red-800 mb-4 inline-block"
        >
          ← Kembali ke Daftar Prompt
        </Link>
        <h1 className="text-3xl font-bold">Buat Prompt Baru</h1>
        <p className="text-gray-600 mt-2">Tambahkan prompt untuk character sheet atau video AI</p>
      </div>
      
      <AIPromptForm />
    </div>
  )
}
