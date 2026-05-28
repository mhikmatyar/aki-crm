import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Zap,
  Building2,
  Crown,
  MessageCircle,
  BarChart3,
  Users,
  ShieldCheck,
  Phone,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Harga & Paket — AKI CRM',
  description: 'Pilih paket AKI CRM yang sesuai kebutuhan toko Anda.',
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Untuk toko aki dengan 1 cabang',
    icon: Zap,
    price: 0,
    priceNote: 'Gratis selamanya',
    color: 'gray',
    popular: false,
    features: [
      { label: '1 Cabang', included: true },
      { label: 'Hingga 500 data customer', included: true },
      { label: 'Input & kelola data customer', included: true },
      { label: 'Reminder WA manual (deeplink)', included: true },
      { label: 'Log pengiriman WhatsApp', included: true },
      { label: 'Manajemen klaim aki', included: true },
      { label: 'Dashboard ringkasan', included: true },
      { label: 'Multi-cabang', included: false },
      { label: 'Laporan konsolidasi lintas cabang', included: false },
      { label: 'Manajemen multi-user admin', included: false },
      { label: 'Prioritas dukungan teknis', included: false },
    ],
    cta: 'Mulai Gratis',
    ctaHref: '/login',
    ctaStyle: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Untuk toko aki dengan beberapa cabang',
    icon: Building2,
    price: 299000,
    priceNote: 'per bulan',
    color: 'blue',
    popular: true,
    features: [
      { label: 'Hingga 5 Cabang', included: true },
      { label: 'Data customer tidak terbatas', included: true },
      { label: 'Input & kelola data customer', included: true },
      { label: 'Reminder WA manual (deeplink)', included: true },
      { label: 'Log pengiriman WhatsApp', included: true },
      { label: 'Manajemen klaim aki', included: true },
      { label: 'Dashboard ringkasan', included: true },
      { label: 'Multi-cabang', included: true },
      { label: 'Laporan konsolidasi lintas cabang', included: true },
      { label: 'Manajemen multi-user admin', included: true },
      { label: 'Prioritas dukungan teknis', included: false },
    ],
    cta: 'Coba 14 Hari Gratis',
    ctaHref: '/login',
    ctaStyle: 'solid',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Untuk jaringan toko aki skala besar',
    icon: Crown,
    price: 599000,
    priceNote: 'per bulan',
    color: 'amber',
    popular: false,
    features: [
      { label: 'Cabang tidak terbatas', included: true },
      { label: 'Data customer tidak terbatas', included: true },
      { label: 'Input & kelola data customer', included: true },
      { label: 'Reminder WA manual (deeplink)', included: true },
      { label: 'Log pengiriman WhatsApp', included: true },
      { label: 'Manajemen klaim aki', included: true },
      { label: 'Dashboard ringkasan', included: true },
      { label: 'Multi-cabang', included: true },
      { label: 'Laporan konsolidasi lintas cabang', included: true },
      { label: 'Manajemen multi-user admin', included: true },
      { label: 'Prioritas dukungan teknis', included: true },
    ],
    cta: 'Hubungi Kami',
    ctaHref: 'https://wa.me/6281234567890?text=Halo%2C+saya+tertarik+paket+Enterprise+AKI+CRM',
    ctaStyle: 'amber',
  },
]

const highlights = [
  {
    icon: MessageCircle,
    title: 'Reminder WhatsApp Mudah',
    desc: 'Kirim pesan reminder ke customer langsung dari dashboard. Pesan otomatis terisi, tinggal edit dan kirim.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Real-time',
    desc: 'Pantau total customer, klaim aktif, dan jadwal reminder dalam satu halaman ringkasan.',
  },
  {
    icon: Users,
    title: 'Akses Multi-Cabang',
    desc: 'Setiap admin hanya bisa akses data cabangnya. Super Admin pantau semua cabang sekaligus.',
  },
  {
    icon: ShieldCheck,
    title: 'Data Aman & Terjaga',
    desc: 'Powered by Supabase dengan Row Level Security. Data tiap cabang terisolasi dan aman.',
  },
]

const faqs = [
  {
    q: 'Apakah saya perlu kartu kredit untuk paket Starter?',
    a: 'Tidak. Paket Starter 100% gratis, tidak perlu kartu kredit atau data pembayaran.',
  },
  {
    q: 'Bagaimana cara upgrade dari Starter ke Pro?',
    a: 'Hubungi kami via WhatsApp dan kami akan bantu proses upgrade. Data Anda tetap aman dan tidak perlu input ulang.',
  },
  {
    q: 'Apakah ada masa percobaan untuk paket Pro?',
    a: 'Ya, paket Pro tersedia masa uji coba 14 hari gratis tanpa perlu kartu kredit.',
  },
  {
    q: 'Apakah bisa integrasi dengan Accurate atau software kasir lain?',
    a: 'Saat ini belum tersedia. AKI CRM difokuskan untuk manajemen customer dan klaim aki, terpisah dari sistem kasir.',
  },
  {
    q: 'Bagaimana dengan backup data?',
    a: 'Supabase menyediakan backup harian otomatis. Data Anda tidak akan hilang meskipun ada gangguan.',
  },
  {
    q: 'Apakah bisa diakses dari HP?',
    a: 'Ya. AKI CRM dirancang responsive dan bisa diakses dari browser HP tanpa perlu instal aplikasi.',
  },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">AKI CRM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Masuk
            </Link>
            <Link
              href="/login"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-20 pb-12 text-center px-4">
        <span className="inline-block text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Harga Transparan, Tanpa Biaya Tersembunyi
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Pilih Paket yang <br className="hidden md:block" />
          <span className="text-blue-600">Sesuai Toko Anda</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Dari toko aki satu cabang hingga jaringan besar, AKI CRM siap membantu kelola customer dan klaim aki Anda.
        </p>
      </section>

      {/* PRICING CARDS */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isPopular = plan.popular

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                  isPopular
                    ? 'border-blue-600 shadow-xl shadow-blue-100'
                    : 'border-gray-200 shadow-sm'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      PALING POPULER
                    </span>
                  </div>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                    plan.id === 'starter'
                      ? 'bg-gray-100'
                      : plan.id === 'pro'
                      ? 'bg-blue-50'
                      : 'bg-amber-50'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      plan.id === 'starter'
                        ? 'text-gray-500'
                        : plan.id === 'pro'
                        ? 'text-blue-600'
                        : 'text-amber-500'
                    }`}
                  />
                </div>

                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-6">{plan.tagline}</p>

                <div className="mb-6">
                  {plan.price === 0 ? (
                    <div>
                      <span className="text-4xl font-extrabold text-gray-900">Gratis</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-extrabold text-gray-900">
                        {formatRupiah(plan.price)}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">{plan.priceNote}</span>
                    </div>
                  )}
                </div>

                <a
                  href={plan.ctaHref}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors mb-8 block ${
                    plan.ctaStyle === 'solid'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.ctaStyle === 'amber'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Catatan pajak */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Harga belum termasuk PPN 11%. Pembayaran dapat dilakukan via transfer bank atau QRIS.
        </p>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Perbandingan Fitur Lengkap
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Lihat detail perbedaan setiap paket secara lengkap
          </p>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Fitur</th>
                  <th className="text-center px-4 py-4 text-gray-900 font-bold">Starter</th>
                  <th className="text-center px-4 py-4 text-blue-600 font-bold bg-blue-50">Pro</th>
                  <th className="text-center px-4 py-4 text-amber-600 font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Jumlah cabang', starter: '1', pro: 'Hingga 5', enterprise: 'Tidak terbatas' },
                  { label: 'Data customer', starter: 'Maks. 500', pro: 'Tidak terbatas', enterprise: 'Tidak terbatas' },
                  { label: 'Input data customer', starter: true, pro: true, enterprise: true },
                  { label: 'Tombol & log WhatsApp', starter: true, pro: true, enterprise: true },
                  { label: 'Manajemen klaim aki', starter: true, pro: true, enterprise: true },
                  { label: 'Filter durasi reminder', starter: true, pro: true, enterprise: true },
                  { label: 'Badge overdue reminder', starter: true, pro: true, enterprise: true },
                  { label: 'Dashboard statistik', starter: true, pro: true, enterprise: true },
                  { label: 'Akses multi-cabang', starter: false, pro: true, enterprise: true },
                  { label: 'Laporan lintas cabang', starter: false, pro: true, enterprise: true },
                  { label: 'Manajemen akun admin', starter: false, pro: true, enterprise: true },
                  { label: 'Akses via HP (mobile)', starter: true, pro: true, enterprise: true },
                  { label: 'Backup data harian', starter: true, pro: true, enterprise: true },
                  { label: 'Prioritas dukungan teknis', starter: false, pro: false, enterprise: true },
                  { label: 'Onboarding & setup bantuan', starter: false, pro: false, enterprise: true },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-3.5 text-gray-700">{row.label}</td>
                    <td className="px-4 py-3.5 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600 font-medium">{row.starter}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center bg-blue-50/40">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-blue-600 font-semibold">{row.pro}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-amber-600 font-semibold">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Kenapa Pilih AKI CRM?
        </h2>
        <p className="text-gray-500 text-center text-sm mb-10">
          Dirancang khusus untuk kebutuhan toko aki Indonesia
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{h.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{h.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Pertanyaan Umum
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Masih ada pertanyaan? Hubungi kami via WhatsApp.
          </p>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Siap kelola customer toko aki Anda?
          </h2>
          <p className="text-gray-500 mb-8">
            Mulai gratis hari ini — tidak perlu kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Mulai Gratis Sekarang
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%2C+saya+ingin+tahu+lebih+tentang+AKI+CRM"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-xs text-gray-400">
        <p>© 2026 AKI CRM · Sistem Database Customer Toko Aki</p>
        <p className="mt-1">
          <Link href="/login" className="hover:text-gray-600 transition-colors">
            Masuk ke Dashboard
          </Link>
        </p>
      </footer>
    </div>
  )
}
