export const formatTanggal = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const formatTanggalPendek = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export const STATUS_LABEL = {
  menunggu_verifikasi: 'Menunggu Verifikasi',
  diverifikasi:        'Diverifikasi',
  ditolak:             'Ditolak',
  ditugaskan:          'Ditugaskan',
  dalam_penanganan:    'Dalam Penanganan',
  tidak_ditemukan:     'Tidak Ditemukan',
  ditindak:            'Ditindak',
  selesai:             'Selesai',
}

export const STATUS_COLOR = {
  menunggu_verifikasi: 'bg-yellow-100 text-yellow-800',
  diverifikasi:        'bg-blue-100 text-blue-800',
  ditolak:             'bg-red-100 text-red-800',
  ditugaskan:          'bg-purple-100 text-purple-800',
  dalam_penanganan:    'bg-orange-100 text-orange-800',
  tidak_ditemukan:     'bg-gray-100 text-gray-800',
  ditindak:            'bg-teal-100 text-teal-800',
  selesai:             'bg-green-100 text-green-800',
}

export const PRIORITAS_COLOR = {
  rendah: 'bg-gray-100 text-gray-700',
  sedang: 'bg-yellow-100 text-yellow-700',
  tinggi: 'bg-red-100 text-red-700',
}

export const PRIORITAS_LABEL = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi',
}