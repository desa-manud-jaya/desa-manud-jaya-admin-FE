"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ApprovalModal } from "@/components/dashboard/approval-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const partnerApprovals = [
  {
    id: "PR2026-004",
    businessName: "Go Rafting",
    businessType: "Kafe",
    requestor: "Cahyo",
    submissionDate: "09/02/2026",
    documentStatus: "semua terunggah",
  },
]

const tourPackageApprovals = [
  {
    id: "TP2026-004",
    packageName: "Cool Rafting",
    partnerName: "Go Rafting",
    requestor: "Cahyo",
    category: "Eco",
    price: "Rp 800.000",
    submissionDate: "09/02/2026",
  },
]

const deletionRequests = [
  {
    id: "DEL2026-004",
    packageName: "Cool Rafting",
    businessName: "Go Rafting",
    requestor: "Cahyo",
    submissionDate: "09/02/2026",
    changeType: "HAPUS",
  },
]

interface ApprovalTableProps {
  title: string
  children: React.ReactNode
}

function ApprovalTable({ title, children }: ApprovalTableProps) {
  return (
    <div className="rounded-lg bg-background shadow-sm border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari"
            className="w-[180px] pl-10"
          />
        </div>
      </div>
      {children}
    </div>
  )
}

export default function ApprovalCenterPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"approve" | "reject">("approve")

  const handleApprove = () => {
    setModalType("approve")
    setModalOpen(true)
  }

  const handleReject = () => {
    setModalType("reject")
    setModalOpen(true)
  }

  const handleConfirm = (password: string, reason: string) => {
    console.log("Action:", modalType, "Password:", password, "Reason:", reason)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* A. Partner Approval Queue */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">A. Antrian Persetujuan Mitra</h2>
          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Bisnis</TableHead>
                  <TableHead className="font-semibold">Jenis Bisnis</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">Tanggal Pengajuan</TableHead>
                  <TableHead className="font-semibold">Status Dokumen</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerApprovals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.businessName}</TableCell>
                    <TableCell>{item.businessType}</TableCell>
                    <TableCell>{item.requestor}</TableCell>
                    <TableCell>{item.submissionDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {item.documentStatus}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={handleApprove}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                          onClick={handleReject}
                        >
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={7}>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>

        {/* B. Tour Package Approval Queue */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">B. Antrian Persetujuan Paket Wisata</h2>
          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Paket</TableHead>
                  <TableHead className="font-semibold">Nama Mitra</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Harga</TableHead>
                  <TableHead className="font-semibold">Tanggal Pengajuan</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tourPackageApprovals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.packageName}</TableCell>
                    <TableCell>{item.partnerName}</TableCell>
                    <TableCell>{item.requestor}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.submissionDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={handleApprove}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                          onClick={handleReject}
                        >
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={8}>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>

        {/* C. Deletion / Update Request */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">C. Permintaan Penghapusan / Pembaruan</h2>
          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Paket</TableHead>
                  <TableHead className="font-semibold">Nama Bisnis</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">Tanggal Pengajuan</TableHead>
                  <TableHead className="font-semibold">Jenis Perubahan</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletionRequests.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.packageName}</TableCell>
                    <TableCell>{item.businessName}</TableCell>
                    <TableCell>{item.requestor}</TableCell>
                    <TableCell>{item.submissionDate}</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        {item.changeType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={handleApprove}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                          onClick={handleReject}
                        >
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={7}>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>
      </div>

      <ApprovalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        type={modalType}
        onConfirm={handleConfirm}
      />
    </DashboardLayout>
  )
}
