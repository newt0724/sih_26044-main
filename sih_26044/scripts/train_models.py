# =====================================================================
# ACADEMIA ↔ INDUSTRY PLATFORM: ML MODEL TRAINING & EVALUATION PIPELINE
# Script: scripts/train_models.py
# =====================================================================

import os
import json
import joblib
import datetime
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

def train_and_export_models(csv_path: str = None, output_dir: str = None):
    # Determine base directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    if csv_path is None:
        csv_path = os.path.join(base_dir, 'AI_Resume_Screening.csv')
        if not os.path.exists(csv_path):
            csv_path = os.path.join(base_dir, 'ml', 'data', 'AI_Resume_Screening.csv')

    if output_dir is None:
        output_dir = os.path.join(base_dir, 'ml', 'models')

    os.makedirs(output_dir, exist_ok=True)

    print(f"Loading dataset from: {csv_path}")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} candidate records with {len(df.columns)} columns.")

    # Data Cleaning
    df['Certifications'] = df['Certifications'].fillna('None')

    # Features and Targets
    feature_cols = ['Skills', 'Experience (Years)', 'Education', 'Certifications', 'Job Role', 'Projects Count', 'Salary Expectation ($)']
    X = df[feature_cols]
    
    y_class = (df['Recruiter Decision'] == 'Hire').astype(int)
    y_reg = df['AI Score (0-100)'].astype(float)

    # ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('skills_tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=100), 'Skills'),
            ('certs_tfidf', TfidfVectorizer(max_features=50), 'Certifications'),
            ('cat_encoder', OneHotEncoder(handle_unknown='ignore'), ['Education', 'Job Role']),
            ('num_scaler', StandardScaler(), ['Experience (Years)', 'Projects Count', 'Salary Expectation ($)'])
        ]
    )

    # Train / Test Split
    X_train, X_test, y_train_cls, y_test_cls = train_test_split(
        X, y_class, test_size=0.2, random_state=42, stratify=y_class
    )
    _, _, y_train_reg, y_test_reg = train_test_split(
        X, y_reg, test_size=0.2, random_state=42
    )

    print("\nPreprocessing and training models...")

    # Build Classifier Pipeline
    classifier_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, max_depth=4, random_state=42))
    ])

    # Build Regressor Pipeline
    regressor_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=4, random_state=42))
    ])

    # Fit Pipelines
    classifier_pipeline.fit(X_train, y_train_cls)
    regressor_pipeline.fit(X_train, y_train_reg)

    # Evaluation
    # Classifier Evaluation
    y_pred_cls = classifier_pipeline.predict(X_test)
    y_proba_cls = classifier_pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test_cls, y_pred_cls))
    prec = float(precision_score(y_test_cls, y_pred_cls, zero_division=0))
    rec = float(recall_score(y_test_cls, y_pred_cls, zero_division=0))
    f1 = float(f1_score(y_test_cls, y_pred_cls, zero_division=0))
    auc = float(roc_auc_score(y_test_cls, y_proba_cls))
    cm = confusion_matrix(y_test_cls, y_pred_cls).tolist()

    # Regressor Evaluation
    y_pred_reg = regressor_pipeline.predict(X_test)
    mae = float(mean_absolute_error(y_test_reg, y_pred_reg))
    rmse = float(np.sqrt(mean_squared_error(y_test_reg, y_pred_reg)))
    r2 = float(r2_score(y_test_reg, y_pred_reg))

    print("\n" + "="*50)
    print("[CLASSIFIER METRICS] (Recruiter Decision)")
    print("="*50)
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC AUC:   {auc:.4f}")
    print(f"Confusion Matrix: {cm}")

    print("\n" + "="*50)
    print("[REGRESSOR METRICS] (AI Score 0-100)")
    print("="*50)
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R2 Score: {r2:.4f}")

    # Save Model Artifacts
    clf_path = os.path.join(output_dir, 'screening_classifier.pkl')
    reg_path = os.path.join(output_dir, 'screening_regressor.pkl')
    meta_path = os.path.join(output_dir, 'model_metadata.json')

    joblib.dump(classifier_pipeline, clf_path)
    joblib.dump(regressor_pipeline, reg_path)

    metadata = {
        "model_version": "screening-v1.0",
        "trained_at": datetime.datetime.now().isoformat(),
        "dataset_size": len(df),
        "features": feature_cols,
        "classifier_metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm
        },
        "regressor_metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4)
        }
    }

    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "="*50)
    print("[ARTIFACTS SAVED]")
    print("="*50)
    print(f"Classifier: {clf_path}")
    print(f"Regressor:  {reg_path}")
    print(f"Metadata:   {meta_path}")

    return metadata

if __name__ == '__main__':
    train_and_export_models()
