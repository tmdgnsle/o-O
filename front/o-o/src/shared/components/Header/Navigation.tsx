// components/Header/Navigation.tsx
import { NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";

interface NavigationProps {
  readonly isLoggedIn: boolean;
  readonly getNavLinkClass: (props: NavLinkRenderProps) => string;
}

export function Navigation({ isLoggedIn, getNavLinkClass }: NavigationProps) {
  return (
    <nav className="hidden md:flex items-baseline gap-3 lg:gap-6 text-sm lg:text-base">
      <NavLink to="/" className={getNavLinkClass}>
        Home
      </NavLink>
      <NavLink to="/trend" className={getNavLinkClass}>
        Trend
      </NavLink>
      {/* {isLoggedIn && (
        <>
          <NavLink to="/new-project" className={getNavLinkClass}>
            New Project
          </NavLink>
          <NavLink to="/mypage" className={getNavLinkClass}>
            My Page
          </NavLink>
        </>
      )} */}

      <NavLink to="/new-project" className={getNavLinkClass}>
        New Project
      </NavLink>
      <NavLink to="/mypage" className={getNavLinkClass}>
        My Page
      </NavLink>

    </nav>
  );
}
