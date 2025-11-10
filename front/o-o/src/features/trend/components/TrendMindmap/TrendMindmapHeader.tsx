import { Avatar } from "@/components/ui/avatar";
import popo from "@/shared/assets/images/popo1.png";
import { SearchButton } from "@/shared/components/Search/SearchButton";
import { useGoogleOneTap } from "@/shared/hooks/useGoogleOneTap";
import MiniNav from "@/shared/ui/MiniNav";
import { useAppSelector } from "@/store/hooks";
import { AvatarImage } from "@radix-ui/react-avatar";

export function TrendMindmapHeader() {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useGoogleOneTap(isLoggedIn, {
    buttonType: "icon",
    elementId: "googleSignInDiv",
  });

  return (
    <div className="flex justify-between items-start">
      <MiniNav />
      <div className="flex gap-4 items-center">
        <SearchButton />
        {isLoggedIn ? (
          <div className="shadow-md rounded-full bg-white p-1 ">
            <Avatar>
              <AvatarImage src={popo} alt="popo" />
            </Avatar>
          </div>
        ) : (
          <div
            id="googleSignInDiv"
            className="flex justify-center items-center "
            style={{ transform: "scale(1.2)" }}
          />
        )}
      </div>
    </div>
  );
}
