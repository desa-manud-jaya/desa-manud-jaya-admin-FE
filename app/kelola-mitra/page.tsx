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

const partners = [
  {
    id: "00001",
    partnerName: "Go Rafting",
    ownerName: "Golana",
    address: "Ds. Manud Jaya, RT 01/RW 02",
    businessType: "Aktivitas Outdoor",
    joinDate: "05/01/2026",
    status: "active",
  },
  {
    id: "00002",
    partnerName: "Lalala Trekking",
    ownerName: "Michael",
    address: "Ds. Manud Jaya, RT 02/RW 02",
    businessType: "Homestay",
    joinDate: "05/01/2026",
    status: "inactive",
  },
  {
    id: "00003",
    partnerName: "Manud Kuliner Organik",
    ownerName: "Argya",
    address: "Ds. Manud Jaya, RT 03/RW 03",
    businessType: "Kafe",
    joinDate: "05/01/2026",
    status: "active",
  },
]

export default function PartnerManagePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Daftar Mitra</h1>

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
                <TableHead className="font-semibold">Nama Mitra</TableHead>
                <TableHead className="font-semibold">Nama Pemilik</TableHead>
                <TableHead className="font-semibold">Alamat</TableHead>
                <TableHead className="font-semibold">Jenis Bisnis</TableHead>
                <TableHead className="font-semibold">Bergabung Sejak</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.id}</TableCell>
                  <TableCell>{partner.partnerName}</TableCell>
                  <TableCell>{partner.ownerName}</TableCell>
                  <TableCell>{partner.address}</TableCell>
                  <TableCell>{partner.businessType}</TableCell>
                  <TableCell>{partner.joinDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={partner.status === "active" ? "default" : "destructive"}
                      className={
                        partner.status === "active"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {partner.status === "active" ? "Aktif" : "Tidak Aktif"}
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
