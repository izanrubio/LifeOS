'use client'

import { useEffect, useState } from 'react'
import { supabase, type DailyEntry, type Task, type EnergyLevel } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const MAX_TASKS = 12

export default function TodayPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [note, setNote] = useState('')
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    checkUser()
  }, [])

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
    // Cargar entrada diaria
    let { data: entry } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (!entry) {
      // Crear entrada si no existe
      const { data: newEntry } = await supabase
        .from('daily_entries')
        .insert({
          user_id: userId,
          date: today,
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
      .eq('date', today)
      .order('created_at', { ascending: true })

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

    const { data: newTask } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        date: today,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Hoy</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/calendar')}
              className="text-text-muted hover:text-text transition-colors"
            >
              Calendario
            </button>
            <button
              onClick={() => router.push('/history')}
              className="text-text-muted hover:text-text transition-colors"
            >
              Historial
            </button>
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-text transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Energía */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-sm text-text-muted mb-4">¿Cómo estás hoy?</h2>
          <div className="flex gap-3">
            {(['low', 'medium', 'high'] as EnergyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => updateEnergyLevel(level)}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  dailyEntry?.energy_level === level
                    ? 'bg-accent text-text'
                    : 'bg-background border border-border text-text-muted hover:border-accent'
                }`}
              >
                {level === 'low' && 'Bajo'}
                {level === 'medium' && 'Medio'}
                {level === 'high' && 'Alto'}
              </button>
            ))}
          </div>
        </div>

        {/* Tareas */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm text-text-muted">Tareas</h2>
            <span className="text-xs text-text-muted">{tasks.length}/{MAX_TASKS}</span>
          </div>

          {/* Lista de tareas */}
          <div className="space-y-2 mb-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 group"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="w-5 h-5 rounded border-border bg-background cursor-pointer accent-accent"
                />
                <span
                  className={`flex-1 ${
                    task.completed ? 'line-through text-text-muted' : 'text-text'
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-sm transition-all"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Añadir tarea */}
          {tasks.length < MAX_TASKS ? (
            <form onSubmit={addTask}>
              <input
                type="text"
                placeholder="Nueva tarea..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent text-text placeholder:text-text-muted"
              />
            </form>
          ) : (
            <p className="text-sm text-text-muted text-center py-2">
              Tienes muchas tareas. Considera reducir.
            </p>
          )}
        </div>

        {/* Nota */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm text-text-muted mb-4">Nota del día</h2>
          <textarea
            value={note}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Escribe algo sobre tu día..."
            className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent text-text placeholder:text-text-muted resize-none"
          />
        </div>
      </div>
    </div>
  )
}
