import popo1 from "@/shared/assets/images/organize_real_popo.webp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

export function RecordIdeaHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end pt-1">
        <img src={popo1} alt="포포 캐릭터" className="w-14" />
        <div className="flex gap-3 itmes-center mb-2">
          {/* 버튼 2개 */}
          <button className="w-7 h-7 rounded-full bg-primary flex justify-center items-center">
            <PlayArrowIcon sx={{ color: "#CDD9EC", fontSize: "24px" }} />
          </button>
          <button className="w-7 h-7 rounded-full bg-[#CDD9EC] flex justify-center items-center">
            <PauseIcon sx={{ color: "#263A6B", fontSize: "20px" }} />
          </button>
        </div>
      </div>
      <div className="text-[10px] text-primary pl-2">
        <p>Popo가 아이디어를 기록하는 중입니다.</p>
        <p>기록을 멈추려면 일시정지 버튼을 클릭해주세요.</p>
      </div>
    </div>
  );
}
