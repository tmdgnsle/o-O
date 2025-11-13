import { NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import popo1 from "@/shared/assets/images/popo1.png";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import { GoogleLoginButton } from "@/shared/components/GoogleLoginButton";

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
    <div className="md:hidden fixed inset-0 top-[80px] bg-white z-50 font-paperlogy">
      <nav className="flex flex-col py-10 px-10 gap-6 text-lg">
        <NavLink to="/" className={getNavLinkClass} onClick={onClose}>
          🏠 Home
        </NavLink>
        <NavLink to="/trend" className={getNavLinkClass} onClick={onClose}>
          🌎 Trend
        </NavLink>
        {isLoggedIn ? (
          <>
            <NavLink
              to="/new-project"
              className={getNavLinkClass}
              onClick={onClose}
            >
              ✨ New Project
            </NavLink>
            <NavLink to="/mypage" className={getNavLinkClass} onClick={onClose}>
              🙋‍♂️ My Page
            </NavLink>
            <button
              onClick={onProfileClick}
              className="pt-6 border-t border-gray-200 flex justify-end"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img
                    src={getProfileImageUrl(userProfileImage) || popo1}
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
        ) : (
          <div className="mt-4 pt-6 border-t border-gray-200 flex justify-end">
            <GoogleLoginButton />
          </div>
        )}
      </nav>
    </div>
  );
}
