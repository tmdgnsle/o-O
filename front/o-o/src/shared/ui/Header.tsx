import { Link, NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import logo from "@/shared/assets/images/logo.png";
import popo1 from "@/shared/assets/images/popo1.png";

const MOCK_USER = {
  name: "홍길동",
  profileImage: popo1,
};

// 네비 링크 스타일 함수
const getNavLinkClass = ({ isActive }: NavLinkRenderProps) =>
  `text-xl ${
    isActive ? "text-primary font-bold" : "text-semi-black font-semibold"
  }`;

export function Header() {
  const isLoggedIn = true;

  return (
    <header className="flex items-center justify-between px-10 py-7 font-paperlogy">
      <div className="flex items-center gap-8">
        <Link to="/">
          <img src={logo} alt="o-O" className="w-30 h-10" />
        </Link>

        <nav className="flex gap-6 items-baseline">
          <NavLink to="/" className={getNavLinkClass}>
            Home
          </NavLink>
          <NavLink to="/trend" className={getNavLinkClass}>
            Trend
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/new-project" className={getNavLinkClass}>
              New Project
            </NavLink>
          )}
        </nav>
      </div>

      {isLoggedIn ? (
        <Link to="/my-page">
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
              <img
                src={MOCK_USER.profileImage}
                alt="profile"
                className="w-11 h-10 object-cover"
              />
            </div>
            <span className="text-base font-medium text-primary">
              {MOCK_USER.name}
            </span>
          </div>
        </Link>
      ) : (
        <button>Sign in with Google</button>
      )}
    </header>
  );
}
