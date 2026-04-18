import { NextResponse } from 'next/server'
import { fetchStockQuotes } from '@/lib/stocks'

export const revalidate = 3600

export async function GET() {
  try {
    const quotes = await fetchStockQuotes()
    return NextResponse.json(quotes)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
