"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TableFilter } from "@/components/dashboard/table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthSessionFromBrowser } from "@/lib/auth";
import { isPartnerActivated, partnerBusinessProfileMock } from "@/lib/partner-mock";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock } from "lucide-react";

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
];

export default function PackageManagePage() {
  const currentUser = useMemo(() => getAuthSessionFromBrowser(), []);
  const isPartner = currentUser?.role === "partner";
  const canAccessUpload = isPartnerActivated(partnerBusinessProfileMock);

  if (isPartner && !canAccessUpload) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Kelola Paket</h1>

          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Fitur upload paket masih terkunci
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Sebelum dapat mengupload konten destinasi atau paket wisata,
                  Anda harus melengkapi Business Profile dan Document Verification terlebih dahulu.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/profil-bisnis"
                    className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white transition hover:bg-blue-600"
                  >
                    Lengkapi Business Profile
                  </Link>

                  <Link
                    href="/verifikasi-dokumen"
                    className="rounded-lg border border-border px-5 py-3 font-medium text-foreground transition hover:bg-muted"
                  >
                    Upload Dokumen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
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
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
  );
}