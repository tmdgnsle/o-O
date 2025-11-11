import { ExtractedKeywordList } from "./ExtractedKeywordList";

export function RecordIdeaBody() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-primary text-lg font-bold">추출된 키워드</p>
      <div className="text-[11px]">
        <p>키워드를 틀릭하여</p>
        <p>해당 노드의 위치를 확인할 수 있습니다.</p>
      </div>
      <ExtractedKeywordList />
    </div>
  );
}
