import { NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import popo1 from "@/shared/assets/images/popo1.png";

interface MobileMenuProps {
  readonly isOpen: boolean;
  readonly isLoggedIn: boolean;
  readonly userProfileImage?: string;
  readonly userName?: string;
  readonly onClose: () => void;
  readonly onProfileClick: () => void;
  readonly getNavLinkClass: (props: NavLinkRenderProps) => string;
}

export function MobileMenu({
  isOpen,
  isLoggedIn,
  userProfileImage,
  userName,
  onClose,
  onProfileClick,
  getNavLinkClass,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 top-[60px] bg-white z-50 font-paperlogy">
      <nav className="flex flex-col p-6 gap-4 text-lg">
        <NavLink to="/" className={getNavLinkClass} onClick={onClose}>
          Home
        </NavLink>
        <NavLink to="/trend" className={getNavLinkClass} onClick={onClose}>
          Trend
        </NavLink>
        {isLoggedIn && (
          <>
            <NavLink
              to="/new-project"
              className={getNavLinkClass}
              onClick={onClose}
            >
              New Project
            </NavLink>
            <NavLink to="/mypage" className={getNavLinkClass} onClick={onClose}>
              My Page
            </NavLink>
            <button
              onClick={onProfileClick}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img
                    src={userProfileImage || popo1}
                    alt="profile"
                    className="w-11 h-11 object-cover"
                  />
                </div>
                <span className="text-base font-medium text-primary">
                  {userName}
                </span>
              </div>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
