import { logger } from '../utils/logger.js';
import { ydocManager } from '../yjs/ydoc-manager.js';

const GMS_API_URL = 'https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions';
const GMS_KEY = process.env.GMS_KEY;
const GPT_MODEL = process.env.GPT_MODEL || 'gpt-5-mini';

class GptSessionManager {
  constructor() {
    this.sessions = new Map(); // workspaceId → session
  }

  // 세션 시작
  startSession(workspaceId) {
    if (this.sessions.has(workspaceId)) {
      logger.warn(`[GPT] Session already exists for workspace ${workspaceId}`);
      return this.sessions.get(workspaceId);
    }

    const session = {
      workspaceId,
      transcripts: [], // { userId, userName, text, timestamp }
      connections: new Set(),
      isProcessing: false,
      updateTimer: null,
    };

    // 2초마다 GPT 호출
    session.updateTimer = setInterval(() => {
      this.processSession(workspaceId);
    }, 2000);

    this.sessions.set(workspaceId, session);
    logger.info(`[GPT] Session started for workspace ${workspaceId}`);
    return session;
  }

  // Transcript 추가
  addTranscript(workspaceId, userId, userName, text, timestamp) {
    const session = this.sessions.get(workspaceId);
    if (!session) return;

    session.transcripts.push({ userId, userName, text, timestamp });

    // 모든 참가자에게 브로드캐스트
    this.broadcast(workspaceId, {
      type: 'peer-transcript',
      userId,
      userName,
      text,
      timestamp,
    });

    logger.debug(`[GPT] Added transcript from ${userName} in workspace ${workspaceId}`);
  }

  // GPT 처리
  async processSession(workspaceId) {
    const session = this.sessions.get(workspaceId);
    if (!session || session.isProcessing || session.transcripts.length === 0) {
      return;
    }

    session.isProcessing = true;

    try {
      // 1. 현재 마인드맵 노드 정보 가져오기
      const mindmapContext = this.getMindmapContext(workspaceId);

      // 2. 대화 내역 포맷팅
      const conversation = session.transcripts
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(t => `${t.userName}: ${t.text}`)
        .join('\n');

      // 3. GPT 프롬프트 생성
      const prompt = this.buildPrompt(mindmapContext, conversation);

      logger.info(`[GPT] Processing ${session.transcripts.length} transcripts for workspace ${workspaceId}`);

      // 4. GMS API 호출 (스트리밍)
      const response = await fetch(GMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GMS_KEY}`,
        },
        body: JSON.stringify({
          model: GPT_MODEL,
          messages: [
            {
              role: 'developer',
              content: '당신은 마인드맵 노드를 제안하는 AI입니다. 사용자 대화에서 키워드를 추출하고, 반드시 JSON 배열 형식으로만 답변하세요. 마크다운 코드블록(```)이나 설명 텍스트는 포함하지 마세요. 순수 JSON만 출력하세요. 한국어로 답변하세요.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          // temperature 제거: gpt-5-mini 모델은 기본값 1만 지원
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[GPT] GMS API error: ${response.status}`, errorText);

        this.broadcast(workspaceId, {
          type: 'gpt-error',
          error: `GMS API 오류: ${response.status}`,
          timestamp: Date.now(),
        });
        return;
      }

      if (!response.body) {
        throw new Error('No response body from GMS API');
      }

      // 5. 스트리밍 응답 처리
      await this.handleStreamResponse(workspaceId, response.body);

    } catch (error) {
      logger.error(`[GPT] Error processing session:`, error);

      this.broadcast(workspaceId, {
        type: 'gpt-error',
        error: error.message || 'GPT 연결 실패',
        timestamp: Date.now(),
      });
    } finally {
      session.isProcessing = false;
    }
  }

  // 스트리밍 응답 처리
  async handleStreamResponse(workspaceId, stream) {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponse = '';

    for await (const chunk of stream) {
      buffer += decoder.decode(chunk, { stream: true });

      // SSE 형식: "data: {...}\n\n"
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 마지막 불완전한 줄 보관

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6)); // "data: " 제거
            const delta = json.choices?.[0]?.delta?.content;

            if (delta) {
              fullResponse += delta;

              // 클라이언트에 청크 전송 (실시간 피드백)
              this.broadcast(workspaceId, {
                type: 'gpt-chunk',
                content: delta,
                timestamp: Date.now(),
              });
            }
          } catch (e) {
            logger.warn('[GPT] Failed to parse SSE line:', trimmed);
          }
        }
      }
    }

    // JSON 파싱 및 검증
    try {
      // 1. 마크다운 코드블록 제거 (GPT가 실수로 넣을 수 있음)
      let jsonText = fullResponse.trim();
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

      // 2. JSON 파싱
      const nodes = JSON.parse(jsonText);

      // 3. 배열인지 확인
      if (!Array.isArray(nodes)) {
        throw new Error('Response is not an array');
      }

      // 4. 각 노드 검증
      const validatedNodes = nodes.map((node, index) => {
        if (!node.keyword || typeof node.keyword !== 'string') {
          throw new Error(`Node ${index}: missing or invalid keyword`);
        }

        return {
          parentId: node.parentId || null,
          keyword: node.keyword.trim(),
          memo: node.memo?.trim() || '',
        };
      });

      logger.info(`[GPT] Parsed ${validatedNodes.length} nodes for workspace ${workspaceId}`);

      // 5. 클라이언트에 전송
      this.broadcast(workspaceId, {
        type: 'gpt-done',
        nodes: validatedNodes,
        timestamp: Date.now(),
      });

    } catch (error) {
      logger.error('[GPT] Failed to parse JSON:', error.message);
      logger.debug('[GPT] Raw response:', fullResponse);

      // 파싱 실패 시
      this.broadcast(workspaceId, {
        type: 'gpt-error',
        error: 'GPT 응답을 파싱할 수 없습니다',
        rawText: fullResponse,
        timestamp: Date.now(),
      });
    }
  }

  // 현재 마인드맵 정보 가져오기
  getMindmapContext(workspaceId) {
    try {
      const ydoc = ydocManager.getDoc(workspaceId);
      if (!ydoc) return null;

      const nodesMap = ydoc.getMap('mindmap:nodes');
      const nodes = [];

      nodesMap.forEach((node, id) => {
        nodes.push({
          id,
          keyword: node.keyword,
          parentId: node.parentId,
        });
      });

      return {
        nodeCount: nodes.length,
        nodes: nodes.slice(0, 50), // 최대 50개만 (토큰 절약)
      };
    } catch (error) {
      logger.error(`[GPT] Error getting mindmap context:`, error);
      return null;
    }
  }

  // GPT 프롬프트 생성
  buildPrompt(mindmapContext, conversation) {
    let prompt = '# 현재 마인드맵 정보\n\n';

    if (mindmapContext && mindmapContext.nodes.length > 0) {
      prompt += `현재 ${mindmapContext.nodeCount}개의 노드가 있습니다:\n`;
      mindmapContext.nodes.forEach(node => {
        prompt += `- ID: ${node.id}, 키워드: "${node.keyword}", 부모ID: ${node.parentId || '없음'}\n`;
      });
      prompt += '\n';
    } else {
      prompt += '아직 노드가 없습니다. 루트 노드(parentId: null)부터 시작하세요.\n\n';
    }

    prompt += '# 팀원들의 대화\n\n';
    prompt += conversation + '\n\n';

    prompt += '# 요청\n\n';
    prompt += '위 대화에서 핵심 키워드를 추출하고, 마인드맵 노드를 제안하세요.\n';
    prompt += '**반드시 아래 JSON 배열 형식으로만 답변하세요. 코드블록(```)이나 다른 텍스트는 포함하지 마세요.**\n\n';
    prompt += '각 노드는 다음 구조를 따릅니다:\n';
    prompt += '[\n';
    prompt += '  {\n';
    prompt += '    "parentId": "기존 노드 ID 또는 null (루트)",\n';
    prompt += '    "keyword": "핵심 키워드 (간결하게)",\n';
    prompt += '    "memo": "상세 설명 (1-2문장)"\n';
    prompt += '  }\n';
    prompt += ']\n\n';
    prompt += '예시:\n';
    prompt += '[\n';
    prompt += '  {"parentId": null, "keyword": "AI 서비스", "memo": "인공지능 기반 추천 시스템"},\n';
    prompt += '  {"parentId": "기존노드ID", "keyword": "사용자 분석", "memo": "행동 패턴 기반 개인화"}\n';
    prompt += ']\n\n';
    prompt += '2-3개의 노드를 제안하세요.';

    return prompt;
  }

  // 브로드캐스트
  broadcast(workspaceId, message) {
    const session = this.sessions.get(workspaceId);
    if (!session) return;

    const data = JSON.stringify(message);
    session.connections.forEach(conn => {
      if (conn.readyState === 1) { // OPEN
        conn.send(data);
      }
    });
  }

  // 연결 추가
  addConnection(workspaceId, conn) {
    const session = this.sessions.get(workspaceId);
    if (session) {
      session.connections.add(conn);
      logger.debug(`[GPT] Added connection to workspace ${workspaceId}`);
    }
  }

  // 연결 제거
  removeConnection(workspaceId, conn) {
    const session = this.sessions.get(workspaceId);
    if (session) {
      session.connections.delete(conn);
      logger.debug(`[GPT] Removed connection from workspace ${workspaceId}`);
    }
  }

  // 세션 종료
  stopSession(workspaceId) {
    const session = this.sessions.get(workspaceId);
    if (!session) return;

    if (session.updateTimer) {
      clearInterval(session.updateTimer);
    }

    // 모든 연결에 종료 신호
    this.broadcast(workspaceId, {
      type: 'gpt-session-ended',
      timestamp: Date.now(),
    });

    this.sessions.delete(workspaceId);
    logger.info(`[GPT] Session stopped for workspace ${workspaceId}`);
  }
}

export const gptSessionManager = new GptSessionManager();
