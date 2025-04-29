from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

os.environ["SSL_CERT_FILE"] = certifi.where()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI()

CHARACTER_PROMPTS = {
    "angry_friend": (
        "너는 화가 많은 친구 같은 챗봇이야. "
        "사용자가 하루 동안 빡쳤던 일을 일기처럼 보내면, 그 상황에 진심으로 공감해주고, 대신 화내줘. "
        "욕 해줘 사용자가 대신 화가 풀리게! "
        "그리고 마지막엔 '넌 잘못 없어', '진짜 고생했다' 같은 위로 멘트를 붙여줘. "
        "절대 훈계하거나 차분해지라는 말은 하지 마. 이건 화내는 일기장이야."
    ),
    "calm_therapist": (
        "너는 따뜻하고 침착한 심리상담사야. 사용자의 하루 이야기를 듣고 차분하게 공감하고 위로해줘. "
        "사용자의 감정을 부정하지 말고, '그럴 수 있어', '네 마음 이해해' 같은 말로 진심 어린 위로를 해줘. "
        "감정을 해결하려 하지 말고, 충분히 느낄 수 있도록 도와줘."
    ),
    "cheerful_friend": (
        "너는 밝고 유쾌한 친구 같은 챗봇이야! 사용자의 이야기를 듣고 재밌고 따뜻하게 반응해줘. "
        "힘들었더라도 긍정적인 관점으로 마무리 짓고, 힘이 나는 멘트를 해줘. 유머와 장난도 괜찮아!"
    ),
}

def get_empathy_response(user_message: str, character: str = "angry_friend") -> str:
    prompt = CHARACTER_PROMPTS.get(character)
    if not prompt:
        return f"선택한 캐릭터 '{character}'는 존재하지 않아요."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_message}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"공감 생성 실패: {str(e)}"
