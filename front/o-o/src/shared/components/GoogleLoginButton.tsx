import { API_BASE_URL } from "@/constants/baseUrl";

export function GoogleLoginButton() {
  const handleLogin = () => {
    globalThis.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <button
      onClick={handleLogin}
      className="px-3 py-3 bg-white rounded-full hover:bg-gray-50 flex items-center gap-3 shadow-md transition-colors"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-6 h-6"
      />
    </button>
  );
}
