from PyPDF2 import PdfReader
from fastapi import UploadFile

async def extract_text_from_file(file: UploadFile) -> str:
    contents = await file.read()
    try:
        # Try parse as PDF
        from io import BytesIO
        reader = PdfReader(BytesIO(contents))
        text = []
        for p in reader.pages:
            extracted = p.extract_text()
            if extracted:
                text.append(extracted)
        text_out = "\n".join(text).strip()
        if text_out:
            await file.seek(0)
            return text_out
    except Exception:
        pass

    # Fallback: return raw bytes decoded if possible
    try:
        text_out = contents.decode("utf-8", errors="ignore")
        await file.seek(0)
        return text_out
    except Exception:
        await file.seek(0)
        return ""
