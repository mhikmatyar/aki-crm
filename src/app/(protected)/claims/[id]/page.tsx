import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { KONDISI_KLAIM_LABELS, KondisiKlaim } from '@/lib/types'
import DoneClaimButton from '@/components/claims/DoneClaimButton'
import DeleteButton from '@/components/ui/DeleteButton'
import { customerHref } from '@/lib/customer-code'

export const dynamic = 'force-dynamic'

export default async function ClaimDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  const { data: claim } = await supabase
    .from('claims')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!claim) notFound()

  let customer: any = null
  let purchase: any = null

  if (claim.customer_profile_id) {
    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', claim.customer_profile_id)
      .single()
    customer = data
  } else if (claim.customer_id) {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('id', claim.customer_id)
      .single()
    customer = data
  }

  if (claim.vehicle_purchase_id) {
    const { data } = await supabase
      .from('vehicle_purchases')
      .select('*, vehicles(*)')
      .eq('id', claim.vehicle_purchase_id)
      .single()
    purchase = data
  }

  const customerLink = customer?.kode_customer
    ? customerHref(customer)
    : `/customers/${customer?.id}`

  const kondisiColors: Record<string, string> = {
    A: 'bg-blue-100 text-blue-700',
    B: 'bg-orange-100 text-orange-700',
    C: 'bg-green-100 text-green-700',
    D: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link
          href="/claims"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={16} />
          Kembali ke Database Klaim
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Klaim</h1>
            <p className="text-gray-500 text-sm mt-1">
              {customer?.nama} — {formatDate(claim.tanggal_klaim)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {claim.status === 'aktif' && (
              <DoneClaimButton claimId={claim.id} userId={user.id} />
            )}
            {claim.status === 'done' && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
                <CheckCircle size={16} />
                Selesai
              </span>
            )}
            {isSuperAdmin && (
              <DeleteButton table="claims" id={claim.id} redirectTo="/claims" label="Hapus Klaim" />
            )}
          </div>
        </div>
      </div>

      {claim.status === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Klaim Telah Diselesaikan</p>
            <p className="text-xs text-green-600 mt-0.5">
              Diselesaikan pada {formatDateTime(claim.done_at)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Data Customer</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Nama</p>
            <Link href={customerLink} className="font-medium text-blue-600 hover:underline">
              {customer?.nama}
            </Link>
          </div>
          <div>
            <p className="text-gray-400 text-xs">No. Telepon</p>
            <p className="font-medium text-gray-900">{customer?.nomor_telp}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Kendaraan</p>
            <p className="font-medium text-gray-900">
              {purchase?.vehicles?.jenis_mobil || customer?.jenis_mobil || '-'}
              {purchase?.vehicles?.plat_nomor && ` - ${purchase.vehicles.plat_nomor}`}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Item Aki</p>
            <p className="font-medium text-gray-900">
              {purchase ? `${purchase.merek_aki} ${purchase.tipe_aki}` : customer?.item_dibeli || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Detail Klaim</h2>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Kondisi Klaim</p>
              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${kondisiColors[claim.kondisi_klaim]}`}>
                {KONDISI_KLAIM_LABELS[claim.kondisi_klaim as KondisiKlaim]}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Status</p>
              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                claim.status === 'done'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {claim.status === 'done' ? 'Selesai' : 'Aktif'}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Posisi Aki</p>
              <p className="font-medium text-gray-900">{claim.posisi_aki}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tanggal Klaim</p>
              <p className="font-medium text-gray-900">{formatDate(claim.tanggal_klaim)}</p>
            </div>
          </div>

          {claim.catatan && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Catatan</p>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{claim.catatan}</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Dibuat: {formatDateTime(claim.created_at)}</p>
            {claim.done_at && <p>Diselesaikan: {formatDateTime(claim.done_at)}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
