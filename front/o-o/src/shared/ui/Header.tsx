import { Link, NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import logo from "@/shared/assets/images/logo.png";
import popo1 from "@/shared/assets/images/popo1.png";
import { useEffect } from "react";

const MOCK_USER = {
  name: "홍길동",
  profileImage: popo1,
};

// 네비 링크 스타일 함수
const getNavLinkClass = ({ isActive }: NavLinkRenderProps) =>
  ` ${isActive ? "text-primary font-bold" : "text-semi-black font-semibold"}`;

export function Header() {
  const isLoggedIn = true;

  useEffect(() => {
    if (!isLoggedIn && window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (res) => console.log("로그인 응답:", res),
      });
    }
  }, [isLoggedIn]);

  return (
    <header
      className="flex items-center justify-between font-paperlogy"
      style={{
        paddingLeft: "clamp(1rem, 5vw, 4rem)",
        paddingRight: "clamp(1rem, 5vw, 4rem)",
        paddingTop: "clamp(0.5rem, 2vw, 2rem)",
        paddingBottom: "clamp(0.5rem, 2vw, 2rem)",
      }}
    >
      <div className="flex items-center gap-8">
        <Link to="/">
          <img
            src={logo}
            alt="o-O"
            style={{
              width: "clamp(60px, 10vw, 108px)",
              height: "clamp(20px, 3vw, 40px)",
            }}
          />
        </Link>

        <nav
          className="
            flex items-baseline"
          style={{
            gap: "clamp(2px,2vw,24px)",
            fontSize: "clamp(15px,1.5vw,36px)",
          }}
        >
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
          <div
            className="flex items-center px-2 py-1 sm:px-4 sm:py-2"
            style={{
              gap: "clamp(0.5rem, 1vw, 1rem)",
            }}
          >
            <div
              className="rounded-full bg-white flex items-center justify-center shadow-md"
              style={{
                width: "clamp(32px, 5vw, 48px)",
                height: "clamp(32px, 5vw, 48px)",
              }}
            >
              <img
                src={MOCK_USER.profileImage}
                alt="profile"
                className="object-cover"
                style={{
                  width: "clamp(28px, 4.5vw, 44px)",
                  height: "clamp(28px, 4.5vw, 44px)",
                }}
              />
            </div>
            <span
              className="font-medium text-primary"
              style={{
                fontSize: "clamp(14px, 1.2vw, 16px)",
              }}
            >
              {MOCK_USER.name}
            </span>
          </div>
        </Link>
      ) : (
        <div
          id="googleSignInDiv"
          className="flex justify-center items-center"
        />
        // <button
        //   className="font-medium text-primary"
        //   style={{
        //     fontSize: "clamp(14px, 1.2vw, 16px)",
        //     padding: "clamp(0.5rem, 1vw, 1rem) clamp(1rem, 2vw, 1.5rem)",
        //   }}
        // >
        //   Sign in with Google
        // </button>
      )}
    </header>
  );
}
