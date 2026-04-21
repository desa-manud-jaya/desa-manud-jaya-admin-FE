"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Eye,
  UserCheck,
  XCircle,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ApprovalModal } from "@/components/dashboard/approval-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAppSelector } from "@/store/hooks"

type VerificationStatus =
  | "WAITING_VERIFICATION"
  | "CHOOSING_GUIDE"
  | "COMPLETED"
  | "REJECTED"

type ApprovalAction = "approve" | "reject"

type UnpaidBooking = {
  id: string
  bookingCode: string
  travelerName: string
  packageName: string
  phoneNumber: string
  bookingDate: string
  tourDate: string
  paymentDeadlineAt: string
  totalAmount: number
  paymentStatus: "UNPAID" | "EXPIRED"
}

type PaidBooking = {
  id: string
  packageId: string
  bookingCode: string
  travelerName: string
  packageName: string
  phoneNumber: string
  tripDate: string | null
  paymentDate: string
  totalAmount: number
  paymentMethod: string
  paymentProofUrl: string
  rawStatus: string
  verificationStatus: VerificationStatus
  assignedGuideId: string | null
  rejectionReason?: string
}

type LocalGuide = {
  id: string
  username: string
  name: string
  email: string
  phoneNumber: string
  licenseNumber: string
  cvDocumentUrl: string | null
  status: string
  available: boolean
}

function TableSkeletonRows({
  columns,
  rows = 4,
}: {
  columns: number
  rows?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <TableCell
              key={`skeleton-cell-${rowIndex}-${columnIndex}`}
              className="px-6"
            >
              <Skeleton
                className={
                  columnIndex === columns - 1
                    ? "h-9 w-[180px]"
                    : "h-5 w-full max-w-[200px]"
                }
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

type BookingPaymentStatus =
  | "waiting_for_payment"
  | "pending"
  | "approve"
  | "approved"
  | "rejected"
  | "completed"
  | string

type BookingPaymentApiUser = {
  username?: string | null
  email?: string | null
}

type BookingPaymentApiBusiness = {
  name?: string | null
}

type BookingPaymentApiPackage = {
  name?: string | null
  title?: string | null
}

type BookingPaymentApiItem = {
  id: string
  userId: string
  businessId: string
  packageId: string
  guideId: string | null
  tripDate: string | null
  quantity: number
  amount: number
  status: BookingPaymentStatus
  paymentProofUrl: string | null
  paymentUploadedAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
  user?: BookingPaymentApiUser | null
  business?: BookingPaymentApiBusiness | null
  package?: BookingPaymentApiPackage | null
  tourPackage?: BookingPaymentApiPackage | null
}

type BookingPaymentApiResponse = {
  items: BookingPaymentApiItem[]
  page: number
  size: number
  total: number
}

type ApprovedPackageApiItem = {
  id?: string
  _id?: string
  packageId?: string
  name?: string | null
  title?: string | null
  packageName?: string | null
  target?: {
    id?: string
    _id?: string
    packageId?: string
    name?: string | null
    title?: string | null
    packageName?: string | null
  } | null
}

type ApprovedGuideApiItem = {
  userId: string
  username: string
  email: string
  fullName: string
  phone: string
  licenseNumber: string
  cvDocumentUrl: string | null
  status: string
}

function formatDateTime(value: string) {
  if (!value) return "-"

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateOnly(value: string) {
  if (!value) return "-"

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function getVerificationLabel(status: VerificationStatus) {
  switch (status) {
    case "WAITING_VERIFICATION":
      return "Menunggu Verifikasi"
    case "CHOOSING_GUIDE":
      return "Mencari Pemandu Lokal"
    case "COMPLETED":
      return "Completed"
    case "REJECTED":
      return "Ditolak"
  }
}

function getVerificationBadgeClass(status: VerificationStatus) {
  switch (status) {
    case "WAITING_VERIFICATION":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100"
    case "CHOOSING_GUIDE":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100"
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    case "REJECTED":
      return "bg-red-100 text-red-700 hover:bg-red-100"
  }
}

function formatPaymentStatusLabel(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === "waiting_for_payment") return "Waiting For Payment"
  if (normalized === "pending") return "Pending"
  if (normalized === "approve" || normalized === "approved") return "Approved"
  if (normalized === "rejected") return "Rejected"
  if (normalized === "completed") return "Completed"

  return status || "-"
}

function getPaymentStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === "pending") {
    return "bg-amber-100 text-amber-700 hover:bg-amber-100"
  }

  if (normalized === "approve" || normalized === "approved") {
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
  }

  if (normalized === "rejected") {
    return "bg-red-100 text-red-700 hover:bg-red-100"
  }

  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function formatBookingCode(id: string) {
  if (!id) return "-"
  return `BK-${id.slice(-8).toUpperCase()}`
}

function formatTripDateParam(value: string | null) {
  if (!value) return ""
  return value.split("T")[0] ?? value
}

function formatShortId(id: string | null) {
  if (!id) return "-"
  return `${id.slice(0, 6)}..`
}

function getAssignedGuideLabel(
  guide: LocalGuide | null | undefined,
  guideId: string | null,
) {
  if (guide?.name) return guide.name
  if (guideId) return "Nama guide belum tersedia"
  return "-"
}

function getPackageName(
  item: BookingPaymentApiItem,
  packageNameById: Record<string, string> = {},
) {
  return (
    packageNameById[item.packageId] ??
    item.package?.name ??
    item.package?.title ??
    item.tourPackage?.name ??
    item.tourPackage?.title ??
    `Paket ${item.packageId.slice(-6)}`
  )
}

function getTravelerName(item: BookingPaymentApiItem) {
  return item.user?.username ?? item.user?.email ?? item.userId
}

function mapVerificationStatus(item: BookingPaymentApiItem): VerificationStatus {
  const status = item.status.toLowerCase()

  if (status === "pending") return "WAITING_VERIFICATION"
  if (status === "rejected") return "REJECTED"
  if (status === "approve" || status === "approved") {
    return item.guideId ? "COMPLETED" : "CHOOSING_GUIDE"
  }
  if (status === "completed") return "COMPLETED"

  return "WAITING_VERIFICATION"
}

function mapUnpaidBooking(
  item: BookingPaymentApiItem,
  packageNameById: Record<string, string> = {},
): UnpaidBooking {
  return {
    id: item.id,
    bookingCode: formatBookingCode(item.id),
    travelerName: getTravelerName(item),
    packageName: getPackageName(item, packageNameById),
    phoneNumber: item.user?.email ?? "-",
    bookingDate: item.createdAt,
    tourDate: item.tripDate ?? "",
    paymentDeadlineAt: item.updatedAt || item.createdAt,
    totalAmount: item.amount,
    paymentStatus: "UNPAID",
  }
}

function mapPaidBooking(
  item: BookingPaymentApiItem,
  packageNameById: Record<string, string> = {},
): PaidBooking {
  return {
    id: item.id,
    packageId: item.packageId,
    bookingCode: formatBookingCode(item.id),
    travelerName: getTravelerName(item),
    packageName: getPackageName(item, packageNameById),
    phoneNumber: item.user?.email ?? "-",
    tripDate: item.tripDate,
    paymentDate: item.paymentUploadedAt ?? item.updatedAt ?? item.createdAt,
    totalAmount: item.amount,
    paymentMethod: "Upload Bukti Pembayaran",
    paymentProofUrl: item.paymentProofUrl ?? "/placeholder.jpg",
    rawStatus: item.status,
    verificationStatus: mapVerificationStatus(item),
    assignedGuideId: item.guideId,
    rejectionReason: item.reviewNote ?? undefined,
  }
}

function mapApprovedGuide(item: ApprovedGuideApiItem): LocalGuide {
  return {
    id: item.userId,
    username: item.username,
    name: item.fullName || item.username,
    email: item.email,
    phoneNumber: item.phone,
    licenseNumber: item.licenseNumber,
    cvDocumentUrl: item.cvDocumentUrl,
    status: item.status,
    available: item.status.toUpperCase() === "APPROVED",
  }
}

async function fetchBookingPayments(
  token: string,
  status: string,
  page: number,
  size: number,
): Promise<BookingPaymentApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  if (status && status !== "all") {
    params.set("status", status)
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/bookings/payment?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  )

  const rawText = await response.text()
  let data: unknown = null

  try {
    data = rawText ? JSON.parse(rawText) : { items: [], page, size, total: 0 }
  } catch {
    throw new Error("Response /admin/booking/payment tidak valid")
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil booking payment",
          )
        : "Gagal mengambil booking payment"

    throw new Error(message)
  }

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as BookingPaymentApiResponse).items)
  ) {
    throw new Error("Format data booking payment tidak sesuai")
  }

  return data as BookingPaymentApiResponse
}

async function fetchApprovedPackageNames(
  token: string,
): Promise<Record<string, string>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/packages/approved`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  )

  const rawText = await response.text()
  let data: unknown = []

  try {
    data = rawText ? JSON.parse(rawText) : []
  } catch {
    throw new Error("Response /packages/approved tidak valid")
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(
            (data as { message?: string }).message ||
              "Gagal mengambil package approved",
          )
        : "Gagal mengambil package approved"

    throw new Error(message)
  }

  const packageItems = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null
      ? (data as { items?: unknown[]; data?: unknown[] }).items ??
        (data as { items?: unknown[]; data?: unknown[] }).data
      : null

  if (!Array.isArray(packageItems)) {
    throw new Error("Format data package approved tidak sesuai")
  }

  return (packageItems as ApprovedPackageApiItem[]).reduce<
    Record<string, string>
  >((accumulator, item) => {
    const source = item.target ?? item
    const id = source.id ?? source._id ?? source.packageId
    const name = source.name ?? source.title ?? source.packageName

    if (id && name) {
      accumulator[id] = name
    }

    return accumulator
  }, {})
}

async function parseApiResponse(response: Response) {
  const rawText = await response.text()

  if (!rawText) return null

  try {
    return JSON.parse(rawText)
  } catch {
    return rawText
  }
}

function getApiErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "object" && data !== null && "message" in data) {
    return String((data as { message?: string }).message || fallbackMessage)
  }

  if (typeof data === "string" && data.trim() !== "") {
    return data
  }

  return fallbackMessage
}

async function submitPaymentDecision(
  token: string,
  bookingId: string,
  decision: ApprovalAction,
  note: string,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/bookings/payment/${bookingId}/decision`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        decision,
        note,
      }),
    },
  )

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Gagal memproses keputusan pembayaran"),
    )
  }

  return data
}

async function fetchApprovedGuides(
  token: string,
  tripDate = "",
): Promise<LocalGuide[]> {
  const params = new URLSearchParams()

  if (tripDate) {
    params.set("tripDate", tripDate)
  }

  const query = params.toString()

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/guides/approved${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  )

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Gagal mengambil guide approved"))
  }

  if (!Array.isArray(data)) {
    throw new Error("Format data approved guide tidak sesuai")
  }

  return (data as ApprovedGuideApiItem[]).map(mapApprovedGuide)
}

async function assignGuideToPackage(
  token: string,
  bookingId: string,
  guideId: string,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/bookings/${bookingId}/assign-guide?guideId=${encodeURIComponent(
      guideId,
    )}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  )

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Gagal assign guide"))
  }

  return data
}

export default function PaymentVerificationPage() {
  const { token, loginUser, sessionPassword } = useAppSelector(
    (state) => state.auth,
  )
  const [unpaidBookings, setUnpaidBookings] = useState<UnpaidBooking[]>([])
  const [paidBookings, setPaidBookings] = useState<PaidBooking[]>([])
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [bookingPage, setBookingPage] = useState(0)
  const [bookingTotal, setBookingTotal] = useState(0)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [unpaidSearch, setUnpaidSearch] = useState("")
  const [paidSearch, setPaidSearch] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<PaidBooking | null>(
    null,
  )
  const [bookingForGuide, setBookingForGuide] = useState<PaidBooking | null>(
    null,
  )
  const [selectedGuideId, setSelectedGuideId] = useState("")
  const [guideDirectory, setGuideDirectory] = useState<LocalGuide[]>([])
  const [approvedGuides, setApprovedGuides] = useState<LocalGuide[]>([])
  const [loadingApprovedGuides, setLoadingApprovedGuides] = useState(false)
  const [approvedGuidesError, setApprovedGuidesError] = useState<string | null>(
    null,
  )
  const [assigningGuide, setAssigningGuide] = useState(false)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decisionSuccessOpen, setDecisionSuccessOpen] = useState(false)
  const [decisionSuccessType, setDecisionSuccessType] =
    useState<ApprovalAction>("approve")
  const [selectedDecision, setSelectedDecision] = useState<{
    booking: PaidBooking
    action: ApprovalAction
  } | null>(null)

  useEffect(() => {
    if (loginUser?.role !== "ADMIN" || !token) {
      setUnpaidBookings([])
      setPaidBookings([])
      setBookingTotal(0)
      return
    }

    let isMounted = true

    const loadBookingPayments = async () => {
      try {
        setLoadingBookings(true)
        setBookingError(null)

        const [response, packageNameById] = await Promise.all([
          fetchBookingPayments(token, paymentStatusFilter, bookingPage, 10),
          fetchApprovedPackageNames(token).catch((error) => {
            console.error("LOAD APPROVED PACKAGE NAMES ERROR:", error)
            return {} as Record<string, string>
          }),
        ])

        if (!isMounted) return

        const unpaidItems = response.items.filter(
          (item) => item.status.toLowerCase() === "waiting_for_payment",
        )
        const paidItems = response.items.filter(
          (item) => item.status.toLowerCase() !== "waiting_for_payment",
        )

        setUnpaidBookings(
          unpaidItems.map((item) => mapUnpaidBooking(item, packageNameById)),
        )
        setPaidBookings(
          paidItems.map((item) => mapPaidBooking(item, packageNameById)),
        )
        setBookingTotal(response.total)
      } catch (error) {
        if (!isMounted) return

        setUnpaidBookings([])
        setPaidBookings([])
        setBookingTotal(0)
        setBookingError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil booking payment",
        )
      } finally {
        if (!isMounted) return
        setLoadingBookings(false)
      }
    }

    loadBookingPayments()

    return () => {
      isMounted = false
    }
  }, [bookingPage, loginUser, paymentStatusFilter, reloadKey, token])

  useEffect(() => {
    if (loginUser?.role !== "ADMIN" || !token) {
      setGuideDirectory([])
      return
    }

    let isMounted = true

    const loadGuideDirectory = async () => {
      try {
        const guides = await fetchApprovedGuides(token)

        if (!isMounted) return
        setGuideDirectory(guides)
      } catch (error) {
        console.error("LOAD GUIDE DIRECTORY ERROR:", error)

        if (!isMounted) return
        setGuideDirectory([])
      }
    }

    loadGuideDirectory()

    return () => {
      isMounted = false
    }
  }, [loginUser, token, reloadKey])

  const guideById = useMemo(() => {
    return new Map(
      [...guideDirectory, ...approvedGuides].map((guide) => [guide.id, guide]),
    )
  }, [approvedGuides, guideDirectory])

  const filteredUnpaidBookings = useMemo(() => {
    const keyword = unpaidSearch.trim().toLowerCase()

    if (!keyword) return unpaidBookings

    return unpaidBookings.filter((booking) =>
      [
        booking.bookingCode,
        booking.travelerName,
        booking.packageName,
        booking.phoneNumber,
        formatDateOnly(booking.tourDate),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    )
  }, [unpaidBookings, unpaidSearch])

  const filteredPaidBookings = useMemo(() => {
    const keyword = paidSearch.trim().toLowerCase()

    if (!keyword) return paidBookings

    return paidBookings.filter((booking) =>
      [
        booking.bookingCode,
        booking.travelerName,
        booking.packageName,
        booking.phoneNumber,
        formatDateOnly(booking.tripDate ?? ""),
        booking.rawStatus,
        getVerificationLabel(booking.verificationStatus),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    )
  }, [paidBookings, paidSearch])

  const openDecisionModal = (booking: PaidBooking, action: ApprovalAction) => {
    setSelectedDecision({ booking, action })
    setDecisionModalOpen(true)
  }

  const handleConfirmPaymentDecision = async (
    password: string,
    note: string,
  ) => {
    if (!selectedDecision) return false

    const trimmedPassword = password.trim()
    const trimmedNote = note.trim()

    if (!trimmedPassword) {
      alert("Password wajib diisi.")
      return false
    }

    if (!trimmedNote) {
      alert("Notes wajib diisi.")
      return false
    }

    if (!sessionPassword) {
      alert("Session password tidak ditemukan. Silakan login ulang.")
      return false
    }

    if (trimmedPassword !== sessionPassword) {
      alert("Password admin tidak sesuai.")
      return false
    }

    if (!token) {
      alert("Token admin tidak ditemukan. Silakan login ulang.")
      return false
    }

    try {
      await submitPaymentDecision(
        token,
        selectedDecision.booking.id,
        selectedDecision.action,
        trimmedNote,
      )

      setDecisionSuccessType(selectedDecision.action)
      setDecisionModalOpen(false)
      setDecisionSuccessOpen(true)
      setSelectedBooking(null)
      setReloadKey((currentKey) => currentKey + 1)
      return true
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal memproses keputusan pembayaran",
      )
      return false
    }
  }

  const loadApprovedGuides = async (tripDate: string) => {
    if (!token) {
      setApprovedGuides([])
      setApprovedGuidesError("Token admin tidak ditemukan. Silakan login ulang.")
      return
    }

    try {
      setLoadingApprovedGuides(true)
      setApprovedGuidesError(null)

      const guides = await fetchApprovedGuides(token, tripDate)

      setApprovedGuides(guides)
    } catch (error) {
      setApprovedGuides([])
      setApprovedGuidesError(
        error instanceof Error ? error.message : "Gagal mengambil guide approved",
      )
    } finally {
      setLoadingApprovedGuides(false)
    }
  }

  const openAssignGuideDialog = (booking: PaidBooking) => {
    const tripDate = formatTripDateParam(booking.tripDate)

    if (!tripDate) {
      alert("Tanggal keberangkatan belum tersedia untuk booking ini.")
      return
    }

    setBookingForGuide(booking)
    setSelectedGuideId(booking.assignedGuideId ?? "")
    loadApprovedGuides(tripDate)
  }

  const handleAssignGuide = async (guideId = selectedGuideId) => {
    if (!bookingForGuide || !guideId) return

    if (!token) {
      alert("Token admin tidak ditemukan. Silakan login ulang.")
      return
    }

    try {
      setAssigningGuide(true)
      setSelectedGuideId(guideId)

      await assignGuideToPackage(token, bookingForGuide.id, guideId)

      setBookingForGuide(null)
      setSelectedGuideId("")
      setReloadKey((currentKey) => currentKey + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal assign guide")
    } finally {
      setAssigningGuide(false)
    }
  }

  const selectedGuide = selectedBooking?.assignedGuideId
    ? guideById.get(selectedBooking.assignedGuideId)
    : null
  const waitingVerificationCount = paidBookings.filter(
    (booking) => booking.verificationStatus === "WAITING_VERIFICATION",
  ).length
  const choosingGuideCount = paidBookings.filter(
    (booking) => booking.verificationStatus === "CHOOSING_GUIDE",
  ).length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Verifikasi Pembayaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data booking payment dari endpoint admin.
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border bg-background p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total transaksi
            </p>
            {loadingBookings ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-foreground">
                {bookingTotal}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <label className="text-sm font-medium text-foreground">
              Filter status
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(event) => {
                setBookingPage(0)
                setPaymentStatusFilter(event.target.value)
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-blue-400 sm:w-[240px]"
            >
              <option value="all">Semua status</option>
              <option value="waiting_for_payment">waiting_for_payment</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="completed">completed</option>
            </select>
          </div>
        </div>

        {bookingError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {bookingError}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Booking Belum Terbayar
              </h2>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Badge className="w-fit bg-red-100 text-red-700 hover:bg-red-100">
                {unpaidBookings.length} waiting_for_payment
              </Badge>
              <Input
                type="search"
                placeholder="Cari booking belum terbayar"
                value={unpaidSearch}
                onChange={(event) => setUnpaidSearch(event.target.value)}
                className="w-full md:w-[280px]"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Kode Booking</TableHead>
                  <TableHead className="font-semibold">Nama Pemesan</TableHead>
                  <TableHead className="font-semibold">Nama Paket</TableHead>
                  <TableHead className="font-semibold">Tanggal Booking</TableHead>
                  <TableHead className="font-semibold">Tanggal Wisata</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingBookings ? (
                  <TableSkeletonRows columns={7} />
                ) : filteredUnpaidBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="py-8 text-center text-muted-foreground"
                      colSpan={7}
                    >
                      Tidak ada booking belum terbayar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnpaidBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.bookingCode}
                      </TableCell>
                      <TableCell>{booking.travelerName}</TableCell>
                      <TableCell>{booking.packageName}</TableCell>
                      <TableCell>{formatDateTime(booking.bookingDate)}</TableCell>
                      <TableCell>{formatDateOnly(booking.tourDate)}</TableCell>
                      <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          Belum Terbayar
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Booking Sudah Dibayar
              </h2>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Badge className="w-fit bg-amber-100 text-amber-700 hover:bg-amber-100">
                {waitingVerificationCount} menunggu verifikasi
              </Badge>
              <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100">
                {choosingGuideCount} Mencari Pemandu Lokal
              </Badge>
              <Input
                type="search"
                placeholder="Cari booking sudah dibayar"
                value={paidSearch}
                onChange={(event) => setPaidSearch(event.target.value)}
                className="w-full md:w-[280px]"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            <Table className="min-w-[1040px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 font-semibold">
                    Kode Booking
                  </TableHead>
                  <TableHead className="px-6 font-semibold">
                    Nama Pemesan
                  </TableHead>
                  <TableHead className="px-6 font-semibold">
                    Tanggal Wisata
                  </TableHead>
                  <TableHead className="px-6 font-semibold">
                    Status Verifikasi
                  </TableHead>
                  <TableHead className="px-6 font-semibold">
                    Pemandu Lokal
                  </TableHead>
                  <TableHead className="w-[320px] px-6 font-semibold">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingBookings ? (
                  <TableSkeletonRows columns={6} />
                ) : filteredPaidBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="py-8 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      Tidak ada booking sudah dibayar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPaidBookings.map((booking) => {
                    const assignedGuide = booking.assignedGuideId
                      ? guideById.get(booking.assignedGuideId)
                      : null

                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="px-6 font-medium">
                          {booking.bookingCode}
                        </TableCell>
                        <TableCell className="px-6">
                          {booking.travelerName}
                        </TableCell>
                        <TableCell className="px-6">
                          {formatDateOnly(booking.tripDate ?? "")}
                        </TableCell>
                        <TableCell className="px-6">
                          <Badge
                            className={getVerificationBadgeClass(
                              booking.verificationStatus,
                            )}
                          >
                            {getVerificationLabel(booking.verificationStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6">
                          {booking.assignedGuideId ? (
                            getAssignedGuideLabel(
                              assignedGuide,
                              booking.assignedGuideId,
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-6">
                          <div className="flex min-w-max flex-nowrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </Button>

                            {booking.verificationStatus ===
                              "WAITING_VERIFICATION" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                                  onClick={() =>
                                    openDecisionModal(booking, "approve")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Setujui
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() =>
                                    openDecisionModal(booking, "reject")
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                  Tolak
                                </Button>
                              </>
                            )}

                            {booking.verificationStatus ===
                              "CHOOSING_GUIDE" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => openAssignGuideDialog(booking)}
                              >
                                <UserCheck className="h-4 w-4" />
                                Pilih Pemandu Lokal
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Halaman {bookingPage + 1} dari endpoint admin.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={bookingPage === 0 || loadingBookings}
              onClick={() => setBookingPage((currentPage) => currentPage - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={
                loadingBookings || (bookingPage + 1) * 10 >= bookingTotal
              }
              onClick={() => setBookingPage((currentPage) => currentPage + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </div>

      <ApprovalModal
        open={decisionModalOpen}
        onOpenChange={(open) => {
          setDecisionModalOpen(open)

          if (!open) {
            setSelectedDecision(null)
          }
        }}
        type={selectedDecision?.action ?? "approve"}
        mode="confirm"
        reasonLabel="Notes"
        requireReason
        onConfirm={handleConfirmPaymentDecision}
      />

      <ApprovalModal
        open={decisionSuccessOpen}
        onOpenChange={setDecisionSuccessOpen}
        type={decisionSuccessType}
        mode="success"
      />

      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Detail Bukti Pembayaran</DialogTitle>
            <DialogDescription>
              Validasi bukti transfer dan informasi booking sebelum tindakan
              berikutnya.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
              <div className="overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={selectedBooking.paymentProofUrl}
                  alt={`Bukti pembayaran ${selectedBooking.bookingCode}`}
                  className="h-full min-h-[320px] w-full object-cover"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Kode Booking"
                  value={selectedBooking.bookingCode}
                />
                <DetailItem
                  label="Nama Pemesan"
                  value={selectedBooking.travelerName}
                />
                <DetailItem
                  label="Nama Paket"
                  value={selectedBooking.packageName}
                />
                <DetailItem
                  label="Nomor Handphone"
                  value={selectedBooking.phoneNumber}
                />
                <DetailItem
                  label="Tanggal Wisata"
                  value={formatDateOnly(selectedBooking.tripDate ?? "")}
                />
                <DetailItem
                  label="Tanggal Pembayaran"
                  value={formatDateTime(selectedBooking.paymentDate)}
                />
                <DetailItem
                  label="Nominal"
                  value={formatCurrency(selectedBooking.totalAmount)}
                />
                <DetailItem
                  label="Metode"
                  value={selectedBooking.paymentMethod}
                />
                <DetailItem
                  label="Status Verifikasi"
                  value={getVerificationLabel(
                    selectedBooking.verificationStatus,
                  )}
                />
                <DetailItem
                  label="Status Payment"
                  value={formatPaymentStatusLabel(selectedBooking.rawStatus)}
                />
                <DetailItem
                  label="Guide Assigned"
                  value={
                    getAssignedGuideLabel(
                      selectedGuide,
                      selectedBooking.assignedGuideId,
                    )
                  }
                />
                {selectedBooking.rejectionReason && (
                  <DetailItem
                    label="Alasan Penolakan"
                    value={selectedBooking.rejectionReason}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bookingForGuide}
        onOpenChange={(open) => {
          if (!open) {
            setBookingForGuide(null)
            setSelectedGuideId("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Assign Guide Lokal</DialogTitle>
            <DialogDescription>
              Pilih satu guide yang tersedia untuk booking{" "}
              {bookingForGuide?.bookingCode ?? "-"}
              {bookingForGuide?.tripDate
                ? ` pada ${formatDateOnly(bookingForGuide.tripDate)}`
                : ""}
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {loadingApprovedGuides ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Memuat guide approved...
              </div>
            ) : approvedGuidesError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {approvedGuidesError}
              </div>
            ) : approvedGuides.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Tidak ada guide approved.
              </div>
            ) : (
              approvedGuides.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  disabled={!guide.available || assigningGuide}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedGuideId === guide.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-border bg-background hover:bg-muted/60"
                  } ${!guide.available ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {guide.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {guide.phoneNumber} - {guide.email}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Lisensi: {guide.licenseNumber || "-"}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {guide.status}
                    </Badge>
                  </div>

                  {guide.cvDocumentUrl && (
                    <a
                      href={guide.cvDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Buka CV
                    </a>
                  )}
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBookingForGuide(null)
                setSelectedGuideId("")
              }}
            >
              Batal
            </Button>
            <Button
              disabled={
                !selectedGuideId || loadingApprovedGuides || assigningGuide
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleAssignGuide()}
            >
              {assigningGuide ? "Memproses..." : "Pilih Pemandu Lokal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
