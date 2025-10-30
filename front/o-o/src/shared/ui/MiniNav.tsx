// MiniNav.tsx
import { useState } from "react";
import { Menu, Home, Compass, Plus } from "lucide-react";
import { cn } from "@/lib/utils"; // 없으면 className 그냥 문자열로 써도 됨

export default function MiniNav() {
  const [open, setOpen] = useState(false);

  const items = [
    { key: "home", icon: <Home className="w-6 h-6 text-primary" />, onClick: () => console.log("home") },
    { key: "explore", icon: <Compass className="w-6 h-6 text-primary" />, onClick: () => console.log("explore") },
    { key: "add", icon: <Plus className="w-6 h-6 text-primary" />, onClick: () => console.log("add") },
  ];

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col items-center gap-3">
      {/* 햄버거 버튼 */}
      <button
        aria-expanded={open}
        aria-controls="mini-nav"
        onClick={() => setOpen((v) => !v)}
        className="grid place-items-center w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
      >
        <Menu className="w-7 h-7 text-primary" />
      </button>

      {/* 펼쳐지는 바 */}
      <div
        id="mini-nav"
        className={cn(
          "w-14 overflow-hidden rounded-full bg-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-300",
          open ? "max-h-[260px] py-4" : "max-h-0 py-0"
        )}
      >
        <ul className={cn("flex flex-col items-center gap-6 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}>
          {items.map((it) => (
            <li key={it.key}>
              <button
                onClick={it.onClick}
                className="grid place-items-center w-10 h-10 rounded-full bg-white hover:bg-gray-50 shadow-sm"
                aria-label={it.key}
              >
                {it.icon}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
