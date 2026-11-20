'use client'

import { useState } from 'react'
import { FileSpreadsheet, Loader2 } from 'lucide-react'

export default function ExportExcelButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      // Trigger download
      const response = await fetch('/api/customers/export')
      if (response.status === 403) {
        alert('Hanya Owner atau Super Admin yang dapat mengekspor data customer.')
        return
      }
      if (!response.ok) {
        throw new Error('Gagal mengunduh file Excel')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Data-Customer-Pusat-Aki-${new Date().toISOString().split('T')[0]}.xls`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal mengekspor data ke Excel. Silakan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-xs disabled:opacity-60"
      title="Download seluruh data customer dan pembelian ke format Microsoft Excel"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Mengunduh...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel</span>
        </>
      )}
    </button>
  )
}

