import os
from typing import List

def extract_text_from_pdf(filepath: str) -> str:
    """Extracts text from PDF file using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(filepath)
        text = ""
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n--- Page {page_num + 1} ---\n" + page_text
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(filepath: str) -> str:
    """Extracts text from DOCX file."""
    try:
        import docx
        doc = docx.Document(filepath)
        return "\n".join([para.text for para in doc.paragraphs if para.text])
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

def extract_text_from_pptx(filepath: str) -> str:
    """Extracts text from PPTX slide deck."""
    try:
        from pptx import Presentation
        prs = Presentation(filepath)
        text = ""
        for slide_idx, slide in enumerate(prs.slides):
            text += f"\n--- Slide {slide_idx + 1} ---\n"
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text:
                    text += shape.text + "\n"
        return text
    except Exception as e:
        print(f"PPTX extraction error: {e}")
        return ""

def extract_document_content(filepath: str) -> str:
    """Extracts full readable text based on file format."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(filepath)
    elif ext == ".docx":
        return extract_text_from_docx(filepath)
    elif ext == ".pptx":
        return extract_text_from_pptx(filepath)
    elif ext == ".txt":
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    return ""
