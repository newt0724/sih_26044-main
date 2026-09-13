# Academia ↔ Industry Platform

A complete, production-ready, clean, modular, and dynamic **Academia ↔ Industry Platform** connecting **Students / Candidates**, **Teachers**, **TPOs / Placement Cells**, and **Recruiters / Companies** with real trained AI/ML models, real resume anti-fraud processing, real database persistence, and a modern React + Vite + Tailwind CSS web application.

---

## 🏛 System Architecture

```
                    ┌──────────────────────────────────┐
                    │    REACT + VITE FRONTEND         │
                    │  Tailwind CSS + TypeScript/JS    │
                    └────────────────┬─────────────────┘
                                     │ REST API (Axios)
                                     ▼
                    ┌──────────────────────────────────┐
                    │        FASTAPI BACKEND           │
                    │  Router / Auth / Services / DB   │
                    └────────┬─────────────────┬───────┘
                             │                 │
                             ▼                 ▼
                    ┌─────────────────┐ ┌───────────────┐
                    │ SQLAlchemy ORM  │ │   ML Engine   │
                    │ Database (Data) │ │ & Resume Pipe │
                    └─────────────────┘ └───────────────┘
```

---

## 📂 Project Structure

```
academia-industry-platform/
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI Application Entrypoint & Startup Seed
│   │   ├── api/                      # REST API Endpoints
│   │   │   ├── auth.py               # Register, Login, Current User
│   │   │   ├── candidates.py         # Candidate profile, scoring, recommendations
│   │   │   ├── resumes.py            # Resume file upload, text extraction, anti-fraud
│   │   │   ├── jobs.py               # Job postings, candidate-job matching, apply
│   │   │   ├── assessments.py        # Coding assessment quiz bank & submission
│   │   │   ├── teacher.py            # Student readiness & syllabus gap analyzer
│   │   │   ├── tpo.py                # TPO analytics, heatmap, verification, export
│   │   │   └── analytics.py          # Platform-wide statistics
│   │   ├── core/
│   │   │   ├── config.py             # App configurations & settings
│   │   │   └── security.py           # Password hashing & JWT token handling
│   │   ├── db/
│   │   │   └── session.py            # SQLAlchemy database engine & session
│   │   ├── models/
│   │   │   └── models.py             # User, StudentProfile, Job, Application, Resume, Syllabus
│   │   └── schemas/
│   │       └── schemas.py            # Pydantic V2 validation schemas
│
├── ml/
│   ├── data/
│   │   └── AI_Resume_Screening.csv   # Reference candidate dataset (1000 records)
│   ├── models/
│   │   ├── screening_classifier.pkl  # Trained Gradient Boosting Classifier
│   │   ├── screening_regressor.pkl   # Trained Gradient Boosting Regressor
│   │   └── model_metadata.json       # Versioning, timestamps, and evaluation metrics
│
├── resume_processing/
│   ├── pdf_extractor.py              # pdfplumber font color & size inspection
│   ├── ocr.py                        # pytesseract + OpenCV fallback for scanned documents
│   ├── fraud_detection.py            # Hidden white-text & keyword stuffing detector
│   ├── identity_verification.py      # Regex boundary name matching (\bname\b)
│   ├── github_verification.py        # GitHub REST API profile & repo verifier
│   └── pipeline.py                   # Master evaluation pipeline orchestrator
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx            # Dynamic top navigation bar with user badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global JWT authentication context
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Hero landing page & live platform statistics
│   │   │   ├── LoginPage.jsx         # Sign in console
│   │   │   ├── RegisterPage.jsx      # Role registration console (Student, Teacher, Recruiter, TPO)
│   │   │   ├── StudentDashboard.jsx  # Candidate portal: resume upload, ML score, strengths & gaps
│   │   │   ├── JobMatchPage.jsx      # Job search & real-time candidate score prediction
│   │   │   ├── CodingAssessmentPage.jsx # Interactive 10-question coding assessment
│   │   │   ├── TeacherDashboard.jsx  # Student readiness & Institutional Syllabus Gap Analyzer
│   │   │   ├── RecruiterDashboard.jsx# Job drive manager & candidate ranking console
│   │   │   └── TPODashboard.jsx      # Placement analytics, skill heatmap, candidate exporter
│   │   ├── services/
│   │   │   └── api.js                # Centralized Axios API service layer
│   │   ├── App.jsx                   # React Router route setup
│   │   ├── main.jsx                  # React DOM entrypoint
│   │   └── index.css                 # Tailwind CSS styles & glassmorphism theme
│   ├── package.json
│   └── vite.config.js
│
├── scripts/
│   ├── init_db.py                    # Database initialization & demo seeding script
│   └── train_models.py               # ML training script with train/test metrics logging
│
├── tests/
│   └── test_end_to_end.py            # End-to-end integration test suite
│
├── .env.example                      # Configuration template
└── README.md                         # Documentation
```

---

## 📊 Dataset & Trained ML Models

### Dataset Summary (`AI_Resume_Screening.csv`)
* **Records**: 1,000 candidates across 11 features.
* **Features**: `Skills`, `Experience (Years)` ($r = 0.777$), `Education`, `Certifications`, `Job Role`, `Salary Expectation ($)`, `Projects Count` ($r = 0.358$).
* **Targets**:
  * `Recruiter Decision`: Classifier target (`Hire`: 81.2%, `Reject`: 18.8%).
  * `AI Score (0-100)`: Regressor score target.

### Model Metrics Logged (`ml/models/model_metadata.json`)
* **Gradient Boosting Classifier**:
  * **Accuracy**: `95.0%`
  * **Precision**: `96.9%`
  * **Recall**: `96.9%`
  * **F1 Score**: `96.9%`
  * **ROC AUC**: `0.9886`
* **Gradient Boosting Regressor**:
  * **MAE**: `20.61`
  * **RMSE**: `25.27`

---

## 🕵️ Resume Processing & Anti-Fraud Engine

1. **Text & Style Extraction**:
   * Uses `pdfplumber` to extract text and analyze word styling attributes.
   * Flags font size `< 3.0pt` or font color `(1, 1, 1)` / `(255, 255, 255)` as hidden white-text keyword stuffing.
2. **OCR Fallback**:
   * Automatically detects scanned PDFs or image resumes (`.png`, `.jpg`, `.jpeg`).
   * Runs `pytesseract` + `OpenCV` grayscale pre-processing for fallback text extraction.
3. **Identity Verification**:
   * Performs dynamic regex word boundary matching (`\bfirst_name\b`) against extracted text and social profile handles.
4. **GitHub REST API Verification**:
   * Queries `https://api.github.com/users/{username}` to extract public repositories, star count, and programming language tech stack. Adds proof-of-work bonus up to `+10%`.

---

## 🚀 How to Run the Application

### 1. Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### 2. Backend & Database Setup (Direct Database Method)
```bash
# Navigate to project root
cd sih_26044

# Train ML Models & Generate Artifacts
python scripts/train_models.py

# Launch FastAPI Backend Server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API interactive documentation available at: `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Dependencies
npm install

# Start Vite Development Server
npm run dev -- --port 3000
```
Frontend Web Portal available at: `http://localhost:3000`.

---

## 🧪 Testing

Execute end-to-end integration tests:
```bash
python -m unittest tests/test_end_to_end.py
```
