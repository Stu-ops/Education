import os
import json
import re
import logging
from dotenv import load_dotenv
from litellm import completion

logger = logging.getLogger(__name__)
load_dotenv()

# ======================================================
# 🔥 Runtime Editable CONFIG (Controlled via /config)
# ======================================================

CONFIG = {
    "model_name": os.getenv("MODEL_NAME", "gemini/gemini-2.5-flash-lite"),
    "api_key": os.getenv("GEMINI_API_KEY"),
    "api_base": os.getenv("API_BASE"),
}

# ======================================================
# Helper: Centralized LLM Call
# ======================================================

def _llm_call(messages):
    return completion(
        model=CONFIG["model_name"],
        api_key=CONFIG["api_key"],
        api_base=CONFIG.get("api_base"),
        messages=messages,
    )


# ======================================================
# Prompt Loader
# ======================================================

def load_prompt_for_class(class_number: int) -> dict:
    base_dir = os.path.dirname(__file__)
    base_prompt_path = os.path.join(base_dir, "prompts", "two.json")

    if not os.path.exists(base_prompt_path):
        return {
            "role": "system",
            "content": {"type": "text", "text": "You are a helpful math tutor."}
        }

    try:
        with open(base_prompt_path, "r", encoding="utf-8") as f:
            prompt = json.load(f)
    except Exception:
        return {
            "role": "system",
            "content": {"type": "text", "text": "You are a helpful math tutor."}
        }

    return prompt


# ======================================================
# Generate Hint
# ======================================================

def generate_hint(
    question: str,
    last_context: str = "",
    image_b64: str | None = None,
    user_class: int | str | None = None,
    parent_feedback: str | None = None,
    **kwargs
) -> str:

    from helper import normalize_class_to_number

    class_number = normalize_class_to_number(user_class)
    system_prompt = load_prompt_for_class(class_number)

    feedback_section = f"\nParent feedback: {parent_feedback}" if parent_feedback else ""

    content = [{
        "type": "text",
        "text": f"Student class: class_{class_number}\n"
                f"Student question: {question}\n"
                f"Previous context: {last_context}{feedback_section}\n"
                f"Respond concisely."
    }]

    if image_b64:
        image_data_url = f"data:image/png;base64,{image_b64}"
        content.append({
            "type": "image_url",
            "image_url": image_data_url
        })

    messages = [
        system_prompt,
        {"role": "user", "content": content}
    ]

    response = _llm_call(messages)
    return response["choices"][0]["message"]["content"].strip()


# ======================================================
# Get Chat Title
# ======================================================

def get_chat_title(text: str) -> str:
    try:
        messages = [
            {
                "role": "system",
                "content": "Generate a short 3-4 word chat title."
            },
            {"role": "user", "content": text}
        ]

        response = _llm_call(messages)
        return response["choices"][0]["message"]["content"].strip()

    except Exception as e:
        return f"Error: {str(e)}"


# ======================================================
# Check Answer
# ======================================================

def check_answer(conversation=None, question=None, answer=None, context=None, class_topics=None):

    if conversation is None:
        conversation = []
        if question:
            conversation.append({"role": "assistant", "content": question})
        if answer:
            conversation.append({"role": "user", "content": answer})
        if context:
            conversation.append({"role": "system", "content": f"Context: {context}"})

    system_prompt = """
You are NOT a tutor. You are a grading engine that outputs only JSON.
Return strictly valid JSON:
{
  "final": true or false,
  "correct": true or false,
  "feedback": "short reasoning (1–2 lines)",
  "correct_answer": "the correct answer"
}
"""

    try:
        response = _llm_call([
            {"role": "system", "content": system_prompt},
            *conversation
        ])

        text = response["choices"][0]["message"]["content"].strip()

        # Remove markdown fences if present
        m_code = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.S | re.I)
        if m_code:
            text = m_code.group(1).strip()

        match = re.search(r"\{.*\}", text, re.S)
        if match:
            text = match.group(0)

        return json.loads(text)

    except Exception as e:
        logger.error(f"check_answer error: {e}")
        return {
            "final": False,
            "correct": False,
            "feedback": "Error or invalid JSON"
        }


# ======================================================
# Generate Parent Report
# ======================================================

def generate_parent_report(child: dict, comparison: dict | None = None) -> str:

    system_prompt = {
        "role": "system",
        "content": "Write a short encouraging parent report (70-120 words)."
    }

    user_content = json.dumps({
        "child": child,
        "comparison": comparison
    })

    messages = [
        system_prompt,
        {"role": "user", "content": user_content},
    ]

    resp = _llm_call(messages)
    return resp["choices"][0]["message"]["content"].strip()