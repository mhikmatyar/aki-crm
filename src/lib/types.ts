export interface Customer {
  id: string
  nama: string
  nomor_telp: string
  jenis_mobil: string
  harga_beli: number
  item_dibeli: string
  tanggal_pembelian: string
  reminder_bulan: number
  pernah_claim: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export type KondisiKlaim = 'A' | 'B' | 'C' | 'D'

export const KONDISI_KLAIM_LABELS: Record<KondisiKlaim, string> = {
  A: 'A - Charging',
  B: 'B - Claim ke Distributor',
  C: 'C - Done Charged',
  D: 'D - Rusak',
}

export type ClaimStatus = 'aktif' | 'done'

export interface Claim {
  id: string
  customer_id: string
  posisi_aki: string
  kondisi_klaim: KondisiKlaim
  catatan: string
  tanggal_klaim: string
  status: ClaimStatus
  done_at: string | null
  created_by: string
  updated_by: string | null
  customers?: Customer
}

export interface WaLog {
  id: string
  customer_id: string
  nama_customer: string
  nomor_telp: string
  jenis_mobil: string
  tanggal_pembelian: string
  durasi_saat_kirim: number
  pesan_dikirim: string
  dikirim_oleh: string
  waktu_kirim: string
}

export interface UserProfile {
  id: string
  email: string
  role: 'super_admin' | 'admin'
  nama: string
  aktif: boolean
}

export type ReminderFilter = 'all' | '3' | '6' | '12' | '18' | '24'
