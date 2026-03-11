"use client"

import { Filter, RotateCcw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface FilterOption {
  value: string
  label: string
}

interface TableFilterProps {
  onSearch?: (value: string) => void
  onDateChange?: (value: string) => void
  onBusinessTypeChange?: (value: string) => void
  onStatusChange?: (value: string) => void
  onReset?: () => void
  businessTypeOptions?: FilterOption[]
  statusOptions?: FilterOption[]
  searchPlaceholder?: string
}

export function TableFilter({
  onSearch,
  onDateChange,
  onBusinessTypeChange,
  onStatusChange,
  onReset,
  businessTypeOptions = [
    { value: "all", label: "Semua" },
    { value: "outdoor", label: "Aktivitas Outdoor" },
    { value: "homestay", label: "Homestay" },
    { value: "cafe", label: "Kafe" },
  ],
  statusOptions = [
    { value: "all", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Tidak Aktif" },
  ],
  searchPlaceholder = "Cari",
}: TableFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-background p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filter</span>
      </div>

      <Select onValueChange={onDateChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tanggal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hari Ini</SelectItem>
          <SelectItem value="week">Minggu Ini</SelectItem>
          <SelectItem value="month">Bulan Ini</SelectItem>
          <SelectItem value="year">Tahun Ini</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={onBusinessTypeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Jenis Bisnis" />
        </SelectTrigger>
        <SelectContent>
          {businessTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        onClick={onReset}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset Filter
      </Button>

      <div className="ml-auto relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="w-[200px] pl-10"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
    </div>
  )
}
