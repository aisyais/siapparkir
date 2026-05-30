import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix icon marker Leaflet di Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Sub-komponen penangkap klik manual di peta
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Sub-komponen pengendali kamera peta secara dinamis (FlyTo)
function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 17, { animate: true, duration: 1.2 })
    }
  }, [center, map])
  return null
}

export default function LocationPicker({ onSelect, value }) {
  const [position, setPosition] = useState(null)
  const [alamat, setAlamat]     = useState('')
  const [akurasi, setAkurasi]   = useState(null)
  const [loadingInternal, setLoadingInternal] = useState(false)

  const defaultCenter = [-5.1477, 119.4327] // Makassar

  // Fungsi pengubah koordinat menjadi deskripsi alamat string via Nominatim API
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`
      )
      const data = await res.json()
      return data.display_name || ''
    } catch {
      return ''
    }
  }

  // Handler utama pemrosesan data koordinat
  const handleLocationSelect = async (lat, lng, acc = null, dipicuDariParent = false) => {
    setLoadingInternal(true)
    setPosition([lat, lng])
    
    const alamatStr = await reverseGeocode(lat, lng)
    setAlamat(alamatStr)
    setAkurasi(acc)
    
    // Kirim balik data teks alamat lengkap ke state form utama di parent
    if (!dipicuDariParent && onSelect) {
      onSelect({ lat, lng, alamat: alamatStr, akurasi: acc })
    } else if (dipicuDariParent && onSelect) {
      // Jika dipicu parent, kirim balik alamat tanpa mengacaukan siklus koordinat lat/lng
      onSelect({ lat, lng, alamat: alamatStr, akurasi: acc })
    }
    
    setLoadingInternal(false)
  }

  // SINKRONISASI: Memantau perubahan koordinat saat tombol "Deteksi Otomatis" atas ditekan
  useEffect(() => {
    if (value && value.lat && value.lng) {
      // Cek apakah koordinat baru berbeda dengan posisi marker saat ini
      const apakahKoordinatBerubah = !position || position[0] !== value.lat || position[1] !== value.lng
      
      if (apakahKoordinatBerubah) {
        handleLocationSelect(value.lat, value.lng, value.akurasi || null, true)
      }
    } else if (value === null) {
      setPosition(null)
      setAlamat('')
      setAkurasi(null)
    }
  }, [value])

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400 mb-1 italic text-right">
        atau klik langsung di peta
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 300 }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          
          {/* Handler Klik Manual */}
          <MapClickHandler onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng, null, false)} />
          
          {/* Handler Pergerakan Kamera Otomatis */}
          <MapController center={position} />
          
          {/* Marker Pin Lokasi */}
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {/* Tampilan Box Hijau/Loading Alamat Detail */}
      {loadingInternal ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 animate-pulse">
          ⏳ Membaca data titik koordinat & mencari nama lokasi...
        </div>
      ) : alamat ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 transition-all animate-fadeIn">
          <span className="font-semibold text-green-700">📍 Lokasi terdeteksi:</span>
          <p className="mt-1 leading-relaxed font-medium">{alamat}</p>
          {akurasi && (
            <p className="text-[10px] text-green-600 mt-1 font-mono">Akurasi deteksi sensor: ±{Math.round(akurasi)} meter</p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">
          Belum ada lokasi terpilih. Tekan tombol "Deteksi Otomatis" di atas atau klik langsung di peta.
        </p>
      )}
    </div>
  )
}