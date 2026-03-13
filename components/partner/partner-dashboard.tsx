"use client";

import Link from "next/link";
import {
  AlertCircle,
  Clock3,
  Image as ImageIcon,
  Lock,
  TrendingUp,
  Users,
  Paperclip,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  partnerBusinessProfileMock,
  partnerDocumentsMock,
  getPartnerActivationProgress,
} from "@/lib/partner-mock";

const stats = [
  {
    title: "Total Bookings",
    value: "-",
    subtitle: "Locked",
    icon: <Users className="h-6 w-6 text-indigo-500" />,
    iconBg: "bg-indigo-100",
  },
  {
    title: "Active Listings",
    value: "-",
    subtitle: "Locked",
    icon: <ImageIcon className="h-6 w-6 text-amber-500" />,
    iconBg: "bg-amber-100",
  },
  {
    title: "Total Revenue",
    value: "-",
    subtitle: "Locked",
    icon: <TrendingUp className="h-6 w-6 text-emerald-500" />,
    iconBg: "bg-emerald-100",
  },
  {
    title: "Eco-Certified Status",
    value: "-",
    subtitle: "Locked",
    icon: <Clock3 className="h-6 w-6 text-orange-400" />,
    iconBg: "bg-orange-100",
  },
];

export function PartnerDashboard() {
  const progress = getPartnerActivationProgress(
    partnerBusinessProfileMock,
    partnerDocumentsMock
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-border bg-background p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg text-muted-foreground">{stat.title}</p>
                <p className="mt-3 text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${stat.iconBg}`}
              >
                {stat.icon}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-lg text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>{stat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-8 w-8 text-orange-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-foreground">
              Account Activation Required
            </h2>
            <p className="mt-1 text-xl italic text-foreground/80">
              Please complete your business profile and upload required documents.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black">
            !
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-foreground">{progress}%</p>
            <p className="text-sm text-muted-foreground">
              Account Verification Progress
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-yellow-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        <Link
          href="/profil-bisnis"
          className="rounded-full bg-emerald-600 px-8 py-4 text-xl font-semibold text-white shadow-md transition hover:bg-emerald-700"
        >
          Complete Activation
        </Link>

        <Link
          href="/verifikasi-dokumen"
          className="rounded-full bg-amber-600 px-8 py-4 text-xl font-semibold text-white shadow-md transition hover:bg-amber-700"
        >
          View Requirements
        </Link>
      </div>

      <div
        id="requirements"
        className="mx-auto max-w-3xl rounded-2xl border border-border bg-background p-4"
      >
        <h3 className="mb-4 text-xl font-semibold text-foreground">
          Document Requirements
        </h3>

        <div className="overflow-hidden rounded-xl border border-border">
          {partnerDocumentsMock.map((doc) => (
            <div
              key={doc.key}
              className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg text-foreground">
                  {doc.label}
                  {doc.required ? "*" : " (Optional)"}
                </span>
              </div>

              {doc.uploaded ? (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}