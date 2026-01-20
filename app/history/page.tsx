'use client'

import { useEffect, useState } from 'react'
import { supabase, type DailyEntry } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DayWithTasks extends DailyEntry {
  completed_tasks: number
  total_tasks: number
}

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<DayWithTasks[]>([])
  const router = useRouter()

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
    await loadHistory(user.id)
    setLoading(false)
  }

  const loadHistory = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]

    // Cargar entradas anteriores a hoy
    const { data: entries } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .lt('date', today)
      .order('date', { ascending: false })

    if (!entries) return

    // Para cada entrada, contar tareas completadas
    const daysWithTasks = await Promise.all(
      entries.map(async (entry) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('completed')
          .eq('user_id', userId)
          .eq('date', entry.date)

        const completed = tasks?.filter(t => t.completed).length || 0
        const total = tasks?.length || 0

        return {
          ...entry,
          completed_tasks: completed,
          total_tasks: total,
        }
      })
    )

    setDays(daysWithTasks)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
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
          <h1 className="text-2xl font-semibold">Historial</h1>
          <button
            onClick={() => router.push('/today')}
            className="text-text-muted hover:text-text transition-colors"
          >
            Volver
          </button>
        </div>

        {/* Lista de días */}
        {days.length === 0 ? (
          <div className="text-center text-text-muted py-12">
            No hay días anteriores registrados
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => (
              <div
                key={day.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-text font-medium capitalize">
                    {formatDate(day.date)}
                  </h3>
                  {day.energy_level && (
                    <span className="text-xs px-2 py-1 rounded bg-background text-text-muted">
                      {day.energy_level === 'low' && 'Bajo'}
                      {day.energy_level === 'medium' && 'Medio'}
                      {day.energy_level === 'high' && 'Alto'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                  {day.total_tasks > 0 ? (
                    <>
                      <span>{day.completed_tasks} de {day.total_tasks} tareas completadas</span>
                    </>
                  ) : (
                    <span>Sin tareas</span>
                  )}
                </div>

                {day.note && (
                  <p className="mt-4 text-sm text-text-muted">
                    {day.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
