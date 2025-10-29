import logoCharacter from "@/shared/assets/logo.png"; // src/shared/ui/Header.tsx

export function Header() {
  const isLoggedIn = true;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white">
      <div className="flex items-center gap-6">
        <img src={logoCharacter} alt="o-O" className="w-30 h-10"></img>

        {/* 네비게이션 */}
        <nav className="flex gap-6 items-baseline">
          <a href="/" className="text-[#263A6B] text-xl font-semibold">
            Home
          </a>
          <a href="/trend" className="text-base text-[##333333]">
            Trend
          </a>
          {isLoggedIn && (
            <a href="/trend" className="text-base text-[##333333]">
              New Project
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
