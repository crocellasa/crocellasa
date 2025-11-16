/**
 * Property information component (address, WiFi, map)
 */
import { MapPin, Wifi } from 'lucide-react'
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
    <div className="card">
      <h2 className="text-2xl font-serif text-alcova-navy mb-6">
        {locale === 'it' ? 'Informazioni Appartamento' : 'Property Information'}
      </h2>

      {/* Address */}
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-5 h-5 text-alcova-gold mt-1" />
          <div>
            <p className="font-semibold text-alcova-navy">{property.name}</p>
            <p className="text-alcova-charcoal">{property.address}</p>
            <p className="text-alcova-charcoal">{property.city}</p>
          </div>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-alcova-gold hover:text-alcova-brass text-sm underline"
        >
          {locale === 'it' ? 'Apri in Google Maps' : 'Open in Google Maps'}
        </a>
      </div>

      {/* WiFi */}
      {wifiQR && (
        <div className="border-t border-alcova-brass/20 pt-6">
          <div className="flex items-start gap-2 mb-4">
            <Wifi className="w-5 h-5 text-alcova-gold mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-alcova-navy mb-2">WiFi</p>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-alcova-charcoal/60">
                    {locale === 'it' ? 'Rete:' : 'Network:'}
                  </span>{' '}
                  <span className="font-mono text-alcova-navy">
                    {property.wifi_ssid}
                  </span>
                </div>
                <div>
                  <span className="text-alcova-charcoal/60">
                    {locale === 'it' ? 'Password:' : 'Password:'}
                  </span>{' '}
                  <span className="font-mono text-alcova-navy">
                    {property.wifi_password}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG value={wifiQR} size={80} />
              <p className="text-xs text-center text-alcova-charcoal/60 mt-1">
                {locale === 'it' ? 'Scansiona' : 'Scan'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
