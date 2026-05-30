import api from './axios'

export const getTugasSaya     = ()         => api.get('/petugas/tugas')
export const getTugasDetail   = (id)       => api.get(`/petugas/tugas/${id}`)
export const mulaiPenanganan  = (id)       => api.put(`/petugas/tugas/${id}/mulai`)
export const submitTindakan   = (id, data) => api.post(`/petugas/tugas/${id}/tindakan`, data)
export const getDashboardPetugas = ()      => api.get('/petugas/dashboard')