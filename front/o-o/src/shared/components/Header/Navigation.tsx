// components/Header/Navigation.tsx
import { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { getMindmapPath } from "@/constants/paths";
import { createWorkspace } from "@/services/workspaceService";

interface NavigationProps {
  readonly isLoggedIn: boolean;
  readonly getNavLinkClass: (props: NavLinkRenderProps) => string;
}

export function Navigation({ isLoggedIn, getNavLinkClass }: NavigationProps) {
  const navigate = useNavigate();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const handleClickNewProject = useCallback(async () => {
    if (isCreatingWorkspace) return;
    setIsCreatingWorkspace(true);

    try {
      const workspace = await createWorkspace();
      navigate(getMindmapPath(workspace.id));
    } catch (error) {
      console.error("Failed to create workspace", error);
      // TODO: replace with toast/error UI
    } finally {
      setIsCreatingWorkspace(false);
    }
  }, [isCreatingWorkspace, navigate]);

  return (
    <nav className="hidden md:flex items-baseline gap-3 lg:gap-6 text-sm lg:text-base">
      <NavLink to="/" className={getNavLinkClass}>
        Home
      </NavLink>
      <NavLink to="/trend" className={getNavLinkClass}>
        Trend
      </NavLink>
      {isLoggedIn && (
        <>
          <button
            type="button"
            className={`font-semibold text-semi-black transition-opacity ${
              isCreatingWorkspace ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={handleClickNewProject}
            disabled={isCreatingWorkspace}
          >
            {isCreatingWorkspace ? "Creating..." : "New Project"}
          </button>
          <NavLink to="/mypage" className={getNavLinkClass}>
            My Page
          </NavLink>
        </>
      )}
    </nav>
  );
}
