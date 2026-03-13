"use client";

import { useMemo, useState } from "react";
import { Clock3, Image as ImageIcon, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  partnerTourPackagesMock,
  type PartnerTourPackage,
} from "@/lib/partner-mock";
import { TourPackageFormModal } from "@/components/partner/tour-package-form-modal";

type PackageRequestType = "ADD NEW" | "UPDATE" | "DELETION";
type PackageRequestStatus = "Processing" | "Approved" | "Rejected";

type PackageRequestRecord = {
  id: string;
  packageName: string;
  category: string;
  date: string;
  type: PackageRequestType;
  feedback: string;
  status: PackageRequestStatus;
};

function formatRequestDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function PartnerTourPackageManager() {
  const [packages, setPackages] = useState<PartnerTourPackage[]>(partnerTourPackagesMock);
  const [requests, setRequests] = useState<PackageRequestRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PartnerTourPackage | null>(null);
  const [actionMode, setActionMode] = useState<"create" | "edit" | "delete">("create");

  const featuredPackage = useMemo(() => packages[0] ?? null, [packages]);

  const openCreateModal = () => {
    setActionMode("create");
    setEditingPackage(null);
    setModalOpen(true);
  };

  const openEditModal = (pkg: PartnerTourPackage) => {
    setActionMode("edit");
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const openDeleteModal = (pkg: PartnerTourPackage) => {
    setActionMode("delete");
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const addRequestRecord = (values: PartnerTourPackage, type: PackageRequestType) => {
    const newRecord: PackageRequestRecord = {
      id: String(requests.length + 1).padStart(5, "0"),
      packageName: values.title,
      category: values.category,
      date: formatRequestDate(),
      type,
      feedback: "-",
      status: "Processing",
    };

    setRequests((prev) => [newRecord, ...prev]);
  };

  const handleCompleteAction = ({
    action,
    values,
  }: {
    action: "create" | "edit" | "delete";
    values: PartnerTourPackage;
  }) => {
    if (action === "create") {
      setPackages((prev) => [...prev, values]);
      addRequestRecord(values, "ADD NEW");
      return;
    }

    if (action === "edit") {
      setPackages((prev) =>
        prev.map((item) => (item.id === values.id ? values : item))
      );
      addRequestRecord(values, "UPDATE");
      return;
    }

    // delete request: tidak langsung hapus paket, hanya submit request deletion
    addRequestRecord(values, "DELETION");
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-foreground">My Tour Package</h1>

      {featuredPackage && (
        <div className="max-w-md rounded-3xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span>{featuredPackage.duration}</span>
          </div>

          <h2 className="mt-5 text-3xl font-bold text-foreground">
            {featuredPackage.title}
          </h2>

          <p className="mt-2 text-5xl font-bold text-foreground">
            {featuredPackage.price}
            <span className="ml-2 text-3xl font-normal text-muted-foreground">
              / Person
            </span>
          </p>

          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 font-semibold uppercase text-muted-foreground">
              Include:
            </p>

            <ul className="space-y-2 text-lg text-foreground/80">
              {featuredPackage.includedItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button
            className="mt-6 h-12 w-full rounded-xl bg-emerald-700 text-lg hover:bg-emerald-800"
            onClick={() => openEditModal(featuredPackage)}
          >
            See Details →
          </Button>
        </div>
      )}

      <div className="border-t border-border pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            My Tour Package List
          </h2>

          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={openCreateModal}
          >
            Add New Package
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 text-left text-sm font-semibold text-foreground">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Tour Package Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-t border-border">
                  <td className="px-6 py-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border">
                      <ImageIcon className="h-7 w-7 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-6 py-5">{pkg.title}</td>
                  <td className="px-6 py-5">{pkg.category}</td>
                  <td className="px-6 py-5">{pkg.price}/Person</td>
                  <td className="px-6 py-5">{pkg.availability}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(pkg)}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(pkg)}
                        className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada paket wisata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-foreground">
          Tracking Progress Verification
        </h2>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center text-blue-600">
              <div className="h-5 w-5 rounded-full bg-blue-600" />
              <span className="mt-2 text-xs text-muted-foreground">Added</span>
            </div>

            <div className="mx-3 h-1 flex-1 bg-blue-300" />

            <div className="flex flex-col items-center text-yellow-500">
              <div className="h-5 w-5 rounded-full bg-yellow-500" />
              <span className="mt-2 text-xs text-muted-foreground">Review</span>
            </div>

            <div className="mx-3 h-1 flex-1 bg-border" />

            <div className="flex flex-col items-center text-muted-foreground">
              <div className="h-5 w-5 rounded-full border border-border bg-background" />
              <span className="mt-2 text-xs text-muted-foreground">Success</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 text-left text-sm font-semibold text-foreground">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">TOUR PACKAGE NAME</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">TYPE</th>
                <th className="px-6 py-4">FEEDBACK</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>

            <tbody>
              {requests.length > 0 ? (
                requests.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-6 py-5">{item.id}</td>
                    <td className="px-6 py-5">{item.packageName}</td>
                    <td className="px-6 py-5">{item.category}</td>
                    <td className="px-6 py-5">{item.date}</td>
                    <td className="px-6 py-5">{item.type}</td>
                    <td className="px-6 py-5">{item.feedback}</td>
                    <td className="px-6 py-5">
                      <span className="rounded-md bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    Belum ada request verifikasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 text-sm text-foreground">
          <p className="font-semibold">Notes</p>
          <p className="mt-2 text-muted-foreground">
            ⏳ Verification takes 1–2 business days after submission.
            <br />
            Admin will notify you via email once your account is approved.
          </p>
        </div>
      </div>

      <TourPackageFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={actionMode}
        initialData={editingPackage}
        onComplete={handleCompleteAction}
      />
    </div>
  );
}