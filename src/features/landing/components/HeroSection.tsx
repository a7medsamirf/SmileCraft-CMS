"use client";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section
      dir="rtl"
      className="relative min-h-screen pt-[120px] pb-20 px-[5vw] flex flex-col justify-center overflow-hidden"
    >
      {/* Radial Glow */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(at 50% 30%, rgb(37 99 235 / 14%) 0%, transparent 50%)" }}
      />
      {/* Grid BG */}
      <div className="absolute inset-0 pointer-events-none grid-bg" />

      <div className="relative z-10 max-w-[1200px] mx-auto w-full grid lg:grid-cols-2 items-center gap-[60px]">
        {/* Right: Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.2)] rounded-full px-4 py-1.5 text-[12.5px] font-bold text-[#2563EB] mb-6"
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB] animate-pulse" />
            الجديد — تقارير AI تلقائية
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hero-title font-black text-white tracking-[-1px]"
          >
            أدِر عيادة أسنانك
            <br />
            <span className="text-[#2563EB] accent-underline relative">بذكاء</span> وبساطة
            <br />
        {/*     <span className="italic-serif">لا مثيل له</span> */}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base font-medium leading-[1.8] text-[#6B849E] mt-5 mb-9 max-w-[480px]"
          >
            نظام إدارة متكامل مصمم خصيصاً لعيادات الاسنان العربية. من المرضى والمواعيد إلى
            الفواتير والتقارير — كل شيء في مكان واحد.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <a
              href="/ar/login"
              className="hero-primary-btn flex items-center gap-2 text-[15px] text-white font-extrabold px-8 py-3.5 rounded-xl bg-[#2563EB] transition-all shadow-[0_0_40px_rgba(37,99,235,0.25)]"
            >
              ابدأ تجربتك المجانية
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-3.5 mt-10"
          >
            <div className="flex">
              {[
                { initials: "ذم", bg: "rgba(37,99,235,0.2)", color: "#2563EB" },
                { initials: "سع", bg: "rgba(16,185,129,0.2)", color: "#10b981" },
                { initials: "أح", bg: "rgba(99,102,241,0.2)", color: "#6366f1" },
                { initials: "نر", bg: "rgba(245,158,11,0.2)", color: "#f59e0b" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="w-[34px] h-[34px] rounded-full border-[2.5px] border-[#060D18] flex items-center justify-center text-[11px] font-extrabold -mr-2.5 first:mr-0"
                  style={{ background: a.bg, color: a.color }}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <div className="text-[13px] text-[#6B849E] font-semibold leading-[1.5]">
              <strong className="text-white block">+١٠٠ عيادة تثق بنا</strong>
              تقييم ٤.٩ ⭐ من أطباء الأسنان
            </div>
          </motion.div>
        </div>

        {/* Left: Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative hidden lg:block"
        >
          {/* Floating Card Top */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30px] -left-[40px] z-10 bg-[#0D1B2E] border border-[rgba(37,99,235,0.12)] rounded-[14px] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            <div className="text-[20px] font-black text-[#2563EB]">+١٢٪</div>
            <div className="text-[10.5px] text-[#6B849E] font-semibold mt-0.5">نمو المرضى هذا الشهر</div>
          </motion.div>

          {/* Main Mockup */}
          <div className="mockup-frame-3d bg-[#0D1B2E] border border-[rgba(37,99,235,0.12)] rounded-[20px] overflow-hidden shadow-[0_0_0_1px_rgba(37,99,235,0.06),0_40px_100px_rgba(0,0,0,0.6),0_0_80px_rgba(37,99,235,0.06)]">
            {/* Browser Bar */}
            <div className="bg-[#0A1728] px-4 py-3 flex items-center gap-2 border-b border-[rgba(37,99,235,0.12)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 bg-white/[0.04] rounded-md px-3 py-1.5 text-[11px] text-[#6B849E] text-center" dir="ltr">
                smilecraft.com/dashboard
              </div>
            </div>

            {/* Mockup Content */}
            <div className="p-[18px]">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mb-[14px]">
                {[
                  { val: "٤٨", label: "مريض هذا الشهر", delta: "↑ +١٢٪", deltaColor: "#10b981" },
                  { val: "٧", label: "مواعيد اليوم", delta: "٣ متبقية", deltaColor: "#f59e0b" },
                  { val: "٢٤.٥k", label: "الإيرادات ج.م.", delta: "↑ +٨٪", deltaColor: "#10b981", valColor: "#2563EB" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-2.5">
                    <div className="text-[18px] font-black text-white" style={s.valColor ? { color: s.valColor } : undefined}>
                      {s.val}
                    </div>
                    <div className="text-[10px] text-[#6B849E] font-semibold mt-0.5">{s.label}</div>
                    <div className="text-[10px] font-bold mt-1" style={{ color: s.deltaColor }}>{s.delta}</div>
                  </div>
                ))}
              </div>

              {/* Mini Chart */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[10px] p-3 mb-2.5">
                <div className="text-[11px] font-bold text-[#6B849E] mb-2.5">الإيرادات الشهرية</div>
                <div className="flex items-end gap-1.5 h-[50px]">
                  {[55, 72, 62, 45, 80].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t mini-bar"
                      style={{ height: `${h}%`, background: "rgba(37,99,235,0.15)" }}
                    />
                  ))}
                  <div
                    className="flex-1 rounded-t mini-bar"
                    style={{ height: "78%", background: "#2563EB" }}
                  />
                </div>
              </div>

              {/* Appointments List */}
              <div className="flex flex-col gap-1.5">
                {[
                  { time: "09:00", name: "أحمد حسن", status: "مكتمل", statusBg: "rgba(16,185,129,0.15)", statusColor: "#10b981", dotColor: "#2563EB" },
                  { time: "10:30", name: "سارة محمد", status: "جارٍ الآن", statusBg: "rgba(245,158,11,0.15)", statusColor: "#f59e0b", dotColor: "#f59e0b" },
                  { time: "11:30", name: "خالد علي", status: "قادم", statusBg: "rgba(100,116,139,0.2)", statusColor: "#64748b", dotColor: "#64748b" },
                ].map((ap, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] rounded-lg px-2.5 py-2"
                  >
                    <span className="text-[10px] font-extrabold text-[#2563EB] min-w-[32px]" dir="ltr">{ap.time}</span>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ap.dotColor }} />
                    <span className="text-[10.5px] font-bold text-white flex-1">{ap.name}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: ap.statusBg, color: ap.statusColor }}
                    >
                      {ap.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Card Bottom */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 -right-[30px] z-10 bg-[#0D1B2E] border border-[rgba(37,99,235,0.12)] rounded-[14px] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            <div className="text-[20px] font-black text-[#2563EB]">٩٨٪</div>
            <div className="text-[10.5px] text-[#6B849E] font-semibold mt-0.5">رضا المرضى</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
