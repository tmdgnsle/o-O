import { Avatar } from "@/components/ui/avatar";
import popo from "@/shared/assets/images/popo1.png";
import { GoogleLoginButton } from "@/shared/components/GoogleLoginButton";
import { SearchButton } from "@/shared/components/Search/SearchButton";
import MiniNav from "@/shared/ui/MiniNav";
import { useAppSelector } from "@/store/hooks";
import { AvatarImage } from "@radix-ui/react-avatar";

export function TrendMindmapHeader() {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex justify-between items-start">
      <MiniNav />
      <div className="flex gap-4 items-center">
        <SearchButton />
        {isLoggedIn && user ? (
          <div className="shadow-md rounded-full bg-white p-1 ">
            <Avatar>
              <AvatarImage src={user.profileImage} alt="profile-image" />
            </Avatar>
          </div>
        ) : (
          <GoogleLoginButton />
        )}
      </div>
    </div>
  );
}
