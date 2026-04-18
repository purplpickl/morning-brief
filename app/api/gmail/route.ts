import { NextResponse } from 'next/server'
import { fetchDailyReads } from '@/lib/gmail'

export const revalidate = 3600

export async function GET() {
  try {
    const threads = await fetchDailyReads()
    return NextResponse.json(threads)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
