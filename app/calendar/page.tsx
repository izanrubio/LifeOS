'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import './calendar.css'

interface DayData {
  date: string
  energy_level: number
  tasks_completed: number
  tasks: Array<{ title: string; completed: boolean }>
  note: string | null
}

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadCalendarData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }

  const loadCalendarData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Obtener entradas diarias
    const { data: entries } = await supabase
      .from('daily_entries')
      .select('date, energy_level, note')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Obtener tareas
    const { data: tasks } = await supabase
      .from('tasks')
      .select('date, title, completed')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Agrupar por fecha
    const dayMap = new Map<string, DayData>()

    entries?.forEach((entry) => {
      dayMap.set(entry.date, {
        date: entry.date,
        energy_level: entry.energy_level || 0,
        tasks_completed: 0,
        tasks: [],
        note: entry.note,
      })
    })

    tasks?.forEach((task) => {
      if (!dayMap.has(task.date)) {
        dayMap.set(task.date, {
          date: task.date,
          energy_level: 0,
          tasks_completed: 0,
          tasks: [],
          note: null,
        })
      }
      const day = dayMap.get(task.date)!
      day.tasks.push(task)
      if (task.completed) {
        day.tasks_completed++
      }
    })

    // Convertir a eventos de FullCalendar
    const calendarEvents = Array.from(dayMap.values()).map((day) => ({
      id: day.date,
      title: `${day.tasks_completed}`,
      date: day.date,
      extendedProps: {
        energy: day.energy_level,
        tasksCompleted: day.tasks_completed,
        tasks: day.tasks,
        note: day.note,
      },
      backgroundColor: getEnergyColor(day.energy_level),
      borderColor: 'transparent',
      textColor: '#e5e5e5',
    }))

    setEvents(calendarEvents)
  }

  const getEnergyColor = (energy: number): string => {
    if (energy >= 3) return '#4a5c4a' // Verde apagado
    if (energy === 2) return '#3a3a3a' // Gris neutro
    return '#2a2a2a' // Gris frío
  }

  const handleDateClick = (info: any) => {
    const clickedDate = info.dateStr
    const today = new Date().toISOString().split('T')[0]

    // Si es futuro, no hacer nada
    if (clickedDate > today) {
      return
    }

    // Si es hoy, redirigir a /today
    if (clickedDate === today) {
      router.push('/today')
      return
    }

    // Si es pasado, mostrar modal
    const event = events.find((e) => e.id === clickedDate)
    if (event) {
      setSelectedDay({
        date: clickedDate,
        energy_level: event.extendedProps.energy,
        tasks_completed: event.extendedProps.tasksCompleted,
        tasks: event.extendedProps.tasks,
        note: event.extendedProps.note,
      })
      setShowModal(true)
    }
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getEnergyLabel = (level: number): string => {
    if (level >= 3) return 'Alta'
    if (level === 2) return 'Media'
    return 'Baja'
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-text mb-2">Calendario</h1>
          <p className="text-text-muted">Vista de tu historial diario</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            locale="es"
            height="auto"
            eventDisplay="block"
            displayEventTime={false}
            dayMaxEvents={false}
            eventContent={(eventInfo) => (
              <div className="text-center text-sm font-medium py-1">
                {eventInfo.event.title}
              </div>
            )}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDay && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-text mb-1">
                {formatDate(selectedDay.date)}
              </h2>
              <p className="text-text-muted text-sm">
                Energía: {getEnergyLabel(selectedDay.energy_level)}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-text-muted mb-2">
                Tareas ({selectedDay.tasks_completed}/{selectedDay.tasks.length})
              </h3>
              <div className="space-y-1.5">
                {selectedDay.tasks.length > 0 ? (
                  selectedDay.tasks.map((task, i) => (
                    <div
                      key={i}
                      className={`text-sm ${
                        task.completed ? 'text-text line-through' : 'text-text-muted'
                      }`}
                    >
                      {task.completed ? '✓' : '○'} {task.title}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted italic">Sin tareas</p>
                )}
              </div>
            </div>

            {selectedDay.note && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-text-muted mb-2">Nota</h3>
                <p className="text-sm text-text">{selectedDay.note}</p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 bg-accent hover:bg-accent-hover rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
