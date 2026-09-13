# =====================================================================
# RESUME PROCESSING: PDF TEXT & FONT EXTRACTION MODULE
# File: resume_processing/pdf_extractor.py
# =====================================================================

import pdfplumber
from typing import Dict, Any, List

def is_color_white(color) -> bool:
    """Detects white or near-white font colors across RGB, CMYK, Hex, and Grayscale formats."""
    if color is None:
        return False
    if isinstance(color, str):
        col_clean = color.strip().lower()
        if col_clean in ['#ffffff', '#fff', '#fafafa', '#f8f9fa', '#f0f0f0', 'white', 'rgb(255,255,255)']:
            return True
        if col_clean.startswith('(') or col_clean.startswith('['):
            try:
                nums = [float(x.strip()) for x in col_clean.strip('()[]').split(',') if x.strip()]
                return is_color_white(nums)
            except Exception:
                pass
    if isinstance(color, (int, float)):
        return color == 1 or color == 1.0 or color >= 240 or color >= 0.92
    if isinstance(color, (tuple, list)):
        if len(color) == 0:
            return False
        # CMYK White is (0, 0, 0, 0)
        if len(color) == 4 and all(x == 0 or x == 0.0 for x in color):
            return True
        # RGB White is (1, 1, 1) or (255, 255, 255)
        return all(
            x == 1 or x == 1.0 or (isinstance(x, (int, float)) and (x >= 0.92 or x >= 240))
            for x in color
        )
    return False

def extract_pdf_content(file_path: str) -> Dict[str, Any]:
    """
    Extracts text and inspects word styling (color, font size, render mode) from a PDF resume.
    Returns extracted text, detected hidden words (white/tiny font/invisible), and whether file is scanned.
    """
    extracted_text_pages: List[str] = []
    hidden_keywords: List[str] = []
    is_scanned = False
    total_words_count = 0

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                if text.strip():
                    extracted_text_pages.append(text)

                # Inspect words with color and size attributes
                words = page.extract_words(extra_attrs=["non_stroking_color", "size", "render_mode"])
                total_words_count += len(words)

                for word in words:
                    token = word['text']
                    font_size = float(word.get('size', 10.0))
                    color = word.get('non_stroking_color')
                    render_mode = word.get('render_mode', 0)

                    is_white = is_color_white(color)
                    is_tiny = font_size < 4.0
                    is_invisible = (render_mode == 3)

                    if is_white or is_tiny or is_invisible:
                        hidden_keywords.append(token)

                # Also inspect raw page chars for hidden text
                for char in page.chars:
                    c_color = char.get('non_stroking_color')
                    c_size = float(char.get('size', 10.0))
                    c_render = char.get('render_mode', 0)
                    if (is_color_white(c_color) or c_size < 4.0 or c_render == 3) and char.get('text', '').strip():
                        char_txt = char.get('text', '').strip()
                        if char_txt and char_txt not in hidden_keywords:
                            hidden_keywords.append(char_txt)

            if total_words_count == 0 or len("".join(extracted_text_pages).strip()) < 30:
                is_scanned = True

    except Exception as e:
        is_scanned = True
        return {
            "success": False,
            "extracted_text": "",
            "hidden_keywords": [],
            "is_scanned": True,
            "error": str(e)
        }

    full_text = "\n".join(extracted_text_pages).strip()
    return {
        "success": True,
        "extracted_text": full_text,
        "hidden_keywords": hidden_keywords,
        "is_scanned": is_scanned,
        "error": None
    }
