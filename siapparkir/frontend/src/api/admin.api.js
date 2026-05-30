import api from './axios'

// Laporan
export const getLaporanList  = (params) => api.get('/admin/laporan', { params })
export const getLaporanDetail = (id)    => api.get(`/admin/laporan/${id}`)
export const verifikasiLaporan = (id, data) => api.put(`/admin/laporan/${id}/verifikasi`, data)
export const tolakLaporan    = (id, data)   => api.put(`/admin/laporan/${id}/tolak`, data)
export const tugaskanLaporan = (id, data)   => api.post(`/admin/laporan/${id}/tugaskan`, data)

// Petugas
export const getPetugasList  = ()       => api.get('/admin/petugas')
export const buatPetugas     = (data)   => api.post('/admin/petugas', data)
export const updatePetugas   = (id, data) => api.put(`/admin/petugas/${id}`, data)
export const toggleStatusPetugas = (id) => api.put(`/admin/petugas/${id}/toggle-status`)

// Dashboard stats
export const getDashboardStats = () => api.get('/admin/dashboard')

// Wilayah
export const getWilayahList = () => api.get('/admin/wilayah')