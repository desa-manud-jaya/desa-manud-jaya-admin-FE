"use client";

import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PartnerTourPackageManager } from "@/components/partner/partner-tour-package-manager";
import { TableFilter } from "@/components/dashboard/table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const adminPackages = [
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

function AdminPackageManagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        Daftar Paket Wisata
      </h1>

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
              <TableHead className="font-semibold">Tindakan</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {adminPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.id}</TableCell>
                <TableCell>{pkg.packageName}</TableCell>
                <TableCell>{pkg.partnerName}</TableCell>
                <TableCell>{pkg.businessType}</TableCell>
                <TableCell>{pkg.category}</TableCell>
                <TableCell>{pkg.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      pkg.status === "active" ? "default" : "destructive"
                    }
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
  );
}

function VendorPackageLockedState({ isPending }: { isPending: boolean }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Tour Package</h1>

      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-3 ${
              isPending ? "bg-emerald-100" : "bg-yellow-100"
            }`}
          >
            {isPending ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            ) : (
              <Lock className="h-6 w-6 text-yellow-600" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {isPending
                ? "Documents Submitted Successfully"
                : "Fitur upload paket masih terkunci"}
            </h2>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isPending
                ? "We will review your documents before you can manage and upload tour packages."
                : "Sebelum dapat mengupload konten destinasi atau paket wisata, Anda harus melengkapi Business Profile dan Document Verification terlebih dahulu."}
            </p>

            {isPending ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/profil-bisnis"
                  className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white transition hover:bg-blue-600"
                >
                  Cek Kembali Business Profile Anda
                </Link>
              </div>
            ):(
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackageManagePage() {
  const { hydrated, loginUser, vendorData } = useAppSelector(
    (state) => state.auth,
  );

  if (!hydrated) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px]" />
      </DashboardLayout>
    );
  }

  const isAdmin = loginUser?.role === "ADMIN";

  if (isAdmin) {
    return (
      <DashboardLayout>
        <AdminPackageManagePage />
      </DashboardLayout>
    );
  }

  const rawStatus =
    vendorData?.status ?? vendorData?.vendorProfile?.approvalStatus ?? "";
  
  const businessId = vendorData?.vendorProfile?.businessId ?? null;

  const isPending = rawStatus === "PENDING";
  const isActivated =
    rawStatus === "APPROVED" ||
    rawStatus === "ACTIVE" ||
    rawStatus === "ACTIVATED";

  console.log("PACKAGE MANAGE loginUser:", loginUser);
  console.log("PACKAGE MANAGE vendorData:", vendorData);
  console.log("PACKAGE MANAGE rawStatus:", rawStatus);
  console.log("PACKAGE MANAGE isPending:", isPending);
  console.log("PACKAGE MANAGE isActivated:", isActivated);

  if (!isActivated) {
    return (
      <DashboardLayout>
        <VendorPackageLockedState isPending={isPending} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PartnerTourPackageManager />
    </DashboardLayout>
  );
}
