import { useCallback } from 'react';
import type { GptNodeSuggestion } from '../../../workspace/types/voice.types';
import type { NodeData } from '../../types';
import { useColorTheme } from '../useColorTheme';
import { useNodePositioning } from '../useNodePositioning';

interface YjsCRUD {
  create: (node: NodeData) => void;
  read: (id: string) => NodeData | undefined;
}

export function useGptNodeCreator(crud: YjsCRUD | null, workspaceId: string) {
  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition } = useNodePositioning();

  const createNodesFromGpt = useCallback(
    (suggestions: GptNodeSuggestion[]) => {
      console.log('[GptNodeCreator] ===== Creating Nodes from GPT =====');
      console.log('[GptNodeCreator] 📊 Received suggestions:', suggestions.length);
      console.log('[GptNodeCreator] Suggestions:', suggestions);

      if (!crud) {
        console.error('[GptNodeCreator] ❌ CRUD is not available');
        return;
      }

      console.log('[GptNodeCreator] ✅ CRUD available, starting node creation...');

      suggestions.forEach((suggestion, index) => {
        const nodeId = `gpt-${Date.now()}-${index}`;
        console.log(`\n[GptNodeCreator] 📝 Processing suggestion ${index + 1}/${suggestions.length}:`, {
          nodeId,
          keyword: suggestion.keyword,
          parentId: suggestion.parentId,
          memo: suggestion.memo?.substring(0, 50) + '...',
        });

        // 부모 노드 찾기
        let parentNode: NodeData | undefined;
        if (suggestion.parentId) {
          console.log('[GptNodeCreator] 🔍 Looking for parent node:', suggestion.parentId);
          parentNode = crud.read(suggestion.parentId);

          if (parentNode) {
            console.log('[GptNodeCreator] ✅ Parent node found:', {
              id: parentNode.id,
              keyword: parentNode.keyword,
              position: { x: parentNode.x, y: parentNode.y },
            });
          } else {
            console.warn('[GptNodeCreator] ⚠️ Parent node not found, will create as root node');
          }
        } else {
          console.log('[GptNodeCreator] 🌱 Creating as root node (no parentId)');
        }

        // 위치 계산
        let x = 0;
        let y = 0;

        if (parentNode) {
          // 부모 노드 주변에 배치 (방사형)
          const angle = (Math.PI * 2 / suggestions.length) * index;
          const distance = 200;
          x = parentNode.x + Math.cos(angle) * distance;
          y = parentNode.y + Math.sin(angle) * distance;
          console.log('[GptNodeCreator] 📍 Calculated position around parent:', {
            angle: `${(angle * 180 / Math.PI).toFixed(2)}°`,
            distance,
            position: { x: x.toFixed(2), y: y.toFixed(2) },
          });
        } else {
          // 루트 노드 - 중앙에서 약간 떨어진 위치
          const offsetX = (index - Math.floor(suggestions.length / 2)) * 250;
          x = offsetX;
          y = 0;
          console.log('[GptNodeCreator] 📍 Calculated root position:', {
            offsetX,
            position: { x, y },
          });
        }

        // 겹침 방지
        console.log('[GptNodeCreator] 🔄 Checking for overlaps...');
        const position = findNonOverlappingPosition(x, y);
        if (position.x !== x || position.y !== y) {
          console.log('[GptNodeCreator] ⚠️ Position adjusted to avoid overlap:', {
            original: { x, y },
            adjusted: { x: position.x, y: position.y },
          });
        } else {
          console.log('[GptNodeCreator] ✅ No overlap detected');
        }

        // 노드 생성
        const color = getRandomThemeColor();
        const newNode: NodeData = {
          id: nodeId,
          keyword: suggestion.keyword,
          memo: suggestion.memo,
          x: position.x,
          y: position.y,
          color,
          parentId: suggestion.parentId || '0',
          type: 'text',
          analysisStatus: 'DONE',
          createdAt: new Date().toISOString(),
        };

        console.log('[GptNodeCreator] 🎨 Created node data:', {
          id: nodeId,
          keyword: newNode.keyword,
          parentId: newNode.parentId,
          position: { x: newNode.x, y: newNode.y },
          color,
        });

        crud.create(newNode);
        console.log('[GptNodeCreator] ✅ Node created in Yjs:', nodeId);
      });

      console.log('\n[GptNodeCreator] ===== All Nodes Created Successfully =====');
      console.log('[GptNodeCreator] 📊 Total nodes created:', suggestions.length);
    },
    [crud, getRandomThemeColor, findNonOverlappingPosition]
  );

  return { createNodesFromGpt };
}
