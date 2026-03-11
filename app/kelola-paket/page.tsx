"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TableFilter } from "@/components/dashboard/table-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const packages = [
  {
    id: "00001",
    packageName: "Go Rafting",
    partnerName: "Golana",
    businessType: "Aktivitas Outdoor",
    category: "Eco",
    price: "Rp 500.000",
    status: "active",
  },
  {
    id: "00002",
    packageName: "Lalala Trekking",
    partnerName: "Michael",
    businessType: "Homestay",
    category: "Non-Eco",
    price: "Rp 500.000",
    status: "inactive",
  },
  {
    id: "00003",
    packageName: "Manud Kuliner Organik",
    partnerName: "Argya",
    businessType: "Kafe",
    category: "Eco",
    price: "Rp 500.000",
    status: "active",
  },
]

export default function PackageManagePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Daftar Paket Wisata</h1>

        <TableFilter
          businessTypeOptions={[
            { value: "all", label: "Semua" },
            { value: "outdoor", label: "Aktivitas Outdoor" },
            { value: "homestay", label: "Homestay" },
            { value: "cafe", label: "Kafe" },
          ]}
        />

        <div className="rounded-lg bg-background shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Nama Paket Wisata</TableHead>
                <TableHead className="font-semibold">Nama Mitra</TableHead>
                <TableHead className="font-semibold">Jenis Bisnis</TableHead>
                <TableHead className="font-semibold">Kategori</TableHead>
                <TableHead className="font-semibold">Harga</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.id}</TableCell>
                  <TableCell>{pkg.packageName}</TableCell>
                  <TableCell>{pkg.partnerName}</TableCell>
                  <TableCell>{pkg.businessType}</TableCell>
                  <TableCell>{pkg.category}</TableCell>
                  <TableCell>{pkg.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={pkg.status === "active" ? "default" : "destructive"}
                      className={
                        pkg.status === "active"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {pkg.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
