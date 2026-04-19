export interface CalEvent {
  id: string
  title: string
  start: string  // ISO string or YYYY-MM-DD for all-day
  end: string
  location?: string
  allDay: boolean
  calendar: 'google' | 'outlook'
  color: string
}

function startOfDayET(daysOffset = 0): Date {
  const now = new Date()
  const etDate = now.toLocaleDateString('sv', { timeZone: 'America/New_York' })
  const [y, m, d] = etDate.split('-').map(Number)
  const base = new Date(Date.UTC(y, m - 1, d + daysOffset, 12, 0, 0))
  const baseStr = base.toISOString().slice(0, 10)
  const etHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      hour12: false,
    }).format(base)
  )
  const offsetHours = 12 - etHour
  return new Date(`${baseStr}T${String(offsetHours).padStart(2, '0')}:00:00Z`)
}

export async function fetchGoogleCalendar(): Promise<CalEvent[]> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return []

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
      cache: 'no-store',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenData: any = await tokenRes.json()
    console.log('[gcal] token response:', JSON.stringify(tokenData))
    const accessToken: string | undefined = tokenData.access_token
    if (!accessToken) return []

    const params = new URLSearchParams({
      timeMin: startOfDayET(0).toISOString(),
      timeMax: startOfDayET(2).toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '20',
    })

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, next: { revalidate: 1800 } }
    )
    console.log('[gcal] calendar response status:', res.status)
    if (!res.ok) {
      console.log('[gcal] calendar error:', await res.text())
      return []
    }

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.items ?? []).map((item: any): CalEvent => ({
      id: item.id,
      title: item.summary ?? 'Untitled',
      start: item.start?.dateTime ?? item.start?.date ?? '',
      end:   item.end?.dateTime   ?? item.end?.date   ?? '',
      location: item.location,
      allDay: !item.start?.dateTime,
      calendar: 'google',
      color: '#4285F4',
    }))
  } catch {
    return []
  }
}
