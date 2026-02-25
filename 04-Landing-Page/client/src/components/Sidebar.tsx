import { NAV_SECTIONS, LOGO_URL } from "@/lib/constants";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const activeId = useActiveSection();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg rounded-full p-3 border border-gray-100"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white/95 backdrop-blur-sm border-l border-gray-100 z-40 transition-transform duration-300",
          "w-56 flex flex-col py-8 px-4",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="mb-10 px-2">
          <img src={LOGO_URL} alt="Qoura AI" className="h-10 object-contain" />
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {NAV_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className={cn(
                "w-full text-right px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                activeId === id
                  ? "bg-[#FF7A00]/10 text-[#FF7A00] font-semibold"
                  : "text-[#545454] hover:text-black hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-100 px-2">
          <p className="text-xs text-[#CCCCCC]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Brand Guidelines v1.0
          </p>
          <p className="text-xs text-[#CCCCCC] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            February 2026
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
