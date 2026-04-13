import shutil
import sys
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse

BASE_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BASE_DIR.parent

# Ensure imports work whether run as a package, via uvicorn, or directly as a script.
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    # When running as a package (uvicorn backend.main:app)
    from backend.vector_ingest_service import ingest_zip, load_registry
except ModuleNotFoundError:
    # When running from backend directory or direct script execution
    from vector_ingest_service import ingest_zip, load_registry

router = APIRouter(prefix="/vector-ingest", tags=["Vector Ingestion"])
LOCAL_HTML = BASE_DIR / "vector_ingest_local.html"


@router.get("/ui", response_class=HTMLResponse)
def upload_ui():
    return HTMLResponse(content=LOCAL_HTML.read_text(encoding="utf-8"))


@router.post("/upload-zip")
async def upload_zip_and_ingest(
    class_number: str = Form(...),
    subject: str = Form(...),
    zip_file: UploadFile = File(...),
):
    if not zip_file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Please upload a .zip file")

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        zip_path = tmp_path / zip_file.filename

        with zip_path.open("wb") as out:
            shutil.copyfileobj(zip_file.file, out)

        try:
            result = ingest_zip(
                zip_path=zip_path,
                class_number=class_number,
                subject=subject,
                zip_filename=zip_file.filename,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    return JSONResponse(result)


@router.get("/records")
def get_ingestion_records():
    return load_registry()
