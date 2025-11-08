import { Button } from "@/components/ui/button";
import type { NodeData } from "../types";

export default function AnalyzeSelectionPanel({
  selectedNodes,
  onAnalyze,
  onClear,
  onRemoveNode,
}: Readonly<{
  selectedNodes: NodeData[];
  onAnalyze: () => void;
  onClear: () => void;
  onRemoveNode: (nodeId: string) => void;
}>) {
  const hasSelection = selectedNodes.length > 0;

  return (
    <div className="w-72 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl p-4 font-paperlogy">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">선택된 노드</p>
          <p className="text-xs text-slate-400">총 {selectedNodes.length}개</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"
          disabled={!hasSelection}
        >
          초기화
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
        {hasSelection ? (
          selectedNodes.map((node) => (
            <div key={node.id} className="flex items-center gap-2">
              <span className="flex-1 truncate">• {node.text}</span>
              <button
                type="button"
                aria-label={`${node.text} 제거`}
                className="text-xs text-slate-400 hover:text-slate-600"
                onClick={() => onRemoveNode(node.id)}
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400">아직 선택된 노드가 없습니다.</p>
        )}
      </div>

      <Button onClick={onAnalyze} className="mt-4 w-full" disabled={!hasSelection}>
        분석하기
      </Button>
    </div>
  );
}
