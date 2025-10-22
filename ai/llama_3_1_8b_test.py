"""
Llama 3.1 8B 테스트
RTX A6000 48GB VRAM 최적화
"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import os
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

class Llama31Chat:
    def __init__(self, model_name="meta-llama/Llama-3.1-8B-Instruct", quantization="int4"):
        """
        Llama 3.1 8B 모델 초기화

        Args:
            model_name: 모델 이름
            quantization: "int4", "int8", "fp16", None
        """
        self.model_name = model_name
        print(f"🚀 모델 로딩 중: {model_name}")
        print(f"📊 양자화: {quantization if quantization else 'FP16'}")
        print(f"💾 GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}\n")

        # 토크나이저 로드
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=os.getenv("HUGGINGFACE_TOKEN")
        )

        # 양자화 설정
        if quantization == "int4" and torch.cuda.is_available():
            print("⚙️  INT4 양자화 설정 (VRAM ~4GB)")
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
            print("⚙️  INT8 양자화 설정 (VRAM ~8GB)")
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )
        else:
            print("⚙️  FP16 설정 (VRAM ~16GB)")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto",
                token=os.getenv("HUGGINGFACE_TOKEN")
            )

        self.conversation_history = []

        # VRAM 사용량 출력
        if torch.cuda.is_available():
            print(f"✅ 모델 로딩 완료!")
            print(f"📊 VRAM 사용량: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
            print(f"📊 VRAM 예약: {torch.cuda.memory_reserved() / 1024**3:.2f} GB\n")
        else:
            print("✅ 모델 로딩 완료! (CPU 모드)\n")

    def chat(self, user_message, max_tokens=512, temperature=0.7):
        """사용자 메시지에 대한 응답 생성"""
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # 채팅 템플릿 적용
        formatted_prompt = self.tokenizer.apply_chat_template(
            self.conversation_history,
            tokenize=False,
            add_generation_prompt=True
        )

        # 토큰화
        inputs = self.tokenizer(
            formatted_prompt,
            return_tensors="pt"
        ).to(self.model.device)

        # 생성
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )

        # 디코딩
        full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # 어시스턴트 응답만 추출
        if "assistant" in full_response:
            assistant_response = full_response.split("assistant")[-1].strip()
        else:
            # 프롬프트 제거
            assistant_response = full_response[len(formatted_prompt):].strip()

        # 히스토리에 추가
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_response
        })

        return assistant_response

    def reset(self):
        """대화 히스토리 초기화"""
        self.conversation_history = []
        print("🔄 대화 히스토리 초기화\n")

    def get_vram_usage(self):
        """현재 VRAM 사용량 반환"""
        if torch.cuda.is_available():
            allocated = torch.cuda.memory_allocated() / 1024**3
            reserved = torch.cuda.memory_reserved() / 1024**3
            return f"사용: {allocated:.2f}GB / 예약: {reserved:.2f}GB"
        return "CPU 모드"


def main():
    print("=" * 50)
    print("🦙 Llama 3.1 8B 대화형 챗봇")
    print("=" * 50)
    print("\n명령어:")
    print("  'exit' / 'quit': 종료")
    print("  'reset': 대화 초기화")
    print("  'history': 대화 히스토리")
    print("  'vram': VRAM 사용량\n")

    # 챗봇 초기화 (INT4 양자화 - 48GB VRAM에 최적)
    chatbot = Llama31Chat(quantization="int4")

    # 대화 루프
    while True:
        try:
            user_input = input("You: ").strip()

            if user_input.lower() in ['exit', 'quit']:
                print("\n👋 채팅 종료")
                break

            if user_input.lower() == 'reset':
                chatbot.reset()
                continue

            if user_input.lower() == 'vram':
                print(f"📊 VRAM: {chatbot.get_vram_usage()}\n")
                continue

            if user_input.lower() == 'history':
                print("\n" + "=" * 50)
                print("📜 대화 히스토리")
                print("=" * 50)
                for msg in chatbot.conversation_history:
                    role = "You" if msg["role"] == "user" else "🤖"
                    print(f"{role}: {msg['content']}\n")
                continue

            if not user_input:
                continue

            # 응답 생성
            print("🤖: ", end="", flush=True)
            response = chatbot.chat(user_input)
            print(f"{response}\n")

        except KeyboardInterrupt:
            print("\n\n👋 채팅 종료")
            break
        except Exception as e:
            print(f"\n❌ 오류: {e}\n")


if __name__ == "__main__":
    main()
