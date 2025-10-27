#!/usr/bin/env python3
"""
Llama 3.1 영구 채팅 (모델을 한 번만 로드)
첫 로딩만 느리고, 이후엔 빠르게 대화 가능
"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TextIteratorStreamer
from threading import Thread
import os
from dotenv import load_dotenv
import sys

load_dotenv()

# 전역 변수로 모델 저장 (한 번만 로드)
_model = None
_tokenizer = None


def load_model_once(model_name="meta-llama/Llama-3.1-8B-Instruct", quantization="int4"):
    """모델을 한 번만 로드 (전역 변수에 저장)"""
    global _model, _tokenizer

    if _model is not None and _tokenizer is not None:
        print("✅ 이미 로드된 모델 사용 (빠름!)")
        return _model, _tokenizer

    print("="*60)
    print("🔄 Llama 3.1 모델 로딩 중... (첫 로딩만 느림)")
    print("="*60)
    print(f"📦 모델: {model_name}")
    print(f"⚙️  양자화: {quantization}")
    print(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print()

    # 토크나이저 로드
    print("1/2 토크나이저 로딩...")
    _tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        token=os.getenv("HUGGINGFACE_TOKEN")
    )

    # 모델 로드
    print("2/2 모델 로딩...")
    if quantization == "int4" and torch.cuda.is_available():
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        _model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto",
            token=os.getenv("HUGGINGFACE_TOKEN"),
            low_cpu_mem_usage=True,
            torch_dtype=torch.bfloat16,
        )
    elif quantization == "int8" and torch.cuda.is_available():
        quantization_config = BitsAndBytesConfig(load_in_8bit=True)
        _model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto",
            token=os.getenv("HUGGINGFACE_TOKEN"),
            low_cpu_mem_usage=True,
        )
    else:
        _model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            token=os.getenv("HUGGINGFACE_TOKEN"),
            low_cpu_mem_usage=True,
        )

    print("✅ 모델 로딩 완료!")
    print("="*60)
    print()

    return _model, _tokenizer


def generate_stream(prompt, conversation_history=None, max_new_tokens=512, temperature=0.7):
    """스트리밍 생성 (전역 모델 사용)"""
    model, tokenizer = load_model_once()

    # 메시지 포맷
    if conversation_history is None:
        messages = [
            {"role": "system", "content": "You are a helpful AI assistant. You can speak Korean fluently."},
            {"role": "user", "content": prompt}
        ]
    else:
        messages = conversation_history + [{"role": "user", "content": prompt}]

    # 토크나이저 템플릿 적용
    input_text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    # 토큰화
    inputs = tokenizer(input_text, return_tensors="pt").to(model.device)

    # 스트리머 생성
    streamer = TextIteratorStreamer(
        tokenizer,
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
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    # 스트리밍 출력
    print("💬 응답:\n")
    response_text = ""
    for text in streamer:
        print(text, end="", flush=True)
        response_text += text

    print("\n")
    thread.join()

    return response_text


def chat_mode():
    """대화형 모드"""
    print("\n" + "="*60)
    print("🎯 Llama 3.1 고속 채팅 모드")
    print("="*60)
    print("💡 첫 실행만 느리고, 이후엔 빠릅니다!")
    print("💡 'quit' 또는 'exit' 입력 시 종료")
    print("💡 'clear' 입력 시 대화 기록 초기화")
    print("="*60)
    print()

    # 첫 로딩 (여기서만 1분 걸림)
    load_model_once()

    # 대화 히스토리
    conversation_history = [
        {"role": "system", "content": "You are a helpful AI assistant. You can speak Korean fluently."}
    ]
    turn = 0

    print("✅ 준비 완료! 이제 빠르게 대화할 수 있습니다.\n")

    while True:
        try:
            user_input = input("📝 질문: ").strip()

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

            # 응답 생성 (이미 로드된 모델 사용 - 빠름!)
            response = generate_stream(
                user_input,
                conversation_history=conversation_history,
                max_new_tokens=512,
                temperature=0.7
            )

            # 대화 기록 업데이트
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": response})

            print(f"💬 (턴 {turn}, 메시지: {len(conversation_history)}개)")

        except KeyboardInterrupt:
            print(f"\n\n⚠️  대화를 종료합니다. (총 {turn}턴)")
            break
        except Exception as e:
            print(f"\n❌ 오류: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    try:
        chat_mode()
    except KeyboardInterrupt:
        print("\n\n⚠️  프로그램을 종료합니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
