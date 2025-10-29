export function SearchInput() {
  return (
    <input
      type="text"
      placeholder="마인드맵을 생성할 아이디어를 입력해주세요."
      className="
        w-[clamp(300px,80%,1200px)] 
        h-[clamp(60px,4vw,100px)] 
        px-6 text-center font-semibold 
        text-[clamp(18px,1.5vw,36px)] 
        text-semi-deep-grey rounded-full 
        bg-white shadow-md transitional-all duration-300"
    />
  );
}
