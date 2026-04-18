export interface GmailThread {
  id: string
  subject: string
  from: string
  snippet: string
  date: string
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`)
  return data.access_token
}

export async function fetchDailyReads(): Promise<GmailThread[]> {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    return []
  }

  const token = await getAccessToken()
  const base = 'https://gmail.googleapis.com/gmail/v1/users/me'

  // find the "Daily Reads" label id
  const labelsRes = await fetch(`${base}/labels`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const labelsData = await labelsRes.json()
  const label = labelsData.labels?.find(
    (l: { name: string; id: string }) =>
      l.name.toLowerCase() === 'daily reads'
  )
  if (!label) return []

  // get today's threads
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const afterEpoch = Math.floor(today.getTime() / 1000)

  const listRes = await fetch(
    `${base}/messages?labelIds=${label.id}&q=after:${afterEpoch}&maxResults=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const listData = await listRes.json()
  const messages = listData.messages ?? []

  const threads: GmailThread[] = await Promise.all(
    messages.slice(0, 10).map(async (msg: { id: string }) => {
      const msgRes = await fetch(
        `${base}/messages/${msg.id}?format=metadata&metadataHeaders=Subject,From,Date`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const msgData = await msgRes.json()
      const headers: { name: string; value: string }[] =
        msgData.payload?.headers ?? []
      const get = (name: string) =>
        headers.find(h => h.name === name)?.value ?? ''

      return {
        id: msg.id,
        subject: get('Subject'),
        from: get('From').replace(/<.*>/, '').trim(),
        snippet: msgData.snippet ?? '',
        date: get('Date'),
      }
    })
  )

  return threads
}
