const KEY = 'sp_riwayat'

export const getRiwayat = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export const tambahRiwayat = (kode) => {
  const existing = getRiwayat()
  if (!existing.includes(kode)) {
    const updated = [kode, ...existing].slice(0, 20)
    localStorage.setItem(KEY, JSON.stringify(updated))
  }
}

export const hapusRiwayat = (kode) => {
  const updated = getRiwayat().filter(k => k !== kode)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export const clearRiwayat = () => localStorage.removeItem(KEY)