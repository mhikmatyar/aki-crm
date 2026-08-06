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
  customer_id: string | null
  customer_profile_id?: string | null
  vehicle_purchase_id?: string | null
  posisi_aki: string
  kondisi_klaim: KondisiKlaim
  catatan: string
  tanggal_klaim: string
  status: ClaimStatus
  done_at: string | null
  created_by: string
  updated_by: string | null
  customers?: Customer
  customer_profiles?: CustomerProfile | null
  vehicle_purchases?: {
    id: string
    merek_aki: string
    tipe_aki: string
    harga_beli?: number
    tanggal_pembelian?: string
    vehicles?: {
      id: string
      customer_id?: string
      jenis_mobil: string
      plat_nomor: string | null
    } | null
  } | null
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

// ============================================================
// NEW HIERARCHY TYPES - Phase 1 Implementation
// ============================================================

export interface CustomerProfile {
  id: string
  kode_customer: string | null
  nama: string
  nomor_telp: string
  catatan_umum: string | null
  is_agen: boolean
  detail_agen: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Vehicle {
  id: string
  customer_id: string
  plat_nomor: string | null
  jenis_mobil: string
  merek_mobil: string | null
  created_at: string
  updated_at: string
}

export type WarrantyStatus = 'valid' | 'expired'

export interface VehiclePurchase {
  id: string
  vehicle_id: string
  tipe_aki: string
  merek_aki: string
  harga_beli: number
  tanggal_pembelian: string
  lokasi_cabang: string | null
  durasi_garansi_bulan: number
  status_garansi: WarrantyStatus
  tukar_tambah: boolean
  catatan_transaksi: string | null
  reminder_bulan: number
  created_at: string
  updated_at: string
  created_by: string | null
  branches?: {
    id: string
    nama_cabang: string
    kota: string
  } | null
}

// Combined type for customer with vehicles and purchases
export interface CustomerWithVehicles extends CustomerProfile {
  vehicles?: VehicleWithPurchases[]
}

export interface VehicleWithPurchases extends Vehicle {
  purchases?: VehiclePurchase[]
  customer_profile?: CustomerProfile
}

export interface PurchaseWithDetails extends VehiclePurchase {
  vehicle?: Vehicle
  branch?: {
    id: string
    nama_cabang: string
    kota: string
  }
}

// View type for customer_full_details
export interface CustomerFullDetails {
  customer_id: string
  customer_nama: string
  nomor_telp: string
  catatan_umum: string | null
  is_agen: boolean
  detail_agen: string | null
  vehicle_id: string | null
  plat_nomor: string | null
  jenis_mobil: string | null
  merek_mobil: string | null
  purchase_id: string | null
  tipe_aki: string | null
  merek_aki: string | null
  harga_beli: number | null
  tanggal_pembelian: string | null
  durasi_garansi_bulan: number | null
  status_garansi: WarrantyStatus | null
  tukar_tambah: boolean | null
  reminder_bulan: number | null
  catatan_transaksi: string | null
  lokasi_cabang_nama: string | null
  usia_bulan: number | null
  reminder_status: 'ok' | 'upcoming' | 'overdue' | null
}

// Form types for UI
export interface CustomerProfileFormData {
  nama: string
  nomor_telp: string
  catatan_umum?: string
  is_agen?: boolean
  detail_agen?: string
}

export interface VehicleFormData {
  customer_id: string
  plat_nomor?: string
  jenis_mobil: string
  merek_mobil?: string
}

export interface VehiclePurchaseFormData {
  vehicle_id: string
  tipe_aki: string
  merek_aki: string
  harga_beli: number
  tanggal_pembelian: string
  lokasi_cabang?: string
  durasi_garansi_bulan?: number
  tukar_tambah?: boolean
  catatan_transaksi?: string
  reminder_bulan?: number
}

// Age-based filter types
export type PurchaseAgeFilter = 'all' | '<3' | '3-6' | '6-12' | '12-18' | '>18'

export const PURCHASE_AGE_LABELS: Record<PurchaseAgeFilter, string> = {
  'all': 'Semua Usia',
  '<3': 'Kurang dari 3 bulan',
  '3-6': '3-6 bulan',
  '6-12': '6-12 bulan',
  '12-18': '12-18 bulan',
  '>18': 'Lebih dari 18 bulan',
}
