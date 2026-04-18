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
    const accessToken: string | undefined = tokenData.access_token
    if (!accessToken) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const params = new URLSearchParams({
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '12',
    })

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, next: { revalidate: 1800 } }
    )
    if (!res.ok) return []

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
