import json
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Default fast + cheap; change if you need more reasoning
_MODEL = "gemini-1.5-flash"

class GeminiService:
    def __init__(self, model_name: str = _MODEL):
        self.model = genai.GenerativeModel(model_name)

    def gen_text(self, prompt: str) -> str:
        resp = self.model.generate_content(prompt)
        return resp.text

    def gen_json(self, prompt: str, schema_hint: str) -> dict:
        """
        Ask Gemini to return strict JSON. We validate with json.loads.
        schema_hint: a short JSON shape sample (string) to bias the model.
        """
        full_prompt = (
            f"{prompt}\n\n"
            "Return ONLY valid minified JSON. "
            "Do not include backticks or explanations.\n"
            f"JSON schema hint:\n{schema_hint}"
        )
        resp = self.model.generate_content(full_prompt)
        text = resp.text.strip()
        # Try to locate JSON if model adds accidental text
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start:end+1]
        try:
            return json.loads(text)
        except Exception:
            # Fallback to raw text packaged as error
            return {"_raw": text, "_error": "Failed to parse JSON"}
