"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, Package, FileText, AlertTriangle, TrendingUp } from "lucide-react"

const statsRow1 = [
  {
    title: "Pendaftaran Mitra Menunggu",
    value: 2,
    trend: { value: 8.5, isUp: true, label: "Naik dari bulan lalu" },
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    iconBgColor: "bg-indigo-100",
  },
  {
    title: "Persetujuan Paket Wisata Menunggu",
    value: 2,
    trend: { value: 1.3, isUp: true, label: "Naik dari bulan lalu" },
    icon: <Package className="h-6 w-6 text-amber-600" />,
    iconBgColor: "bg-amber-100",
  },
  {
    title: "Permintaan Penghapusan Menunggu",
    value: 1,
    trend: { value: 4.3, isUp: false, label: "Turun dari bulan lalu" },
    icon: <FileText className="h-6 w-6 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
  },
  {
    title: "Paket Dilaporkan",
    value: 0,
    trend: { value: 1, isUp: false, label: "Turun dari bulan lalu" },
    icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
    iconBgColor: "bg-red-100",
  },
]

const statsRow2 = [
  {
    title: "Mitra Aktif",
    value: 1,
    trend: { value: 8.5, isUp: true, label: "Naik dari bulan lalu" },
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    iconBgColor: "bg-indigo-100",
  },
  {
    title: "Paket Wisata Aktif",
    value: 1,
    trend: { value: 8.5, isUp: true, label: "Naik dari bulan lalu" },
    icon: <Package className="h-6 w-6 text-amber-600" />,
    iconBgColor: "bg-amber-100",
  },
  {
    title: "Verifikasi Eco Menunggu",
    value: "-",
    action: { label: "Tinjau bukti" },
    icon: <FileText className="h-6 w-6 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
  },
  {
    title: "Total Pendapatan Platform",
    value: "7000K",
    trend: { value: 1.8, isUp: true, label: "Naik dari bulan lalu" },
    icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
    iconBgColor: "bg-emerald-100",
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dasbor</h1>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsRow1.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsRow2.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              action={stat.action}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
