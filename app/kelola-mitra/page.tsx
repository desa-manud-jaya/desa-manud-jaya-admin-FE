"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
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

type ApprovedVendorApiItem = {
  userId: string;
  username: string;
  email: string;
  vendorName: string;
  phone: string;
  address: string;
  ktpNumber: string;
};

type PartnerRow = {
  id: string;
  partnerName: string;
  ownerName: string;
  address: string;
  businessType: string;
  joinDate: string;
  status: "active" | "inactive";
};

async function fetchApprovedVendors(
  token: string
): Promise<ApprovedVendorApiItem[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vendors/approved`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const rawText = await response.text();

  let data: unknown = [];

  try {
    data = rawText ? JSON.parse(rawText) : [];
    console.log("GET /admin/vendors/approved RESPONSE:", data);
  } catch {
    throw new Error("Response /admin/vendors/approved tidak valid");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil data approved vendors"
          )
        : "Gagal mengambil data approved vendors";

    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    throw new Error("Format data approved vendors tidak sesuai");
  }

  return data as ApprovedVendorApiItem[];
}

function mapApprovedVendorToRow(item: ApprovedVendorApiItem): PartnerRow {
  return {
    id: item.userId || "-",
    partnerName: item.vendorName || "-",
    // endpoint approved vendors belum kirim ownerName,
    // jadi sementara fallback ke username akun
    ownerName: item.username || "-",
    address: item.address || "-",
    // endpoint belum kirim jenis usaha
    businessType: "-",
    // endpoint belum kirim tanggal join / createdAt
    joinDate: "-",
    // karena endpoint ini khusus approved vendors
    status: "active",
  };
}

export default function PartnerManagePage() {
  const router = useRouter();

  const { hydrated, isAuthenticated, loginUser, token } = useAppSelector(
    (state) => state.auth
  );

  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [errorPartners, setErrorPartners] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hydrated) return;

    if (loginUser?.role !== "ADMIN" || !token) {
      setPartners([]);
      setErrorPartners(null);
      return;
    }

    let isMounted = true;

    const loadApprovedVendors = async () => {
      try {
        setLoadingPartners(true);
        setErrorPartners(null);

        const approvedVendors = await fetchApprovedVendors(token);
        const mappedPartners = approvedVendors.map(mapApprovedVendorToRow);

        console.log("MAPPED APPROVED VENDORS:", mappedPartners);

        if (!isMounted) return;
        setPartners(mappedPartners);
      } catch (error) {
        console.error("LOAD APPROVED VENDORS ERROR:", error);

        if (!isMounted) return;
        setPartners([]);
        setErrorPartners(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data approved vendors"
        );
      } finally {
        if (!isMounted) return;
        setLoadingPartners(false);
      }
    };

    loadApprovedVendors();

    return () => {
      isMounted = false;
    };
  }, [hydrated, loginUser, token]);

  if (!hydrated || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px]" />
      </DashboardLayout>
    );
  }

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

        <div className="rounded-lg border border-border bg-background overflow-hidden shadow-sm">
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
              {loadingPartners ? (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={8}
                  >
                    Memuat data mitra...
                  </TableCell>
                </TableRow>
              ) : errorPartners ? (
                <TableRow>
                  <TableCell className="text-center text-red-500" colSpan={8}>
                    {errorPartners}
                  </TableCell>
                </TableRow>
              ) : partners.length > 0 ? (
                partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.id}</TableCell>
                    <TableCell>{partner.partnerName}</TableCell>
                    <TableCell>{partner.ownerName}</TableCell>
                    <TableCell>{partner.address}</TableCell>
                    <TableCell>{partner.businessType}</TableCell>
                    <TableCell>{partner.joinDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          partner.status === "active"
                            ? "default"
                            : "destructive"
                        }
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
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={8}
                  >
                    Tidak ada data mitra
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}