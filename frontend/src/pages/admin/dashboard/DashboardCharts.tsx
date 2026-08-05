import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

const ACCENT = "#e8622a";
const CHART_COLORS = ["#e8622a","#10b981","#3b82f6","#f59e0b","#8b5cf6","#ec4899"];
const STATUS_PIE: Record<string, string> = { Pending:"#fbbf24", Paid:"#34d399", Shipped:"#60a5fa", Delivered:"#6b7280", Cancelled:"#ef4444" };

const ChartTooltip = ({ active, payload, label, isDark }: { active?:boolean; payload?:Array<{value:number;name:string;dataKey?:string}>; label?:string; isDark:boolean }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const isRevenue = payload[0].dataKey === "revenue" || payload[0].name === "revenue";
  return (
    <div className="rounded-xl px-4 py-3 text-sm" style={{ background: isDark ? "#1c1c1c" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)", boxShadow: isDark ? "0 12px 30px rgba(0,0,0,0.5)" : "0 12px 30px rgba(0,0,0,0.1)" }}>
      <p className="font-semibold text-xs mb-1.5 uppercase tracking-wider" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>{label || payload[0].name}</p>
      <p className="font-black text-lg" style={{ color: ACCENT }}>{isRevenue ? `₦${val?.toLocaleString()}` : val}</p>
    </div>
  );
};

const PieTooltip = ({ active, payload, isDark }: { active?:boolean; payload?:Array<{value:number;name:string}>; isDark:boolean }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm" style={{ background: isDark ? "#1c1c1c" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)" }}>
      <p className="font-bold" style={{ color:STATUS_PIE[payload[0].name] || ACCENT }}>{payload[0].name}</p>
      <p className="font-black" style={{ color: isDark ? "#fff" : "#111" }}>{payload[0].value}</p>
    </div>
  );
};

interface DashboardChartsProps {
  analytics: { totalRevenue: number; categorySales: Array<{ _id: string; revenue: number }> };
  statusPieData: Array<{ name: string; value: number }>;
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
  isDark: boolean;
}

const DashboardCharts = ({ analytics, statusPieData, revenueTrend, isDark }: DashboardChartsProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <>
      {/* Sales by Category + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
          <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor: sectionBorder }}>
            <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><BarChart3 className="w-4 h-4" style={{ color: ACCENT }} /> Sales by Category</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: textMuted }}>Revenue (₦)</p>
          </div>
          <div className="p-5">
            {analytics.categorySales.length === 0 ? (
              <p className="text-center py-14 text-sm" style={{ color: textMuted }}>No paid orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={analytics.categorySales} margin={{ top:8, right:0, left:0, bottom:0 }}>
                  <XAxis dataKey="_id" tick={{ fontSize:10, fill: textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill: textMuted }} axisLine={false} tickLine={false} tickFormatter={(v:number) => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="revenue" radius={[8,8,0,0]} barSize={28}>{analytics.categorySales.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
          <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor: sectionBorder }}>
            <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><PieChartIcon className="w-4 h-4" style={{ color:"#10b981" }} /> Order Status</h2>
          </div>
          <div className="p-5">
            {statusPieData.length === 0 ? (
              <p className="text-center py-14 text-sm" style={{ color: textMuted }}>No orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">{statusPieData.map((e, i) => <Cell key={i} fill={STATUS_PIE[e.name] || "#6b7280"} />)}</Pie>
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" formatter={(v:string) => <span style={{ color: textSecondary, fontSize:11, fontWeight:700 }}>{v}</span>} />
                  <Tooltip content={<PieTooltip isDark={isDark} />} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Trend (NEW) */}
      {revenueTrend.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
          <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor: sectionBorder }}>
            <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><TrendingUp className="w-4 h-4" style={{ color: ACCENT }} /> Revenue Trend (30 Days)</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueTrend} margin={{ top:8, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} />
                <XAxis dataKey="date" tick={{ fontSize:10, fill: textMuted }} axisLine={false} tickLine={false} tickFormatter={(v:string) => v.slice(5)} />
                <YAxis tick={{ fontSize:10, fill: textMuted }} axisLine={false} tickLine={false} tickFormatter={(v:number) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Line type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={3} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardCharts;