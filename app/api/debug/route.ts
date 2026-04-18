import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // step 1: get access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) return NextResponse.json({ step: 'token', error: tokenData })

    const token = tokenData.access_token

    // step 2: list labels
    const labelsRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const labelsData = await labelsRes.json()
    if (!labelsRes.ok) return NextResponse.json({ step: 'labels', error: labelsData })

    return NextResponse.json({
      ok: true,
      labels: labelsData.labels?.map((l: { name: string; id: string }) => l.name),
    })
  } catch (e) {
    return NextResponse.json({ step: 'exception', error: String(e) })
  }
}
