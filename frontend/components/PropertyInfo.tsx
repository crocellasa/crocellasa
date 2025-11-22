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
    <div className="space-y-6">
      {/* Address Card */}
      <div className="glass-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-mono-100 rounded-lg text-mono-900">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-mono-900 mb-1">{property.name}</h3>
              <p className="text-sm text-mono-500 leading-relaxed">
                {property.address}<br />
                {property.city}
              </p>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-mono-400 hover:text-mono-900 transition-colors"
            aria-label={locale === 'it' ? 'Apri in Google Maps' : 'Open in Google Maps'}
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* WiFi Card */}
      {wifiQR && (
        <div className="glass-card">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-mono-100 rounded-lg text-mono-900">
              <Wifi className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-mono-900 mb-4">WiFi</h3>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="text-xs text-mono-400 uppercase tracking-wider mb-1">
                      {locale === 'it' ? 'Rete' : 'Network'}
                    </div>
                    <div className="font-mono text-sm bg-white/50 px-3 py-1.5 rounded border border-glass-border inline-block">
                      {property.wifi_ssid}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-mono-400 uppercase tracking-wider mb-1">
                      {locale === 'it' ? 'Password' : 'Password'}
                    </div>
                    <div className="font-mono text-sm bg-white/50 px-3 py-1.5 rounded border border-glass-border inline-block">
                      {property.wifi_password}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-glass-border shadow-sm">
                  <QRCodeSVG value={wifiQR} size={100} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
