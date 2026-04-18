import { NextResponse } from 'next/server'
import { fetchWSJNews } from '@/lib/wsj'

export const revalidate = 3600

export async function GET() {
  try {
    const items = await fetchWSJNews()
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
