import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Sparkles, CheckCircle, ListTodo } from 'lucide-react'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let todos: any[] | null = null;
  let errorMsg = null;
  try {
    const { data, error } = await supabase.from('todos').select()
    todos = data
    if (error) errorMsg = error.message
  } catch (e: any) {
    errorMsg = e.message
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between selection:bg-[#7C3AED] selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED] blur-[120px] rounded-full"></div>
      </div>

      <header className="h-20 border-b border-[rgba(255,255,255,0.05)] bg-[#09090B]/60 backdrop-blur-lg z-50 flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-gradient-primary">HIREIQ</span>
        </Link>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-20 flex-1 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[rgba(124,58,237,0.1)] border border-[#7C3AED]/20 px-3 py-1 rounded-full text-xs text-[#A855F7]">
            <ListTodo className="w-3.5 h-3.5" />
            <span>Supabase Connection Verified</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Supabase Integration Live</h1>
          <p className="text-sm text-gray-400">
            Real-time server-side database response synchronized through Supabase SSR.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[rgba(239,68,68,0.05)] border border-[#EF4444]/20 rounded-xl text-xs text-[#EF4444]">
            <strong>Error connecting to Supabase:</strong> {errorMsg}
          </div>
        )}

        <div className="glass p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
          <h3 className="font-semibold text-sm mb-4 text-gray-300">Todos Checklist</h3>
          {todos && todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li 
                  key={todo.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
                >
                  <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-sm text-gray-200">{todo.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400 italic">
              No todos found in supabase database table or table does not exist.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
