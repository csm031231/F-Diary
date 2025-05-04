from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import certifi
import json

load_dotenv()

os.environ["SSL_CERT_FILE"] = certifi.where()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI()

def generate_prompt(intensity: str = "medium") -> str:
    base = (
        "너는 사용자의 감정에 진심으로 공감해주는 친구야. 사용자의 이야기를 듣고 다음 JSON 형식으로만 응답해:\n"
        """
        {
          "emotion": "<주된 감정 키워드>",
          "comment": "<강도에 맞춘 위로와 욕이 섞인 멘트>",
          "keywords": ["<핵심 키워드들>"],
          "feedback": "<사용자가 상황을 다르게 해석하거나 대처하는 데 도움 되는 건설적인 조언>"
        }
        """
        "\nfeedback은 훈계처럼 들리지 않게 부드럽고 제안하는 말투로 써. comment는 감정적으로, feedback은 이성적으로.\n"
    )
    if intensity == "soft":
        return base + "comment는 부드럽고 욕은 거의 없어야 해."
    elif intensity == "hard":
        return base + "comment는 거칠고 욕을 써도 괜찮아."
    return base + "comment는 적당히 빡친 친구처럼 해."

def get_empathy_response(user_message: str, intensity: str = "medium") -> dict:
    try:
        prompt = generate_prompt(intensity)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_message}
            ]
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "emotion": "알 수 없음",
            "comment": content.strip(),
            "keywords": [],
            "feedback": ""
        }
    except Exception as e:
        return {
            "emotion": "오류",
            "comment": f"공감 생성 실패: {str(e)}",
            "keywords": [],
            "feedback": ""
        }
