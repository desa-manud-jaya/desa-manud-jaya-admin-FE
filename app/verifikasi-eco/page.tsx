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

const ecoVerifications = [
  {
    id: "ECO001",
    packageName: "Go Rafting",
    partnerName: "Golana",
    category: "Aktivitas Outdoor",
    submissionDate: "05/01/2026",
    status: "pending",
    evidence: "3 file",
  },
  {
    id: "ECO002",
    packageName: "Lalala Trekking",
    partnerName: "Michael",
    category: "Homestay",
    submissionDate: "05/01/2026",
    status: "verified",
    evidence: "5 file",
  },
]

export default function EcoVerificationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Verifikasi Eco</h1>

        <TableFilter
          businessTypeOptions={[
            { value: "all", label: "Semua" },
            { value: "outdoor", label: "Aktivitas Outdoor" },
            { value: "homestay", label: "Homestay" },
            { value: "cafe", label: "Kafe" },
          ]}
          statusOptions={[
            { value: "all", label: "Semua" },
            { value: "pending", label: "Menunggu" },
            { value: "verified", label: "Terverifikasi" },
            { value: "rejected", label: "Ditolak" },
          ]}
        />

        <div className="rounded-lg bg-background shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Nama Paket</TableHead>
                <TableHead className="font-semibold">Nama Mitra</TableHead>
                <TableHead className="font-semibold">Kategori</TableHead>
                <TableHead className="font-semibold">Tanggal Pengajuan</TableHead>
                <TableHead className="font-semibold">Bukti</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ecoVerifications.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.packageName}</TableCell>
                  <TableCell>{item.partnerName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.submissionDate}</TableCell>
                  <TableCell>{item.evidence}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "verified"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : item.status === "pending"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {item.status === "verified"
                        ? "Terverifikasi"
                        : item.status === "pending"
                        ? "Menunggu"
                        : "Ditolak"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Tinjau
                      </Button>
                      {item.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            Verifikasi
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                    </div>
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
