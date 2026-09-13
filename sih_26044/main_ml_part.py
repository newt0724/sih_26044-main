"""Authoritative ML entrypoint for the platform.

The original Colab workflow is implemented as importable runtime code in
``main_ml_engine``. This module remains the public entrypoint used by the
backend so the project has one preferred scoring flow.
"""

from main_ml_engine import evaluate_candidate

__all__ = ["evaluate_candidate"]
