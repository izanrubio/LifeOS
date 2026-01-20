'use client'

import { useEffect, useState } from 'react'
import { supabase, type DailyEntry, type Task, type EnergyLevel } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const MAX_TASKS = 12

// Función para obtener la fecha local en formato YYYY-MM-DD
const getLocalDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TodayPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [note, setNote] = useState('')
  const [currentDate, setCurrentDate] = useState(() => getLocalDate())
  const router = useRouter()

  const today = currentDate

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    // Verificar cambio de día cada 30 segundos
    const interval = setInterval(() => {
      const newDate = getLocalDate()
      if (newDate !== currentDate) {
        console.log('Día cambiado de', currentDate, 'a', newDate)
        setCurrentDate(newDate)
        window.location.reload() // Forzar recarga completa
      }
    }, 30000) // Verificar cada 30 segundos
    
    return () => clearInterval(interval)
  }, [currentDate])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    await loadTodayData(user.id)
    setLoading(false)
  }

  const loadTodayData = async (userId: string) => {
    // Asegurar que usamos la fecha local del sistema
    const currentDateStr = getLocalDate()
    console.log('Cargando datos para la fecha:', currentDateStr)
    
    // Cargar entrada diaria
    let { data: entry } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', currentDateStr)
      .single()

    console.log('Entrada encontrada:', entry)

    if (!entry) {
      // Crear entrada si no existe
      console.log('Creando nueva entrada para:', currentDateStr)
      const { data: newEntry } = await supabase
        .from('daily_entries')
        .insert({
          user_id: userId,
          date: currentDateStr,
          energy_level: null,
          note: null,
        })
        .select()
        .single()
      entry = newEntry
    }

    setDailyEntry(entry)
    setNote(entry?.note || '')

    // Cargar tareas
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', currentDateStr)
      .order('created_at', { ascending: true })

    console.log('Tareas encontradas para', currentDateStr, ':', tasksData)
    setTasks(tasksData || [])
  }

  const updateEnergyLevel = async (level: EnergyLevel) => {
    if (!user || !dailyEntry) return

    await supabase
      .from('daily_entries')
      .update({ energy_level: level })
      .eq('id', dailyEntry.id)

    setDailyEntry({ ...dailyEntry, energy_level: level })
  }

  const updateNote = async (value: string) => {
    setNote(value)
    if (!user || !dailyEntry) return

    await supabase
      .from('daily_entries')
      .update({ note: value })
      .eq('id', dailyEntry.id)
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTaskTitle.trim() || tasks.length >= MAX_TASKS) return

    const currentDateStr = getLocalDate()
    console.log('Añadiendo tarea para:', currentDateStr)

    const { data: newTask } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        date: currentDateStr,
        title: newTaskTitle.trim(),
        completed: false,
      })
      .select()
      .single()

    if (newTask) {
      setTasks([...tasks, newTask])
      setNewTaskTitle('')
    }
  }

  const toggleTask = async (task: Task) => {
    await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)

    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = async (taskId: string) => {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const formatDate = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
    }
    const formatted = date.toLocaleDateString('en-US', options)
    return formatted.replace(/,/g, '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-900 flex items-center justify-center">
        <div className="text-emerald-300">Loading...</div>
      </div>
    )
  }

  const completedTasks = tasks.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-900 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-emerald-800/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-950" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5L2 8v9l8 4.5 8-4.5V8l-8-4.5z"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">LifeOS</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <button className="text-emerald-400 text-sm font-medium px-3 py-1.5 border-b-2 border-emerald-400">
            Today
          </button>
          <button 
            onClick={() => router.push('/calendar')}
            className="text-emerald-300/70 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            Calendar
          </button>
          <button 
            onClick={() => router.push('/history')}
            className="text-emerald-300/70 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            History
          </button>
          
          <div className="flex items-center gap-3 ml-4">
            <button className="text-emerald-300/70 hover:text-emerald-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="text-emerald-300/70 hover:text-emerald-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">Today's Log</h1>
            <p className="text-emerald-300/60 text-sm">{formatDate()}</p>
          </div>

          {/* Daily Energy */}
          <div className="bg-emerald-900/30 backdrop-blur border border-emerald-800/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              <h2 className="text-white font-medium">Daily Energy</h2>
            </div>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as EnergyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => updateEnergyLevel(level)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    dailyEntry?.energy_level === level
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                      : 'bg-emerald-900/40 text-emerald-300/60 hover:bg-emerald-900/60 border border-emerald-800/30'
                  }`}
                >
                  {level === 'low' && 'Low'}
                  {level === 'medium' && 'Medium'}
                  {level === 'high' && 'High'}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-emerald-900/30 backdrop-blur border border-emerald-800/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-950" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-white font-medium">Tasks</h2>
              </div>
              <span className="text-emerald-400 text-sm font-medium">{completedTasks}/{MAX_TASKS}</span>
            </div>

            {/* Lista de tareas */}
            <div className="space-y-3 mb-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      className="w-5 h-5 rounded border-2 border-emerald-700 bg-emerald-900/40 cursor-pointer appearance-none checked:bg-emerald-500 checked:border-emerald-500"
                    />
                    {task.completed && (
                      <svg className="w-3 h-3 text-emerald-950 absolute top-1 left-1 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`flex-1 text-sm ${
                      task.completed ? 'line-through text-emerald-400/40' : 'text-emerald-100'
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-emerald-400/60 hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Añadir tarea */}
            {tasks.length < MAX_TASKS && (
              <form onSubmit={addTask} className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-5 h-5 text-emerald-400/60 hover:text-emerald-400"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-0 py-2 bg-transparent border-none focus:outline-none text-emerald-300/60 placeholder:text-emerald-400/30 text-sm"
                />
              </form>
            )}
          </div>

          {/* Daily Note */}
          <div className="bg-emerald-900/30 backdrop-blur border border-emerald-800/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 className="text-white font-medium">Daily Note</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => updateNote(e.target.value)}
              placeholder="What's on your mind? Set your intentions..."
              className="w-full h-40 px-0 py-2 bg-transparent border-none focus:outline-none text-emerald-100 placeholder:text-emerald-400/30 resize-none text-sm leading-relaxed"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-emerald-400/40 text-xs">AI Insights</span>
              <svg className="w-4 h-4 text-emerald-400/40" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 flex items-center justify-center gap-6 border-t border-emerald-800/30">
        <a href="#" className="text-emerald-400/40 text-xs hover:text-emerald-400/60 transition-colors uppercase tracking-wide">
          Documentation
        </a>
        <a href="#" className="text-emerald-400/40 text-xs hover:text-emerald-400/60 transition-colors uppercase tracking-wide">
          Privacy
        </a>
        <a href="#" className="text-emerald-400/40 text-xs hover:text-emerald-400/60 transition-colors uppercase tracking-wide">
          Sync
        </a>
        <div className="text-emerald-400/20 text-xs uppercase tracking-wide">
          LifeOS Edition - v3.01 Beta
        </div>
      </footer>
    </div>
  )
}
