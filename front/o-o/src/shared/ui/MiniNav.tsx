// MiniNav.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, Home, Compass, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PATHS } from "@/constants/paths";
import type { RootState } from "@/store/store";

export default function MiniNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Redux에서 로그인 상태 가져오기
  const isLoggedIn = useSelector(
    (state: RootState) => state.auth?.isLoggedIn || false
  );

  const baseItems = [
    {
      key: "home",
      icon: <Home className="w-6 h-6 text-primary" />,
      onClick: () => {
        navigate(PATHS.HOME);
        setOpen(false);
      },
    },
    {
      key: "explore",
      icon: <Compass className="w-6 h-6 text-primary" />,
      onClick: () => {
        navigate(PATHS.TREND);
        setOpen(false);
      },
    },
  ];

  // 로그인했을 때만 + 버튼 추가
  const items = isLoggedIn
    ? [
        ...baseItems,
        {
          key: "add",
          icon: <Plus className="w-6 h-6 text-primary" />,
          onClick: () => {
            navigate("/mindmap");
            setOpen(false);
          },
        },
      ]
    : baseItems;

  return (
    <div className="flex flex-col items-center gap-3">
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
          "w-14 overflow-hidden rounded-full bg-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-all duration-300",
          open ? "max-h-[260px] py-4" : "max-h-0 py-0"
        )}
      >
        <ul
          className={cn(
            "flex flex-col items-center gap-6 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          {items.map((it) => (
            <li key={it.key}>
              <button
                onClick={it.onClick}
                className="grid place-items-center w-10 h-10 rounded-full bg-white hover:bg-gray-50 shadow-sm transition-colors"
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
