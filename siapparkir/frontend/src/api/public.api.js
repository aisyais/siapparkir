import api from './axios'

export const kirimLaporan = (formData) =>
  api.post('/laporan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const cekStatusLaporan = (kode) =>
  api.get(`/laporan/cek?kode=${kode}`)

export const getKategori = () =>
  api.get('/kategori')

export const kirimPenilaian = (data) => api.post('/penilaian', data);