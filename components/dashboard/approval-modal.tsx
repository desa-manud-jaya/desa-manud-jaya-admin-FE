"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApprovalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "approve" | "reject"
  onConfirm: (password: string, reason: string) => void
}

export function ApprovalModal({
  open,
  onOpenChange,
  type,
  onConfirm,
}: ApprovalModalProps) {
  const [password, setPassword] = useState("")
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    onConfirm(password, reason)
    setPassword("")
    setReason("")
    onOpenChange(false)
  }

  const isApprove = type === "approve"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isApprove
              ? "Apakah Anda yakin ingin menyetujui permintaan ini?"
              : "Apakah Anda yakin ingin menolak permintaan persetujuan ini?"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="password" className="w-20 text-right">
              Kata Sandi:
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan Kata Sandi Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="reason" className="w-20 text-right">
              Alasan:
            </Label>
            <Input
              id="reason"
              placeholder="Masukkan Alasan"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            className={isApprove ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isApprove ? "Setujui" : "Tolak"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
