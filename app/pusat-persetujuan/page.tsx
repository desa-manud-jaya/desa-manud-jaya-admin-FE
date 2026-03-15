"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ApprovalModal } from "@/components/dashboard/approval-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ApprovalStatus = "pending" | "approved" | "rejected";
type ApprovalAction = "approve" | "reject";
type ApprovalSection = "partner" | "tour" | "deletion";

type PartnerApprovalItem = {
  id: string;
  businessName: string;
  businessType: string;
  requestor: string;
  submissionDate: string;
  documentStatus: string;
  status: ApprovalStatus;
};

type TourPackageApprovalItem = {
  id: string;
  packageName: string;
  partnerName: string;
  requestor: string;
  category: string;
  price: string;
  submissionDate: string;
  status: ApprovalStatus;
};

type DeletionRequestItem = {
  id: string;
  packageName: string;
  businessName: string;
  requestor: string;
  submissionDate: string;
  changeType: string;
  status: ApprovalStatus;
};

const initialPartnerApprovals: PartnerApprovalItem[] = [
  {
    id: "PR2026-004",
    businessName: "Go Rafting",
    businessType: "Kafe",
    requestor: "Cahyo",
    submissionDate: "09/02/2026",
    documentStatus: "Semua terunggah",
    status: "pending",
  },
];

const initialTourPackageApprovals: TourPackageApprovalItem[] = [
  {
    id: "TP2026-004",
    packageName: "Cool Rafting",
    partnerName: "Go Rafting",
    requestor: "Cahyo",
    category: "Eco",
    price: "Rp 800.000",
    submissionDate: "09/02/2026",
    status: "pending",
  },
];

const initialDeletionRequests: DeletionRequestItem[] = [
  {
    id: "DEL2026-004",
    packageName: "Cool Rafting",
    businessName: "Go Rafting",
    requestor: "Cahyo",
    submissionDate: "09/02/2026",
    changeType: "HAPUS",
    status: "pending",
  },
];

interface ApprovalTableProps {
  title: string;
  children: React.ReactNode;
}

function ApprovalTable({ title, children }: ApprovalTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Cari" className="w-[180px] pl-10" />
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Disetujui
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Ditolak
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
      Menunggu
    </Badge>
  );
}

export default function ApprovalCenterPage() {
  const [partnerApprovals, setPartnerApprovals] = useState(
    initialPartnerApprovals,
  );
  const [tourPackageApprovals, setTourPackageApprovals] = useState(
    initialTourPackageApprovals,
  );
  const [deletionRequests, setDeletionRequests] = useState(
    initialDeletionRequests,
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modalType, setModalType] = useState<ApprovalAction>("approve");
  const [selectedItem, setSelectedItem] = useState<{
    section: ApprovalSection;
    id: string;
  } | null>(null);

  const openActionModal = (
    section: ApprovalSection,
    id: string,
    action: ApprovalAction,
  ) => {
    setSelectedItem({ section, id });
    setModalType(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async (password: string, reason: string) => {
    if (!selectedItem) return;

    const nextStatus: ApprovalStatus =
      modalType === "approve" ? "approved" : "rejected";

    console.log("APPROVAL ACTION PAYLOAD:", {
      section: selectedItem.section,
      id: selectedItem.id,
      action: modalType,
      status: nextStatus,
      password,
      reason,
    });

    // TODO:
    // Sambungkan ke API:
    // approve -> PATCH /api/admin/approvals/:id/approve
    // reject  -> PATCH /api/admin/approvals/:id/reject

    if (selectedItem.section === "partner") {
      setPartnerApprovals((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, status: nextStatus } : item,
        ),
      );
    }

    if (selectedItem.section === "tour") {
      setTourPackageApprovals((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, status: nextStatus } : item,
        ),
      );
    }

    if (selectedItem.section === "deletion") {
      setDeletionRequests((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, status: nextStatus } : item,
        ),
      );
    }

    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            A. Antrian Persetujuan Mitra
          </h2>

          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Bisnis</TableHead>
                  <TableHead className="font-semibold">Jenis Bisnis</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">
                    Tanggal Pengajuan
                  </TableHead>
                  <TableHead className="font-semibold">
                    Status Dokumen
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {partnerApprovals.length > 0 ? (
                  partnerApprovals.map((item) => (
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
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Detail
                          </Button>

                          <Button
                            size="sm"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() =>
                              openActionModal("partner", item.id, "approve")
                            }
                            disabled={item.status !== "pending"}
                          >
                            Setujui
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              openActionModal("partner", item.id, "reject")
                            }
                            disabled={item.status !== "pending"}
                          >
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            B. Antrian Persetujuan Paket Wisata
          </h2>

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
                  <TableHead className="font-semibold">
                    Tanggal Pengajuan
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tourPackageApprovals.length > 0 ? (
                  tourPackageApprovals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.packageName}</TableCell>
                      <TableCell>{item.partnerName}</TableCell>
                      <TableCell>{item.requestor}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.submissionDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Detail
                          </Button>

                          <Button
                            size="sm"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() =>
                              openActionModal("tour", item.id, "approve")
                            }
                            disabled={item.status !== "pending"}
                          >
                            Setujui
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              openActionModal("tour", item.id, "reject")
                            }
                            disabled={item.status !== "pending"}
                          >
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={9}
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            C. Permintaan Penghapusan / Pembaruan
          </h2>

          <ApprovalTable title="Manajemen Persetujuan">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Paket</TableHead>
                  <TableHead className="font-semibold">Nama Bisnis</TableHead>
                  <TableHead className="font-semibold">Pemohon</TableHead>
                  <TableHead className="font-semibold">
                    Tanggal Pengajuan
                  </TableHead>
                  <TableHead className="font-semibold">
                    Jenis Perubahan
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {deletionRequests.length > 0 ? (
                  deletionRequests.map((item) => (
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
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Detail
                          </Button>

                          <Button
                            size="sm"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() =>
                              openActionModal("deletion", item.id, "approve")
                            }
                            disabled={item.status !== "pending"}
                          >
                            Setujui
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() =>
                              openActionModal("deletion", item.id, "reject")
                            }
                            disabled={item.status !== "pending"}
                          >
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ApprovalTable>
        </section>
      </div>

      <ApprovalModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        type={modalType}
        mode="confirm"
        onConfirm={handleConfirm}
      />

      <ApprovalModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type={modalType}
        mode="success"
      />
    </DashboardLayout>
  );
}
