> 📄 Licensed under custom Academic Demonstration License  
> © 2025 omanox-dev. All rights reserved.

---
# 🧠 SarcasmDetect AI – Multi-Modal Sarcasm Analysis

**Developed and Owned by [omanox-dev]**

---

## 📘 Overview

**SarcasmDetect AI** is an advanced web application that detects sarcasm across **text**, **images**, and **voice** inputs using **Google Gemini AI** and **OCR.space** APIs.
It demonstrates **multi-modal AI analysis** through a modern **React + FastAPI** architecture.

This project is an original creation by **omanox-dev** and is provided strictly for **educational, research, and demonstration purposes.**

---

## 🎯 Core Features

* 📝 **Text Analysis** – Detect sarcasm with probability & confidence scoring
* 🖼️ **Image Analysis** – Extract text (OCR) and analyze for sarcasm
* 🎤 **Voice Analysis** – Record or upload audio → Transcribe → Analyze tone and sarcasm
* ⚡ Real-time results through FastAPI backend
* 🧩 Modular AI integration (Gemini + OCR APIs)

---

## 🚀 Quick Setup

### Prerequisites

* Python 3.8+
* Node.js 18+
* API Keys: **Gemini API** and **OCR.space**

### Installation

#### Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file:
# GEMINI_API_KEY=your_key
# OCR_API_KEY=your_key

python -m uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Testing

1. **Text:** Enter text → Click “Analyze”
2. **Image:** Upload image → OCR → Analyze
3. **Voice:** Record or upload audio → Transcribe → Analyze

All modalities use **Gemini AI** for sarcasm detection and tone evaluation.

---

## 📁 Project Structure

```
├── backend/         # FastAPI server
│   └── main.py
├── frontend/        # React + Vite app
│   └── src/
└── README.md
```

---

## 🛠️ Tech Stack

**Backend:**

* Python 3.9+, FastAPI, Uvicorn, Pydantic
* Google Gemini AI (text & audio processing)
* OCR.space API (image text extraction)

**Frontend:**

* React 18 + Vite 5
* React Router, Axios, Web Speech API

**Deployment:**

* Railway (backend hosting)
* Vercel (frontend hosting)
* GitHub (version control)

---

## 🔗 API Endpoints

| Endpoint                  | Description                            |
| ------------------------- | -------------------------------------- |
| `POST /api/analyze/text`  | Text sarcasm analysis                  |
| `POST /api/analyze/image` | OCR + image sarcasm analysis           |
| `POST /api/analyze/voice` | Voice transcription + sarcasm analysis |

Each response includes:

> `sarcasm_label`, `intensity`, `emotions`, `risk_score`, `explanation`.

---

## 🎓 Ideal Use Cases

Perfect for:

* Final-year or MCA/BTech AI projects
* NLP or emotion analysis research
* Web development portfolios
* Hackathons or AI showcases

---

## ⚖️ License & Ownership

### Copyright © 2025 [omanox-dev]

This project and its source code are the **exclusive intellectual property** of the developer **omanox-dev**.
It is **licensed only for educational and non-commercial use**.

> ❌ Redistribution, resale, or public upload (including GitHub forks, reposts, or re-branding) is strictly prohibited without written consent.
> ⚠️ This system is **not a clinical or diagnostic tool** and should not be used for mental-health advice or therapy.
> ✅ Educational, research, and demonstration use is permitted under direct attribution to the author.

**Attribution Format:**

> *Developed by omanox-dev — SarcasmDetect AI (2025)*

---

## 💬 Contact

For collaboration, licensing, or research inquiries:
📧 **[omdombe8@gmail.com](mailto:omdombe8@gmail.com)**

---

**© 2025 omanox-dev – All Rights Reserved**
*“Bringing context understanding to AI communication.”*
