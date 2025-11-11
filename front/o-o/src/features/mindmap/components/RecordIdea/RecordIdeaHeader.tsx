import popo1 from "@/shared/assets/images/organize_real_popo.png";

export function RecordIdeaHeader() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <img src={popo1} alt="포포 캐릭터" className="w-16" />
        <div className="flex gap-4 itmes-center">{/* 버튼 2개 */}</div>
      </div>
    </div>
  );
}
