'use client'

import { useEffect, useState } from 'react'

export default function LocationLabel() {
  const [location, setLocation] = useState('...')

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const city = data.address?.city ?? data.address?.town ?? data.address?.village ?? ''
          const stateCode = data.address?.['ISO3166-2-lvl4']?.split('-')[1] ?? ''
          setLocation(city && stateCode ? `${city}, ${stateCode}` : city || stateCode || 'Unknown')
        } catch {
          setLocation('Unknown')
        }
      },
      () => setLocation('Unknown')
    )
  }, [])

  return <span>{location}</span>
}
