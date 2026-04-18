import { NextResponse } from 'next/server'
import { fetchSportsNews } from '@/lib/sports'

export const revalidate = 3600

export async function GET() {
  try {
    const items = await fetchSportsNews()
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
