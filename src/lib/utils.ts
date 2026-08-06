import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { addMonths, isAfter, differenceInMonths, format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id })
  } catch {
    return '-'
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy HH:mm', { locale: id })
  } catch {
    return '-'
  }
}

export function isReminderOverdue(tanggalPembelian: string, reminderBulan: number): boolean {
  try {
    const purchaseDate = parseISO(tanggalPembelian)
    const reminderDate = addMonths(purchaseDate, reminderBulan)
    return isAfter(new Date(), reminderDate)
  } catch {
    return false
  }
}

export function getDurasiSejak(tanggalPembelian: string): number {
  try {
    const purchaseDate = parseISO(tanggalPembelian)
    return differenceInMonths(new Date(), purchaseDate)
  } catch {
    return 0
  }
}

export function getReminderStatus(tanggalPembelian: string, reminderBulan: number): {
  isOverdue: boolean
  durasi: number
  label: string
  color: 'red' | 'amber' | 'green' | 'gray'
} {
  const durasi = getDurasiSejak(tanggalPembelian)
  const isOverdue = isReminderOverdue(tanggalPembelian, reminderBulan)
  const monthsUntilReminder = reminderBulan - durasi

  if (isOverdue) {
    return {
      isOverdue: true,
      durasi,
      label: `Terlambat ${durasi - reminderBulan} bln`,
      color: 'red',
    }
  } else if (monthsUntilReminder <= 1) {
    return {
      isOverdue: false,
      durasi,
      label: `${monthsUntilReminder} bln lagi`,
      color: 'amber',
    }
  } else {
    return {
      isOverdue: false,
      durasi,
      label: `${monthsUntilReminder} bln lagi`,
      color: 'green',
    }
  }
}

export function getWarrantyStatus(
  tanggalPembelian: string,
  durasiGaransiBulan: number
): 'valid' | 'expired' {
  try {
    const purchaseDate = parseISO(tanggalPembelian)
    const warrantyEndDate = addMonths(purchaseDate, durasiGaransiBulan || 0)
    return isAfter(new Date(), warrantyEndDate) ? 'expired' : 'valid'
  } catch {
    return 'expired'
  }
}

export function buildWAMessage(params: {
  nama: string
  jenisMobil: string
  tanggalPembelian: string
  durasiSaatKirim: number
  namaToko: string
  tahap?: number
}): string {
  const { nama, jenisMobil, tanggalPembelian, durasiSaatKirim, namaToko, tahap = 1 } = params
  
  if (tahap === 2) {
    return `Halo ${nama},

Kami dari ${namaToko} ingin menanyakan kembali perihal pengingat pengecekan aki kendaraan *${jenisMobil}* Anda (pembelian *${formatDate(tanggalPembelian)}* - usia aki *${durasiSaatKirim} bulan*).

Jika Anda memiliki waktu luang, silakan jadwalkan pengecekan gratis ke toko kami agar kondisi aki mobil tetap prima dan memperpanjang umur pakainya. 😊🔋`
  }

  return `Halo ${nama},

Kami dari ${namaToko} ingin mengingatkan bahwa aki kendaraan *${jenisMobil}* Anda yang dibeli pada *${formatDate(tanggalPembelian)}* sudah berjalan selama *${durasiSaatKirim} bulan*.

Sudah saatnya dilakukan pengecekan kondisi aki Anda. Silakan kunjungi toko kami atau hubungi kami untuk informasi lebih lanjut.

Terima kasih atas kepercayaan Anda! 🔋`
}

export function buildWALink(nomorTelp: string, pesan: string): string {
  const cleanNumber = nomorTelp.replace(/\D/g, '')
  const numberWithCountryCode = cleanNumber.startsWith('0')
    ? '62' + cleanNumber.slice(1)
    : cleanNumber.startsWith('62')
    ? cleanNumber
    : '62' + cleanNumber
  return `https://wa.me/${numberWithCountryCode}?text=${encodeURIComponent(pesan)}`
}
