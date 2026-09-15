import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Printer,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGetSalesReportQuery } from "../../../features/api/apiSlice";

const ACCENT = "#e8622a";

type RangeKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";

const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom",
};

const fmtNaira = (n: number) => `₦${n.toLocaleString()}`;

const SalesReport = () => {
  const navigate = useNavigate();

  const [range, setRange] = useState<RangeKey>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = useMemo(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const startOfDay = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };
    switch (range) {
      case "today":
        return { from: startOfDay(now).toISOString(), to: endOfDay.toISOString() };
      case "yesterday": {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const yEnd = new Date(y);
        yEnd.setHours(23, 59, 59, 999);
        return { from: startOfDay(y).toISOString(), to: yEnd.toISOString() };
      }
      case "7d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return { from: startOfDay(d).toISOString(), to: endOfDay.toISOString() };
      }
      case "30d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return { from: startOfDay(d).toISOString(), to: endOfDay.toISOString() };
      }
      case "90d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        return { from: startOfDay(d).toISOString(), to: endOfDay.toISOString() };
      }
      case "custom":
        return {
          from: customFrom ? new Date(customFrom).toISOString() : "",
          to: customTo ? new Date(customTo).toISOString() : "",
        };
    }
  }, [range, customFrom, customTo]);

  const skip = !from || !to;
  const { data, isLoading, isError } = useGetSalesReportQuery(
    { from, to },
    { skip },
  );

  const handleExportCSV = () => {
    if (!data?.orders?.length) {
      toast.error("No orders to export");
      return;
    }
    const rows = [
      ["Order ID", "Date", "Customer", "Amount", "Status", "Payment Method", "Reference"],
      ...data.orders.map((o) => [
        o._id,
        new Date(o.createdAt).toISOString(),
        o.user?.email || "Guest",
        o.totalPrice,
        o.status,
        o.paymentMethod || "",
        o.paymentReference || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${from.slice(0, 10)}-to-${to.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              bg-gray-100 dark:bg-white/[0.06]
              border border-gray-200 dark:border-white/10
              text-gray-500 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#e8622a]">
              Admin · Reports
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-[#E7E9EA]">
              Sales Report
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              bg-white dark:bg-white/[0.06] text-emerald-600 dark:text-emerald-400
              border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </header>

      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setRange(k)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              range === k
                ? "text-white border-transparent"
                : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#e8622a]/50"
            }`}
            style={range === k ? { background: ACCENT } : {}}
          >
            {RANGE_LABELS[k]}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E7E9EA]"
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E7E9EA]"
            />
          </div>
        )}
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-black">Sales Report</h1>
        <p className="text-sm text-gray-600">
          {from.slice(0, 10)} to {to.slice(0, 10)}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gray-100 dark:bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="p-8 rounded-2xl text-center text-sm text-red-500 bg-red-50 dark:bg-red-500/10">
          Failed to load report. Please try again.
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Gross Revenue"
              value={fmtNaira(data.summary.grossRevenue)}
              icon={<DollarSign className="w-5 h-5" />}
              color="#e8622a"
            />
            <SummaryCard
              label="Net Revenue"
              value={fmtNaira(data.summary.netRevenue)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="#10b981"
            />
            <SummaryCard
              label="Total Orders"
              value={String(data.summary.totalOrders)}
              icon={<ShoppingBag className="w-5 h-5" />}
              color="#3b82f6"
            />
            <SummaryCard
              label="Average Order Value"
              value={fmtNaira(data.summary.aov)}
              icon={<Receipt className="w-5 h-5" />}
              color="#8b5cf6"
            />
          </div>

          {/* Payment + status breakdown */}
          <div className="grid md:grid-cols-2 gap-5">
            <Section title="Revenue by Payment Method">
              {data.byPaymentMethod.length === 0 ? (
                <p className="text-sm text-gray-500">No payments in range.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <th className="text-left py-2">Method</th>
                      <th className="text-right py-2">Orders</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byPaymentMethod.map((row) => (
                      <tr
                        key={row.method}
                        className="border-t border-gray-100 dark:border-white/[0.06]"
                      >
                        <td className="py-2.5 capitalize text-gray-900 dark:text-[#E7E9EA]">
                          {row.method.replace("_", " ")}
                        </td>
                        <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">
                          {row.count}
                        </td>
                        <td className="py-2.5 text-right font-bold text-gray-900 dark:text-[#E7E9EA]">
                          {fmtNaira(row.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>

            <Section title="Orders by Status">
              {data.byStatus.length === 0 ? (
                <p className="text-sm text-gray-500">No orders in range.</p>
              ) : (
                <ul className="space-y-2">
                  {data.byStatus.map((row) => (
                    <li
                      key={row.status}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="capitalize text-gray-700 dark:text-gray-300">
                        {row.status}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-[#E7E9EA]">
                        {row.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {/* Top products */}
          {data.topProducts.length > 0 && (
            <Section title="Top Products by Revenue">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Units</th>
                    <th className="text-right py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr
                      key={p.name}
                      className="border-t border-gray-100 dark:border-white/[0.06]"
                    >
                      <td className="py-2.5 text-gray-900 dark:text-[#E7E9EA] truncate max-w-[200px]">
                        {p.name}
                      </td>
                      <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">
                        {p.unitsSold}
                      </td>
                      <td className="py-2.5 text-right font-bold text-gray-900 dark:text-[#E7E9EA]">
                        {fmtNaira(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Order list */}
          {data.orders.length > 0 && (
            <Section
              title={`Orders (${data.orders.length})`}
              icon={<Calendar className="w-4 h-4" />}
            >
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <th className="text-left py-2">Order</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-left py-2">Payment</th>
                      <th className="text-left py-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr
                        key={o._id}
                        className="border-t border-gray-100 dark:border-white/[0.06]"
                      >
                        <td className="py-2.5 font-mono text-gray-900 dark:text-[#E7E9EA]">
                          #{o._id.slice(-8)}
                        </td>
                        <td className="py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                          {o.user?.email || "Guest"}
                        </td>
                        <td className="py-2.5 text-right font-bold text-gray-900 dark:text-[#E7E9EA]">
                          {fmtNaira(o.totalPrice)}
                        </td>
                        <td className="py-2.5 capitalize text-gray-700 dark:text-gray-300">
                          {o.paymentMethod?.replace("_", " ") || "—"}
                        </td>
                        <td className="py-2.5 font-mono text-gray-500 dark:text-gray-400 text-[10px]">
                          {o.paymentReference || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <div
    className="rounded-2xl p-5 bg-white dark:bg-[#17181A]
      border border-gray-200 dark:border-white/[0.07]"
  >
    <div className="flex items-center gap-3 mb-3">
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </span>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </p>
    </div>
    <p className="text-2xl font-black text-gray-900 dark:text-[#E7E9EA] truncate">
      {value}
    </p>
  </div>
);

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-2xl p-6 bg-white dark:bg-[#17181A]
      border border-gray-200 dark:border-white/[0.07]"
  >
    <h2 className="text-sm font-black text-gray-900 dark:text-[#E7E9EA] mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

export default SalesReport;