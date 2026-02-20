from fastapi import APIRouter
from pydantic import BaseModel
from llm import CONFIG

router = APIRouter(prefix="/config", tags=["Config"])


# ✅ Request Model for Updating Config
class ConfigUpdate(BaseModel):
    api_base: str
    model_name: str
    api_key: str


# ✅ GET - View Current Config
@router.get("/")
def get_config():
    return {
        "api_base": CONFIG.get("api_base"),
        "model_name": CONFIG.get("model_name"),
        # Do NOT expose full API key for security
        "api_key": CONFIG.get("api_key")[:6] + "..." if CONFIG.get("api_key") else None
    }


# ✅ POST - Update Config
@router.post("/")
def update_config(data: ConfigUpdate):

    CONFIG["api_base"] = data.api_base
    CONFIG["model_name"] = data.model_name
    CONFIG["api_key"] = data.api_key

    return {
        "message": "Config updated successfully",
        "new_config": {
            "api_base": CONFIG["api_base"],
            "model_name": CONFIG["model_name"],
            "api_key": CONFIG["api_key"][:6] + "..."
        }
    }