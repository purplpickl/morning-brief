import { CalEvent } from './gcal'

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

export async function fetchOutlookCalendar(): Promise<CalEvent[]> {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REFRESH_TOKEN } = process.env
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_REFRESH_TOKEN) return []

  try {
    const tokenRes = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          refresh_token: MICROSOFT_REFRESH_TOKEN,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/Calendars.Read offline_access',
        }),
        cache: 'no-store',
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenData: any = await tokenRes.json()
    const accessToken: string | undefined = tokenData.access_token
    if (!accessToken) return []

    const params = new URLSearchParams({
      startDateTime: startOfDayET(0).toISOString(),
      endDateTime: startOfDayET(2).toISOString(),
      $orderby: 'start/dateTime',
      $select: 'subject,start,end,location,isAllDay',
      $top: '20',
    })

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, next: { revalidate: 1800 } }
    )
    if (!res.ok) return []

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.value ?? []).map((item: any): CalEvent => {
      const allDay: boolean = item.isAllDay ?? false
      return {
        id: item.id,
        title: item.subject ?? 'Untitled',
        start: allDay
          ? item.start.dateTime.split('T')[0]
          : item.start.dateTime.endsWith('Z')
            ? item.start.dateTime
            : item.start.dateTime + 'Z',
        end: allDay
          ? item.end.dateTime.split('T')[0]
          : item.end.dateTime.endsWith('Z')
            ? item.end.dateTime
            : item.end.dateTime + 'Z',
        location: item.location?.displayName || undefined,
        allDay,
        calendar: 'outlook',
        color: '#0078D4',
      }
    })
  } catch {
    return []
  }
}
