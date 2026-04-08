"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approve" | "reject";
  mode?: "confirm" | "success";
  onConfirm?: (password: string, reason: string) => void | Promise<void>;
}

export function ApprovalModal({
  open,
  onOpenChange,
  type,
  mode = "confirm",
  onConfirm,
}: ApprovalModalProps) {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    reason?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const isApprove = type === "approve";
  const isSuccessMode = mode === "success";

  useEffect(() => {
    if (!open) {
      setPassword("");
      setReason("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleClose = () => {
    setPassword("");
    setReason("");
    setErrors({});
    setSubmitting(false);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (isSuccessMode || !onConfirm) return;

    const nextErrors: { password?: string; reason?: string } = {};

    if (!password.trim()) {
      nextErrors.password = "Kata sandi wajib diisi.";
    }

    if (!isApprove && !reason.trim()) {
      nextErrors.reason = "Alasan penolakan wajib diisi.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(password, reason);
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isSuccessMode
              ? isApprove
                ? "Berhasil menyetujui permintaan"
                : "Berhasil menolak permintaan"
              : isApprove
              ? "Apakah Anda yakin ingin menyetujui permintaan ini?"
              : "Apakah Anda yakin ingin menolak permintaan persetujuan ini?"}
          </DialogTitle>
        </DialogHeader>

        {isSuccessMode ? (
          <div className="py-2 text-sm text-muted-foreground">
            {isApprove
              ? "Permintaan telah berhasil disetujui."
              : "Permintaan telah berhasil ditolak."}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
              <Label htmlFor="password" className="w-20 pt-3 text-right">
                Kata Sandi:
              </Label>
              <div className="flex-1">
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className="flex-1"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Label htmlFor="reason" className="w-20 pt-3 text-right">
                Alasan:
              </Label>
              <div className="flex-1">
                <Input
                  id="reason"
                  placeholder={
                    isApprove
                      ? "Masukkan alasan (opsional)"
                      : "Masukkan alasan penolakan"
                  }
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrors((prev) => ({ ...prev, reason: undefined }));
                  }}
                  className="flex-1"
                />
                {errors.reason && (
                  <p className="mt-2 text-sm text-red-500">{errors.reason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {isSuccessMode ? (
            <Button
              onClick={handleClose}
              className={isApprove ? "bg-blue-600 hover:bg-blue-700" : ""}
              variant={isApprove ? "default" : "destructive"}
            >
              Oke
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button
                variant={isApprove ? "default" : "destructive"}
                onClick={handleConfirm}
                disabled={submitting}
                className={isApprove ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {submitting ? "Memproses..." : isApprove ? "Setujui" : "Tolak"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}