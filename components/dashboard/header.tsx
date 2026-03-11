"use client"

import { useState } from "react"
import { Bell, ChevronDown, Key, LogOut, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const notifications = [
  {
    id: 1,
    title: "Perlu Ditinjau!",
    message: "Mitra telah meminta perubahan pada paket wisata. Mohon tinjau dan ambil tindakan pada permintaan ini.",
    time: "baru",
    icon: "partner",
  },
  {
    id: 2,
    title: "Perlu Ditinjau!",
    message: "Ada mitra baru yang meminta aktivasi akun. Mohon tinjau dan ambil tindakan pada permintaan ini.",
    time: "11.40",
    icon: "package",
  },
]

interface HeaderProps {
  onLogoutClick?: () => void
}

export function Header({ onLogoutClick }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false)

  return (
    <header className="fixed left-[200px] right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="relative w-[400px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari"
          className="pl-10 bg-muted/50"
        />
      </div>

      <div className="flex items-center gap-4">
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <button className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-[10px] text-white">
                6
              </Badge>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="end">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">Notifikasi</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 border-b border-border p-4 hover:bg-muted/50"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.icon === "partner" ? "bg-emerald-100" : "bg-amber-100"
                  }`}>
                    {notification.icon === "partner" ? (
                      <User className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Bell className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3 text-center">
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Lihat semua notifikasi
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Roy" />
                <AvatarFallback>RY</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">Roy</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4 text-blue-500" />
              Kelola Akun
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Key className="mr-2 h-4 w-4 text-amber-500" />
              Ubah Kata Sandi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogoutClick} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
