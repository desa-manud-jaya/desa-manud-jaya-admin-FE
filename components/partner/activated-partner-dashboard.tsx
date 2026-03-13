"use client";

const topStats = [
  { title: "Total Bookings", value: "2", note: "8.5% Up from last month", accent: "bg-indigo-100" },
  { title: "Active Tour Package", value: "2", note: "1.3% Up from last month", accent: "bg-amber-100" },
  { title: "Total Revenue", value: "5000K", note: "2% Up from last month", accent: "bg-emerald-100" },
  { title: "Average Rating", value: "4.5", note: "1.8% Up from yesterday", accent: "bg-orange-100" },
];

const secondStats = [
  { title: "Upcoming Bookings", value: "1", note: "8.5% Up from last month", accent: "bg-indigo-100" },
  { title: "Pending Bookings", value: "1", note: "8.5% Up from last month", accent: "bg-amber-100" },
  { title: "Eco Status", value: "-", note: "Submit evidence to upgrade", accent: "bg-emerald-50" },
  { title: "Conservation Contribution", value: "1250K", note: "1.8% Up from last month", accent: "bg-emerald-100" },
];

const recentBookings = [
  {
    packageName: "A Day Adventure in Manud",
    guest: "Marjolaine",
    date: "12.03.2026",
    participants: "1",
    amount: "Rp 275.000",
    status: "Confirmed",
  },
  {
    packageName: "A Day Adventure in Manud",
    guest: "Harry",
    date: "14.03.2026",
    participants: "3",
    amount: "Rp 825.000",
    status: "Pending",
  },
];

const chartPoints =
  "20,170 70,160 120,145 170,110 220,125 270,105 320,135 370,118 420,90 470,70 520,125 570,108 620,120 670,100 720,118 770,92 820,82 870,165 920,150 970,152 1020,112 1070,120 1120,100 1170,88 1220,105 1270,130 1320,102 1370,112 1420,98 1470,108 1520,120 1570,102 1620,90";

function StatCard({
  title,
  value,
  note,
  accent,
}: {
  title: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg text-muted-foreground">{title}</p>
          <p className="mt-3 text-4xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-full ${accent}`} />
      </div>
      <p className="mt-8 text-sm text-emerald-500">{note}</p>
    </div>
  );
}

export function ActivatedPartnerDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {secondStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Booking Performance</h2>
          <button className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground">
            This Month
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/30 bg-muted/20 p-4">
          <svg viewBox="0 0 1700 260" className="h-[260px] w-full">
            <polyline
              fill="rgba(59,130,246,0.12)"
              stroke="none"
              points={`20,220 ${chartPoints} 1620,220`}
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={chartPoints}
            />
          </svg>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recent Bookings</h2>
          <button className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground">
            This Month
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 text-left">
                <th className="px-4 py-4">Package Name</th>
                <th className="px-4 py-4">Guest</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Participants</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-4 py-5">{booking.packageName}</td>
                  <td className="px-4 py-5">{booking.guest}</td>
                  <td className="px-4 py-5">{booking.date}</td>
                  <td className="px-4 py-5">{booking.participants}</td>
                  <td className="px-4 py-5">{booking.amount}</td>
                  <td className="px-4 py-5">
                    <span
                      className={
                        booking.status === "Confirmed"
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
                          : "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
                      }
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}