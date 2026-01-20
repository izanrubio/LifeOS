'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import './calendar.css'

// Función para obtener la fecha local en formato YYYY-MM-DD
const getLocalDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface DayData {
  date: string
  energy_level: 'low' | 'medium' | 'high' | null
  tasks_completed: number
  tasks: Array<{ title: string; completed: boolean }>
  note: string | null
}

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [todayDate, setTodayDate] = useState(() => getLocalDate())
  const [calendarData, setCalendarData] = useState<Map<string, DayData>>(new Map())
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [activeTab, setActiveTab] = useState<'month' | 'year' | 'insights'>('month')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadCalendarData()
  }, [currentDate])

  useEffect(() => {
    // Verificar cambio de día cada 30 segundos
    const interval = setInterval(() => {
      const newToday = getLocalDate()
      if (newToday !== todayDate) {
        console.log('Día cambiado en calendario de', todayDate, 'a', newToday)
        setTodayDate(newToday)
        loadCalendarData()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [todayDate])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }

  const loadCalendarData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Obtener entradas diarias
    const { data: entries } = await supabase
      .from('daily_entries')
      .select('date, energy_level, note')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])

    // Obtener tareas
    const { data: tasks } = await supabase
      .from('tasks')
      .select('date, title, completed')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])

    // Agrupar por fecha
    const dayMap = new Map<string, DayData>()

    entries?.forEach((entry) => {
      dayMap.set(entry.date, {
        date: entry.date,
        energy_level: entry.energy_level,
        tasks_completed: 0,
        tasks: [],
        note: entry.note,
      })
    })

    tasks?.forEach((task) => {
      if (!dayMap.has(task.date)) {
        dayMap.set(task.date, {
          date: task.date,
          energy_level: null,
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

    setCalendarData(dayMap)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Agregar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const getEnergyClass = (energy: 'low' | 'medium' | 'high' | null): string => {
    if (!energy) return 'bg-slate-600'
    if (energy === 'high') return 'bg-emerald-700'
    if (energy === 'medium') return 'bg-slate-700'
    return 'bg-slate-500'
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    console.log('Click en día:', dateStr, 'Hoy es:', todayDate)
    
    if (dateStr > todayDate) return
    
    if (dateStr === todayDate) {
      router.push('/today')
      return
    }

    const dayData = calendarData.get(dateStr)
    if (dayData) {
      setSelectedDay(dayData)
    } else {
      setSelectedDay({
        date: dateStr,
        energy_level: null,
        tasks_completed: 0,
        tasks: [],
        note: null,
      })
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatSelectedDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getEnergyLabel = (level: 'low' | 'medium' | 'high' | null): string => {
    if (level === 'high') return 'High'
    if (level === 'medium') return 'Medium'
    if (level === 'low') return 'Low'
    return 'Unknown'
  }

  if (!mounted) {
    return null
  }

  const days = getDaysInMonth()
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-emerald-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Calendar */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Reflection Calendar</h1>
              <p className="text-emerald-300/60 text-sm">A retrospective view of your energy and focus.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-emerald-800/30">
              <button
                onClick={() => setActiveTab('month')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'month' 
                    ? 'text-emerald-400' 
                    : 'text-emerald-300/60 hover:text-emerald-300'
                }`}
              >
                Month
                {activeTab === 'month' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('year')}
                className={`pb-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'year' 
                    ? 'text-emerald-400' 
                    : 'text-emerald-300/60 hover:text-emerald-300'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`pb-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'insights' 
                    ? 'text-emerald-400' 
                    : 'text-emerald-300/60 hover:text-emerald-300'
                }`}
              >
                Insights
              </button>
            </div>

            {/* Calendar */}
            <div className="bg-emerald-950/40 backdrop-blur border border-emerald-800/30 rounded-2xl p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">{monthYear}</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="w-8 h-8 flex items-center justify-center text-emerald-300 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-4 py-1.5 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 text-sm rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="w-8 h-8 flex items-center justify-center text-emerald-300 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-3 mb-3">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center text-emerald-400/40 text-xs font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-3">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} />
                  }
                  
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayData = calendarData.get(dateStr)
                  const isToday = dateStr === todayDate
                  const isSelected = selectedDay?.date === dateStr
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative ${
                        getEnergyClass(dayData?.energy_level || null)
                      } ${isToday ? 'ring-2 ring-emerald-400' : ''} ${
                        isSelected ? 'ring-2 ring-white' : ''
                      } hover:opacity-80`}
                    >
                      <span className="text-emerald-100">{day}</span>
                      {dayData && dayData.tasks_completed > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-emerald-800/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-500" />
                  <span className="text-emerald-300/60 text-xs">Low Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-700" />
                  <span className="text-emerald-300/60 text-xs">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-700" />
                  <span className="text-emerald-300/60 text-xs">Focused</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Day Detail */}
          <div className="lg:col-span-1">
            {selectedDay ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Day Detail: {formatSelectedDate(selectedDay.date)}
                </h2>

                {/* Completed Tasks */}
                {selectedDay.tasks.filter(t => t.completed).length > 0 && (
                  <div className="bg-emerald-950/40 backdrop-blur border border-emerald-800/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">
                        Completed Tasks
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selectedDay.tasks.filter(t => t.completed).map((task, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                          <p className="text-emerald-100/80 text-sm">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reflections */}
                {selectedDay.note && (
                  <div className="bg-emerald-950/40 backdrop-blur border border-emerald-800/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">
                        Reflections
                      </h3>
                    </div>
                    <p className="text-emerald-100/60 text-sm italic leading-relaxed">
                      "{selectedDay.note}"
                    </p>
                  </div>
                )}

                {/* Metrics */}
                <div className="bg-emerald-950/40 backdrop-blur border border-emerald-800/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">
                      Metrics
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-emerald-300/60 text-xs mb-1 uppercase tracking-wide">Deep Work</p>
                      <p className="text-white text-2xl font-bold">-</p>
                    </div>
                    <div>
                      <p className="text-emerald-300/60 text-xs mb-1 uppercase tracking-wide">Energy</p>
                      <p className={`text-2xl font-bold ${
                        selectedDay.energy_level === 'high' ? 'text-emerald-400' :
                        selectedDay.energy_level === 'medium' ? 'text-yellow-400' :
                        selectedDay.energy_level === 'low' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {selectedDay.energy_level ? getEnergyLabel(selectedDay.energy_level) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info message */}
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
                  <p className="text-emerald-300/60 text-xs leading-relaxed">
                    Logs are read-only to preserve the integrity of your history. 
                    Reflection is the path to conscious growth.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-emerald-300/40 text-sm">Select a day to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
