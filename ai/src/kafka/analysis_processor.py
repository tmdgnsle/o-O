"""
Kafka 메시지 분석 처리 모듈
- INITIAL: VIDEO/IMAGE/TEXT 분석하여 마인드맵 노드 생성
- CONTEXTUAL: 3개 자식 노드 생성
"""
import logging
from typing import Dict, Any, List, Optional
from src.core.transcript_extractor import TranscriptExtractor
from src.core.llama_text_analyzer import LlamaTextAnalyzer
from src.core.llama_vision_analyzer import LlamaVisionAnalyzer
from src.core.image_analyzer import ImageAnalyzer

logger = logging.getLogger(__name__)


class AnalysisProcessor:
    """Kafka 분석 요청 처리기"""

    def __init__(self, text_analyzer: LlamaTextAnalyzer, vision_analyzer: LlamaVisionAnalyzer):
        """
        Args:
            text_analyzer: LLM 텍스트 분석기
            vision_analyzer: LLM 비전 분석기
        """
        self.text_analyzer = text_analyzer
        self.vision_analyzer = vision_analyzer
        self.image_analyzer = ImageAnalyzer()

    def process_initial(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        INITIAL 분석 처리 - contentType에 따라 VIDEO/IMAGE/TEXT 처리

        Args:
            request: Kafka 요청 메시지
                - workspaceId: 워크스페이스 ID
                - nodeId: 노드 ID
                - contentType: 'VIDEO', 'IMAGE', 'TEXT'
                - contentUrl: 컨텐츠 URL (TEXT일 경우 null)
                - prompt: 사용자 프롬프트

        Returns:
            분석 결과 딕셔너리
        """
        # workspaceId를 int로 변환 (Java long과 호환)
        workspace_id = int(request['workspaceId'])
        node_id = request['nodeId']
        content_url = request.get('contentUrl')
        content_type = request.get('contentType', 'TEXT')
        prompt = request.get('prompt', '')

        logger.info(f"INITIAL 분석 시작: workspaceId={workspace_id}, nodeId={node_id}, "
                   f"contentType={content_type}")

        try:
            # ContentType에 따라 컨텐츠 추출
            content_text = ""

            if content_type == 'VIDEO':
                # VIDEO: YouTube 자막 추출
                if not content_url:
                    raise ValueError("VIDEO 타입인데 contentUrl이 없습니다")

                logger.info(f"📹 VIDEO 분석: {content_url}")
                transcript_result = TranscriptExtractor.get_transcript(content_url)
                if transcript_result['success']:
                    content_text = transcript_result['full_text']
                    logger.info(f"✅ 자막 추출 성공: {len(content_text)}자")
                else:
                    error_msg = transcript_result.get('error', 'Unknown error')
                    logger.warning(f"⚠️  자막 추출 실패: {error_msg}")
                    raise ValueError(f"자막 추출 실패: {error_msg}")

            elif content_type == 'IMAGE':
                # IMAGE: 이미지 다운로드 후 Vision 모델로 분석
                if not content_url:
                    raise ValueError("IMAGE 타입인데 contentUrl이 없습니다")

                logger.info(f"🖼️  IMAGE 분석: {content_url}")

                # 이미지 다운로드
                image_path = self.image_analyzer.download_image(content_url)
                if not image_path:
                    raise ValueError(f"이미지 다운로드 실패: {content_url}")

                logger.info(f"✅ 이미지 다운로드 성공: {image_path}")

                # Vision 모델로 이미지 분석
                vision_prompt = f"""이 이미지를 상세하게 분석하고 포괄적인 설명을 제공해주세요.

사용자 요청: {prompt}

다음 내용을 설명해주세요:
1. 주요 내용과 텍스트 (보이는 모든 텍스트를 읽어주세요)
2. 시각적 요소들 (차트, 그래프, 다이어그램, 로고, 심볼)
3. 제시된 핵심 개념과 아이디어
4. 계층 구조나 조직 방식

명확하고 완전한 문장으로 상세한 분석을 제공해주세요. 반복하지 마세요."""

                content_text = self.vision_analyzer.analyze_image(
                    image=image_path,
                    prompt=vision_prompt
                )
                logger.info(f"✅ Vision 분석 완료: {len(content_text)}자")

            elif content_type == 'TEXT':
                # TEXT: prompt만 사용
                logger.info(f"📝 TEXT 분석: prompt만 사용")
                content_text = ""  # 빈 문자열, prompt만 사용

            else:
                raise ValueError(f"알 수 없는 contentType: {content_type}")

            # 마인드맵 생성 프롬프트
            system_prompt = """You are an expert at analyzing content and generating hierarchical mindmap nodes in JSON format.

CRITICAL: You MUST output ONLY valid JSON. No explanations, no markdown, no code blocks.

Generate nodes with appropriate depth based on content complexity:
- Main category nodes under root nodeId={node_id}
- Sub-nodes under each category as needed
- Logical hierarchical structure

Output this EXACT JSON structure:
{{
  "aiSummary": "Brief 1-2 sentence summary",
  "nodes": [
    {{"tempId": "temp-1", "parentId": {node_id}, "keyword": "Category 1", "memo": "Description"}},
    {{"tempId": "temp-2", "parentId": {node_id}, "keyword": "Category 2", "memo": "Description"}},
    {{"tempId": "temp-3", "parentId": "temp-1", "keyword": "Subtopic 1-1", "memo": "Details"}},
    {{"tempId": "temp-4", "parentId": "temp-1", "keyword": "Subtopic 1-2", "memo": "Details"}}
  ]
}}

Rules:
1. tempId: "temp-1", "temp-2", etc (sequential)
2. keyword: 2-5 words, concise
3. memo: 10-30 characters, specific
4. Output ONLY JSON, nothing else
""".format(node_id=node_id)

            # contentType에 따라 user prompt 구성
            if content_text:
                user_prompt_text = f"""사용자 요청: {prompt}

콘텐츠 내용:
{content_text[:5000]}

위 내용을 분석하여 체계적인 마인드맵 노드들을 생성해주세요.
콘텐츠의 복잡도와 내용에 따라 적절한 개수와 깊이로 구성하세요."""
            else:
                # TEXT 타입: prompt만 사용
                user_prompt_text = f"""사용자 요청: {prompt}

위 주제/요청을 분석하여 체계적인 마인드맵 노드들을 생성해주세요.
주제의 복잡도와 내용에 따라 적절한 개수와 깊이로 구성하세요."""

            # LLM 호출 (JSON 생성을 위해 낮은 temperature)
            logger.info("🤖 LLM으로 마인드맵 생성 중...")
            response = self.text_analyzer.generate(
                prompt=user_prompt_text,
                system_prompt=system_prompt,
                max_tokens=2048,
                temperature=0.2,
                top_p=0.85,
                top_k=40,
                repetition_penalty=1.15
            )

            # 응답 검증 및 로깅
            logger.info(f"📄 LLM 원본 응답 길이: {len(response)}자")
            logger.info(f"📄 LLM 응답 미리보기:\n{response[:500]}")

            # 빈 응답 체크
            if not response or not response.strip():
                raise ValueError("LLM이 빈 응답을 반환했습니다")

            # JSON 파싱 전처리
            response = response.strip()

            # JSON 코드 블록 제거
            if '```json' in response:
                response = response.split('```json')[1]
            if '```' in response:
                response = response.split('```')[0]

            # JSON 객체 추출 (첫 번째 { 부터 마지막 } 까지)
            start_idx = response.find('{')
            end_idx = response.rfind('}')

            if start_idx == -1 or end_idx == -1:
                raise ValueError("응답에서 JSON 객체를 찾을 수 없습니다")

            response = response[start_idx:end_idx+1].strip()

            # JSON 파싱 시도
            import json
            try:
                result_data = json.loads(response)
            except json.JSONDecodeError as e:
                logger.error(f"JSON 파싱 실패!")
                logger.error(f"파싱하려던 문자열:\n{response}")
                raise ValueError(f"LLM 응답을 JSON으로 파싱할 수 없습니다: {e}")

            # 결과 검증
            if 'aiSummary' not in result_data or 'nodes' not in result_data:
                raise ValueError("응답에 aiSummary 또는 nodes가 없습니다")

            logger.info(f"✅ 생성된 노드 개수: {len(result_data['nodes'])}개")

            # Kafka 응답 형식으로 변환
            kafka_response = {
                "workspaceId": workspace_id,
                "aiSummary": result_data['aiSummary'],
                "status": "SUCCESS",
                "nodes": result_data['nodes']
            }

            logger.info(f"✅ INITIAL 분석 완료 ({content_type}): {len(result_data['nodes'])}개 노드 생성")
            return kafka_response

        except Exception as e:
            logger.error(f"❌ INITIAL 분석 실패 ({content_type}): {e}", exc_info=True)
            return {
                "workspaceId": workspace_id,
                "status": "FAILED",
                "error": str(e)
            }

    def process_contextual(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        CONTEXTUAL 분석 처리 - 3개 자식 노드 생성
        contentType에 따라 VIDEO/IMAGE/TEXT 처리

        Args:
            request: Kafka 요청 메시지
                - workspaceId: 워크스페이스 ID
                - nodeId: 확장할 노드 ID
                - nodes: 부모 노드들 (내 노드 포함)
                - contentType: 'VIDEO', 'IMAGE', 'TEXT'

        Returns:
            분석 결과 딕셔너리
        """
        # workspaceId를 int로 변환 (Java long과 호환)
        workspace_id = int(request['workspaceId'])
        node_id = request['nodeId']
        parent_nodes = request.get('nodes', [])
        content_type = request.get('contentType', 'TEXT')

        logger.info(f"CONTEXTUAL 분석 시작: workspaceId={workspace_id}, nodeId={node_id}, "
                   f"contentType={content_type}, 노드 체인 수={len(parent_nodes)}")

        try:
            # 1. nodeId로 확장할 노드 찾기
            target_node = None
            for node in parent_nodes:
                if node.get('nodeId') == node_id or node.get('id') == node_id:
                    target_node = node
                    break

            if not target_node:
                raise ValueError(f"nodeId={node_id}인 노드를 찾을 수 없습니다")

            logger.info(f"확장할 노드 찾음: keyword={target_node.get('keyword')}")

            # 2. ContentType에 따라 컨텐츠 추출
            content_text = ""

            if content_type == 'VIDEO':
                # VIDEO: keyword에서 YouTube URL 추출
                content_url = target_node.get('keyword', '')
                if not content_url:
                    raise ValueError("VIDEO 타입인데 keyword에 URL이 없습니다")

                logger.info(f"📹 VIDEO 분석: {content_url}")
                transcript_result = TranscriptExtractor.get_transcript(content_url)
                if transcript_result['success']:
                    content_text = transcript_result['full_text']
                    logger.info(f"✅ 자막 추출 성공: {len(content_text)}자")
                else:
                    error_msg = transcript_result.get('error', 'Unknown error')
                    logger.warning(f"⚠️  자막 추출 실패: {error_msg}")
                    raise ValueError(f"자막 추출 실패: {error_msg}")

            elif content_type == 'IMAGE':
                # IMAGE: keyword에서 이미지 URL 추출
                content_url = target_node.get('keyword', '')
                if not content_url:
                    raise ValueError("IMAGE 타입인데 keyword에 URL이 없습니다")

                logger.info(f"🖼️  IMAGE 분석: {content_url}")

                # 이미지 다운로드
                image_path = self.image_analyzer.download_image(content_url)
                if not image_path:
                    raise ValueError(f"이미지 다운로드 실패: {content_url}")

                logger.info(f"✅ 이미지 다운로드 성공: {image_path}")

                # Vision 모델로 이미지 분석
                vision_prompt = f"""이 이미지를 상세하게 분석하고 포괄적인 설명을 제공해주세요.

다음 내용을 설명해주세요:
1. 주요 내용과 텍스트 (보이는 모든 텍스트를 읽어주세요)
2. 시각적 요소들 (차트, 그래프, 다이어그램, 로고, 심볼)
3. 제시된 핵심 개념과 아이디어
4. 상세한 하위 주제나 구성 요소

명확하고 완전한 문장으로 상세한 분석을 제공해주세요. 반복하지 마세요."""

                content_text = self.vision_analyzer.analyze_image(
                    image=image_path,
                    prompt=vision_prompt
                )
                logger.info(f"✅ Vision 분석 완료: {len(content_text)}자")

            elif content_type == 'TEXT':
                # TEXT: 부모 노드 문맥만 사용
                logger.info(f"📝 TEXT 분석: 부모 노드 문맥 사용")
                content_text = ""

            else:
                raise ValueError(f"알 수 없는 contentType: {content_type}")

            # 3. 부모 노드 문맥 구성
            context_text = self._build_context_from_parents(parent_nodes)

            # 4. 마인드맵 생성 프롬프트
            system_prompt = """You are an expert at generating exactly 3 child nodes based on parent context.

CRITICAL: You MUST output ONLY valid JSON. No explanations, no markdown, no code blocks.

Output this EXACT JSON structure:
{{
  "nodes": [
    {{"keyword": "Subtopic 1", "memo": "Specific description"}},
    {{"keyword": "Subtopic 2", "memo": "Specific description"}},
    {{"keyword": "Subtopic 3", "memo": "Specific description"}}
  ]
}}

Rules:
1. Generate EXACTLY 3 nodes
2. keyword: 2-5 words, concise
3. memo: 10-30 characters, specific
4. Follow the flow of parent nodes logically
5. Output ONLY JSON, nothing else
"""

            # contentType에 따라 user prompt 구성
            if content_text:
                # VIDEO/IMAGE: 컨텐츠 내용 + 부모 노드 문맥
                user_prompt_text = f"""부모 노드 문맥:
{context_text}

컨텐츠 분석 결과:
{content_text[:3000]}

위 문맥과 컨텐츠를 기반으로 해당 노드의 3개 하위 노드를 생성해주세요."""
            else:
                # TEXT: 부모 노드 문맥만 사용
                user_prompt_text = f"""부모 노드 문맥:
{context_text}

위 문맥을 기반으로 해당 노드의 3개 하위 노드를 생성해주세요."""

            # LLM 호출 (JSON 생성을 위해 낮은 temperature)
            logger.info("🤖 LLM으로 3개 자식 노드 생성 중...")
            response = self.text_analyzer.generate(
                prompt=user_prompt_text,
                system_prompt=system_prompt,
                max_tokens=1024,
                temperature=0.2,
                top_p=0.85,
                top_k=40,
                repetition_penalty=1.15
            )

            # 응답 검증 및 로깅
            logger.info(f"📄 LLM 원본 응답 길이: {len(response)}자")
            logger.info(f"📄 LLM 응답 미리보기:\n{response[:500]}")

            # 빈 응답 체크
            if not response or not response.strip():
                raise ValueError("LLM이 빈 응답을 반환했습니다")

            # JSON 파싱 전처리
            response = response.strip()

            # JSON 코드 블록 제거
            if '```json' in response:
                response = response.split('```json')[1]
            if '```' in response:
                response = response.split('```')[0]

            # JSON 객체 추출 (첫 번째 { 부터 마지막 } 까지)
            start_idx = response.find('{')
            end_idx = response.rfind('}')

            if start_idx == -1 or end_idx == -1:
                raise ValueError("응답에서 JSON 객체를 찾을 수 없습니다")

            response = response[start_idx:end_idx+1].strip()

            # JSON 파싱 시도
            import json
            try:
                result_data = json.loads(response)
            except json.JSONDecodeError as e:
                logger.error(f"JSON 파싱 실패!")
                logger.error(f"파싱하려던 문자열:\n{response}")
                raise ValueError(f"LLM 응답을 JSON으로 파싱할 수 없습니다: {e}")

            # 결과 검증
            if 'nodes' not in result_data:
                raise ValueError("응답에 nodes가 없습니다")

            if len(result_data['nodes']) != 3:
                logger.warning(f"노드 개수가 3개가 아닙니다: {len(result_data['nodes'])}개")
                # 3개로 자르기 또는 채우기
                if len(result_data['nodes']) > 3:
                    result_data['nodes'] = result_data['nodes'][:3]
                elif len(result_data['nodes']) < 3:
                    # 부족한 만큼 기본 노드 추가
                    for i in range(3 - len(result_data['nodes'])):
                        result_data['nodes'].append({
                            "keyword": f"추가 주제 {i+1}",
                            "memo": "상세 내용이 필요합니다"
                        })

            # Kafka 응답 형식으로 변환
            kafka_response = {
                "workspaceId": workspace_id,
                "nodeId": node_id,
                "status": "SUCCESS",
                "nodes": result_data['nodes']
            }

            logger.info(f"✅ CONTEXTUAL 분석 완료: {len(result_data['nodes'])}개 노드 생성")
            return kafka_response

        except Exception as e:
            logger.error(f"❌ CONTEXTUAL 분석 실패: {e}", exc_info=True)
            return {
                "workspaceId": workspace_id,
                "status": "FAILED",
                "error": str(e)
            }

    def _build_context_from_parents(self, parent_nodes: List[Dict]) -> str:
        """
        부모 노드들로부터 문맥 텍스트 생성

        Args:
            parent_nodes: 부모 노드 리스트

        Returns:
            문맥 텍스트
        """
        if not parent_nodes:
            return "(부모 노드 없음)"

        context_lines = []
        for i, node in enumerate(parent_nodes, 1):
            keyword = node.get('keyword', '')
            memo = node.get('memo', '')
            context_lines.append(f"{i}. {keyword}: {memo}")

        return "\n".join(context_lines)

    def process_request(self, request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Kafka 요청 처리 (분석 타입에 따라 분기)

        Args:
            request: Kafka 요청 메시지

        Returns:
            분석 결과 또는 None
        """
        analysis_type = request.get('analysisType')

        if analysis_type == 'INITIAL':
            return self.process_initial(request)
        elif analysis_type == 'CONTEXTUAL':
            return self.process_contextual(request)
        else:
            logger.error(f"알 수 없는 분석 타입: {analysis_type}")
            return {
                "workspaceId": request.get('workspaceId'),
                "status": "FAILED",
                "error": f"Unknown analysis type: {analysis_type}"
            }
