# =====================================================================
# RESUME PROCESSING: OCR FALLBACK MODULE
# File: resume_processing/ocr.py
# =====================================================================

import os
from typing import Dict, Any

def perform_ocr_on_file(file_path: str) -> Dict[str, Any]:
    """
    Performs OCR fallback for image-based resumes or scanned PDFs.
    Uses OpenCV for image pre-processing and pytesseract for OCR text extraction.
    """
    if not os.path.exists(file_path):
        return {"success": False, "extracted_text": "", "error": "File not found"}

    ext = os.path.splitext(file_path)[1].lower()
    extracted_text = ""

    try:
        import cv2
        import pytesseract

        if ext in ['.png', '.jpg', '.jpeg']:
            img = cv2.imread(file_path)
            if img is not None:
                # Preprocessing: convert to grayscale
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                extracted_text = pytesseract.image_to_string(gray)
        elif ext == '.pdf':
            try:
                from pdf2image import convert_from_path
                images = convert_from_path(file_path)
                for img in images:
                    # Convert PIL Image to OpenCV format
                    import numpy as np
                    open_cv_image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                    gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
                    extracted_text += pytesseract.image_to_string(gray) + "\n"
            except Exception as pdf_err:
                return {"success": False, "extracted_text": "", "error": f"pdf2image OCR error: {pdf_err}"}

        return {
            "success": True,
            "extracted_text": extracted_text.strip(),
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "extracted_text": "",
            "error": f"OCR extraction unavailable: {str(e)}"
        }
