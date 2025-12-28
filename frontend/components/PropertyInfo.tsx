/**
 * Property information component (address, WiFi, map)
 */
import { MapPin, Wifi, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface Property {
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  wifi_ssid?: string
  wifi_password?: string
}

interface PropertyInfoProps {
  property: Property
  locale: 'it' | 'en'
}

export default function PropertyInfo({ property, locale }: PropertyInfoProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`

  // WiFi QR code format: WIFI:T:WPA;S:SSID;P:PASSWORD;;
  const wifiQR = property.wifi_ssid && property.wifi_password
    ? `WIFI:T:WPA;S:${property.wifi_ssid};P:${property.wifi_password};;`
    : null

  return (
    <div className="space-y-8">
      {/* Address Card */}
      <div className="glass-card ring-1 ring-brand-brass/5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-ivory rounded-2xl text-brand-brass shadow-sm border border-brand-brass/10">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-brand-midnight mb-2">{property.name}</h3>
              <p className="text-brand-midnight/60 leading-relaxed italic">
                {property.address}<br />
                {property.city}
              </p>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 text-brand-brass/40 hover:text-brand-brass transition-colors"
            aria-label={locale === 'it' ? 'Apri in Google Maps' : 'Open in Google Maps'}
          >
            <ExternalLink className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* WiFi Card */}
      {wifiQR && (
        <div className="glass-card ring-1 ring-brand-brass/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-ivory rounded-2xl text-brand-brass shadow-sm border border-brand-brass/10">
              <Wifi className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-serif text-brand-midnight mb-6">WiFi</h3>

              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                <div className="space-y-6 flex-1 w-full text-center sm:text-left">
                  <div>
                    <div className="text-[10px] text-brand-brass/60 uppercase tracking-[0.2em] mb-2">
                      {locale === 'it' ? 'Rete' : 'Network'}
                    </div>
                    <div className="text-lg font-medium text-brand-midnight">
                      {property.wifi_ssid}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-brand-brass/60 uppercase tracking-[0.2em] mb-2">
                      {locale === 'it' ? 'Password' : 'Password'}
                    </div>
                    <div className="text-lg font-medium text-brand-midnight">
                      {property.wifi_password}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-brand-brass/10 shadow-glass-hover">
                  <QRCodeSVG value={wifiQR} size={120} fgColor="#0F172A" />
                  <p className="text-[9px] text-center mt-3 text-brand-midnight/40 tracking-wider">
                    {locale === 'it' ? 'SCANSIONA PER CONNETTERTI' : 'SCAN TO CONNECT'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
