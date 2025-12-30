import { useEffect, useMemo } from 'react'
import { useRamadanStore } from './store/useRamadanStore'

type RecitationStatus = 'Planifié' | 'Complété' | 'Annulé'

interface CalendarDay {
  id: string
  hijriDay: number
  dateLabel: string
  status: RecitationStatus
  imam: string
  surah: string
  tarawih: boolean
}

const statusStyles: Record<RecitationStatus, string> = {
  Planifié: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  Complété: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
  Annulé: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
}

const imams = [
  {
    name: 'Cheikh Abdellah El Amin',
    speciality: 'Hafs',
    contact: '+33 6 58 22 14 09',
    status: 'Disponible',
    notes: 'Spécialiste des longues récitations.',
    history: '6 khatmas complètes, 18 soirées Tarawih',
  },
  {
    name: 'Imam Nourane Zahir',
    speciality: 'Warsh',
    contact: '+33 6 11 92 31 80',
    status: 'En mission',
    notes: 'Préférences: sourates Médinoises.',
    history: '4 khatmas, 12 soirées Tarawih',
  },
  {
    name: 'Imam Yassine Rahmani',
    speciality: 'Hafs',
    contact: '+33 6 75 44 20 19',
    status: 'Disponible',
    notes: 'Interventions courtes sur les nuits impaires.',
    history: '5 khatmas, 16 soirées Tarawih',
  },
]

const dailySchedule = [
  {
    time: '21:05',
    imam: 'Cheikh Abdellah El Amin',
    surah: 'Al-Baqara 1-74',
    status: 'Complété' as RecitationStatus,
    notes: 'Rythme fluide, congreg. attentive.',
  },
  {
    time: '21:45',
    imam: 'Imam Nourane Zahir',
    surah: 'Al-Baqara 75-141',
    status: 'Planifié' as RecitationStatus,
    notes: 'Prévoir micro additionnel.',
  },
  {
    time: '22:25',
    imam: 'Imam Yassine Rahmani',
    surah: 'Al-Baqara 142-202',
    status: 'Planifié' as RecitationStatus,
    notes: 'Notes sur la tafsir en fin de récitation.',
  },
]

const availability = [
  { day: 'Lundi', slots: ['20:30', '21:00', '21:30'] },
  { day: 'Mercredi', slots: ['20:30', '21:00', '22:00'] },
  { day: 'Vendredi', slots: ['21:00', '21:30', '22:00'] },
]

function buildCalendar(startDate: string): CalendarDay[] {
  const baseDate = new Date(`${startDate}T00:00:00`)
  if (Number.isNaN(baseDate.getTime())) {
    return []
  }

  const statuses: RecitationStatus[] = ['Planifié', 'Complété', 'Planifié', 'Annulé']
  const imamsRotation = ['Cheikh Abdellah El Amin', 'Imam Nourane Zahir', 'Imam Yassine Rahmani']
  const surahRotation = ['Al-Fatiha - Al-Baqara', 'Al-Imran', 'An-Nisa', 'Al-Maida']

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + index)
    return {
      id: `ramadan-${index + 1}`,
      hijriDay: index + 1,
      dateLabel: date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      }),
      status: statuses[index % statuses.length],
      imam: imamsRotation[index % imamsRotation.length],
      surah: surahRotation[index % surahRotation.length],
      tarawih: true,
    }
  })
}

function buildWeeks(days: CalendarDay[], startDate: string) {
  if (!days.length) {
    return [] as (CalendarDay | null)[][]
  }
  const baseDate = new Date(`${startDate}T00:00:00`)
  const offset = (baseDate.getDay() + 6) % 7
  const weeks: (CalendarDay | null)[][] = []
  let currentWeek: (CalendarDay | null)[] = []

  for (let i = 0; i < offset; i += 1) {
    currentWeek.push(null)
  }

  days.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  return weeks
}

function App() {
  const { startDate, theme, setStartDate, toggleTheme } = useRamadanStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const calendarDays = useMemo(() => buildCalendar(startDate), [startDate])
  const calendarWeeks = useMemo(
    () => buildWeeks(calendarDays, startDate),
    [calendarDays, startDate],
  )

  const progressPercent = Math.round((calendarDays.filter((day) => day.status === 'Complété').length / 30) * 100)
  const remainingPages = 604 - Math.floor((progressPercent / 100) * 604)

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-60 flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-md dark:bg-slate-900/70 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              Khatma Planner
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Ramadan 1446</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Organisation Tarawih en temps réel
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm font-medium">
            {['Tableau de bord', 'Calendrier', 'Imams', 'Disponibilités', 'Statistiques'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex items-center justify-between rounded-2xl border border-transparent bg-emerald-50/60 px-4 py-3 text-left text-emerald-800 transition hover:border-emerald-200 hover:bg-emerald-100/70 dark:bg-emerald-500/10 dark:text-emerald-200"
              >
                {item}
                <span className="text-xs text-emerald-500">•</span>
              </button>
            ))}
          </nav>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
            <p className="font-semibold">Synchronisation active</p>
            <p className="mt-2 text-emerald-700 dark:text-emerald-200">
              Dernière mise à jour: aujourd’hui à 18:42.
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                Tableau de bord
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Planification des récitations</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Définissez le premier jour du Ramadan et ajustez automatiquement le calendrier.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Début du Ramadan
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-2xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-emerald-200 dark:text-slate-900"
              >
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white/80 p-5 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Progression globale
              </p>
              <p className="mt-3 text-3xl font-semibold">{progressPercent}%</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                {remainingPages} pages restantes
              </p>
              <div className="mt-4 h-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-3xl bg-white/80 p-5 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Imams actifs
              </p>
              <p className="mt-3 text-3xl font-semibold">12</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                9 disponibles cette semaine
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Récitations ce soir
              </p>
              <p className="mt-3 text-3xl font-semibold">3</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                1 complétée, 2 à venir
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Calendrier mensuel</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Double datation hijri/grégorien, semaine commençant le lundi.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Tarawih
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    Complété
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-7 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="px-2 py-2 text-center">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                {calendarWeeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2">
                    {week.map((day, dayIndex) => (
                      <div
                        key={day ? day.id : `empty-${weekIndex}-${dayIndex}`}
                        className={`min-h-[86px] rounded-2xl border border-transparent p-2 text-xs transition ${
                          day
                            ? 'bg-emerald-50/60 text-slate-700 shadow-sm hover:border-emerald-200 dark:bg-slate-800/60 dark:text-slate-200'
                            : 'bg-transparent'
                        }`}
                      >
                        {day && (
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
                                {day.hijriDay}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400">
                                {day.dateLabel}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-[11px] font-medium">
                              {day.imam}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusStyles[day.status]}`}>
                                {day.status}
                              </span>
                              {day.tarawih && (
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-200">
                                  Tarawih
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
                <h3 className="text-lg font-semibold">Programme du jour</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Ordre de passage des imams et notes logistiques.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {dailySchedule.map((item) => (
                    <div
                      key={`${item.time}-${item.imam}`}
                      className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{item.time}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300">{item.imam}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-200">
                        {item.surah}
                      </p>
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-400">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
                <h3 className="text-lg font-semibold">Disponibilités récurrentes</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Créneaux de 30 minutes configurés par semaine.
                </p>
                <div className="mt-4 space-y-3">
                  {availability.map((slot) => (
                    <div
                      key={slot.day}
                      className="rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{slot.day}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                        {slot.slots.map((time) => (
                          <span
                            key={time}
                            className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur-md dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Gestion des imams</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Profils, spécialisations et historique des récitations.
                </p>
              </div>
              <button
                type="button"
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Ajouter un imam
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {imams.map((imam) => (
                <div
                  key={imam.name}
                  className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold">{imam.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">{imam.speciality}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      {imam.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">{imam.contact}</p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">{imam.notes}</p>
                  <p className="mt-4 text-xs font-medium text-slate-400">{imam.history}</p>
                  <div className="mt-4 flex gap-2 text-xs">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 dark:border-rose-500/30 dark:text-rose-300"
                    >
                      Suspendre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-20 flex w-[90%] -translate-x-1/2 items-center justify-around rounded-full bg-white/90 px-6 py-3 text-xs font-semibold shadow-soft backdrop-blur-md dark:bg-slate-900/90 lg:hidden">
        {['Dashboard', 'Calendrier', 'Imams', 'Alertes'].map((item) => (
          <button key={item} type="button" className="text-slate-500 hover:text-emerald-500 dark:text-slate-300">
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
