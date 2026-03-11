import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, FileText } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    isUp: boolean
    label: string
  }
  icon: React.ReactNode
  iconBgColor: string
  action?: {
    label: string
    onClick?: () => void
  }
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  iconBgColor,
  action,
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-background p-5 shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground leading-tight">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {trend && (
          <div className="flex items-center gap-1">
            {trend.isUp ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend.isUp ? "text-emerald-500" : "text-red-500"
              )}
            >
              {trend.value}%
            </span>
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <FileText className="h-4 w-4" />
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
