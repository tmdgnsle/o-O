#!/usr/bin/env python3
"""
Llama 3.1 스트리밍 테스트
텍스트 생성을 실시간으로 출력
"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TextIteratorStreamer
from threading import Thread
import os
from dotenv import load_dotenv
import sys

load_dotenv()


class LlamaStreamer:
    """Llama 3.1 스트리밍 생성기"""

    def __init__(self, model_name="meta-llama/Llama-3.1-8B-Instruct", quantization="int4"):
        """
        Args:
            model_name: HuggingFace 모델 이름
            quantization: "int4", "int8", "fp16", None
        """
        print(f"🔄 Llama 3.1 모델 로딩 중...")
        print(f"📦 모델: {model_name}")
        print(f"⚙️  양자화: {quantization}")
        print(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")

        # 토크나이저 로드
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=os.getenv("HUGGINGFACE_TOKEN")
        )

        # 양자화 설정
        if quantization == "int4" and torch.cuda.is_available():
            print("⚙️  INT4 양자화 (VRAM ~4GB)")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.bfloat16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        elif quantization == "int8" and torch.cuda.is_available():
            print("⚙️  INT8 양자화 (VRAM ~8GB)")
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        else:
            print("⚙️  FP16 (VRAM ~16GB)")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )

        print("✅ 모델 로딩 완료!\n")

    def generate_stream(self, prompt, max_new_tokens=512, temperature=0.7, conversation_history=None):
        """
        스트리밍 방식으로 텍스트 생성

        Args:
            prompt: 입력 프롬프트
            max_new_tokens: 최대 생성 토큰 수
            temperature: 생성 온도 (0.1~1.0)
            conversation_history: 대화 히스토리 (리스트)
        """
        # 메시지 포맷 (Llama 3.1 Chat Template)
        if conversation_history is None:
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant. You can speak Korean fluently."},
                {"role": "user", "content": prompt}
            ]
        else:
            messages = conversation_history + [{"role": "user", "content": prompt}]

        # 토크나이저 템플릿 적용
        input_text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # 토큰화
        inputs = self.tokenizer(input_text, return_tensors="pt").to(self.model.device)

        # 스트리머 생성
        streamer = TextIteratorStreamer(
            self.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True
        )

        # 생성 파라미터
        generation_kwargs = dict(
            inputs,
            streamer=streamer,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.1,
        )

        # 별도 스레드에서 생성 시작
        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()

        # 스트리밍 출력 및 응답 수집
        print("💬 응답:\n")
        response_text = ""
        for text in streamer:
            print(text, end="", flush=True)
            response_text += text

        print("\n")
        thread.join()

        return response_text


def test_simple_prompt():
    """간단한 프롬프트 테스트"""
    print("\n" + "="*60)
    print("🎯 Llama 3.1 스트리밍 테스트 - 간단한 질문")
    print("="*60)

    llama = LlamaStreamer(quantization="int4")

    prompt = "인공지능이란 무엇인가요? 3문장으로 간단히 설명해주세요."
    print(f"📝 질문: {prompt}\n")
    print("-" * 60)

    llama.generate_stream(prompt, max_new_tokens=200, temperature=0.7)


def test_creative_writing():
    """창작 글쓰기 테스트"""
    print("\n" + "="*60)
    print("🎯 Llama 3.1 스트리밍 테스트 - 창작 글쓰기")
    print("="*60)

    llama = LlamaStreamer(quantization="int4")

    prompt = "우주 탐험을 주제로 짧은 이야기를 한국어로 작성해주세요. (200자 이내)"
    print(f"📝 질문: {prompt}\n")
    print("-" * 60)

    llama.generate_stream(prompt, max_new_tokens=300, temperature=0.9)


def test_code_generation():
    """코드 생성 테스트"""
    print("\n" + "="*60)
    print("🎯 Llama 3.1 스트리밍 테스트 - 코드 생성")
    print("="*60)

    llama = LlamaStreamer(quantization="int4")

    prompt = "Python으로 피보나치 수열을 생성하는 함수를 작성해주세요."
    print(f"📝 질문: {prompt}\n")
    print("-" * 60)

    llama.generate_stream(prompt, max_new_tokens=300, temperature=0.3)


def test_summarization():
    """요약 테스트"""
    print("\n" + "="*60)
    print("🎯 Llama 3.1 스트리밍 테스트 - 텍스트 요약")
    print("="*60)

    llama = LlamaStreamer(quantization="int4")

    long_text = """
    인공지능(AI)은 인간의 학습능력, 추론능력, 지각능력을 인공적으로 구현한 컴퓨터 시스템이다.
    AI는 크게 약한 AI와 강한 AI로 나뉜다. 약한 AI는 특정 과제를 수행하는 데 특화되어 있으며,
    현재 대부분의 AI 시스템이 이에 해당한다. 반면 강한 AI는 인간 수준의 지능을 가진 시스템으로,
    아직 실현되지 않았다. 최근 머신러닝과 딥러닝 기술의 발전으로 AI는 이미지 인식, 자연어 처리,
    음성 인식 등 다양한 분야에서 인간 수준의 성능을 보이고 있다.
    """

    prompt = f"다음 텍스트를 한 문장으로 요약해주세요:\n\n{long_text}"
    print(f"📝 질문: (요약 요청)\n")
    print("-" * 60)

    llama.generate_stream(prompt, max_new_tokens=100, temperature=0.3)


def interactive_mode():
    """대화형 모드 (대화 기록 포함)"""
    print("\n" + "="*60)
    print("🎯 Llama 3.1 대화형 모드 (이전 대화 기억)")
    print("="*60)
    print("💡 'quit' 또는 'exit' 입력 시 종료")
    print("💡 'clear' 입력 시 대화 기록 초기화\n")

    llama = LlamaStreamer(quantization="int4")

    # 대화 히스토리 초기화
    conversation_history = [
        {"role": "system", "content": "You are a helpful AI assistant. You can speak Korean fluently."}
    ]

    turn = 0

    while True:
        try:
            user_input = input("\n📝 질문: ").strip()

            if user_input.lower() in ['quit', 'exit', '종료']:
                print(f"\n✅ 대화를 종료합니다. (총 {turn}턴)")
                break

            if user_input.lower() in ['clear', '초기화']:
                conversation_history = [
                    {"role": "system", "content": "You are a helpful AI assistant. You can speak Korean fluently."}
                ]
                turn = 0
                print("🔄 대화 기록이 초기화되었습니다.")
                continue

            if not user_input:
                continue

            turn += 1
            print("-" * 60)

            # 응답 생성 (대화 기록 포함)
            response = llama.generate_stream(
                user_input,
                max_new_tokens=512,
                temperature=0.7,
                conversation_history=conversation_history
            )

            # 대화 기록에 추가
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": response})

            print(f"💬 (턴 {turn}, 대화 기록: {len(conversation_history)} 메시지)")

        except KeyboardInterrupt:
            print(f"\n\n⚠️  대화를 종료합니다. (총 {turn}턴)")
            break
        except Exception as e:
            print(f"\n❌ 오류: {e}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Llama 3.1 스트리밍 테스트")
    parser.add_argument(
        "--mode",
        choices=["simple", "creative", "code", "summary", "chat"],
        default="simple",
        help="테스트 모드"
    )

    args = parser.parse_args()

    try:
        if args.mode == "simple":
            test_simple_prompt()
        elif args.mode == "creative":
            test_creative_writing()
        elif args.mode == "code":
            test_code_generation()
        elif args.mode == "summary":
            test_summarization()
        elif args.mode == "chat":
            interactive_mode()

    except KeyboardInterrupt:
        print("\n\n⚠️  사용자가 중단했습니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
