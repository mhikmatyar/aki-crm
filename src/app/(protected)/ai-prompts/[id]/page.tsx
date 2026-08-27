import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import AIPromptForm from '@/components/ai-prompts/AIPromptForm'

interface PageProps {
  params: { id: string }
}

export default async function EditAIPromptPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Untuk sementara kita akan load data dari localStorage di client side
  // Jika nanti ingin menggunakan database, bisa ditambahkan query di sini

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/ai-prompts"
          className="text-red-600 hover:text-red-800 mb-4 inline-block"
        >
          ← Kembali ke Daftar Prompt
        </Link>
        <h1 className="text-3xl font-bold">Edit Prompt</h1>
        <p className="text-gray-600 mt-2">Ubah prompt untuk character sheet atau video AI</p>
      </div>
      
      <AIPromptForm promptId={params.id} />
    </div>
  )
}
