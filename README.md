
> 📄 Licensed under the **Academic Demonstration License**  
> © 2025 **omanox-dev**. All rights reserved.

---

# 🧠 SarcasmDetect AI – Multi-Modal Sarcasm Analysis

**Developed and Owned by [omanox-dev]**

---

## 📘 Overview

**SarcasmDetect AI** is a multi-modal web application that detects sarcasm across **text**, **image**, and **voice** inputs using **Google Gemini AI** and **OCR.space APIs**.  
It demonstrates advanced **AI orchestration** through a modern **React + FastAPI** full-stack architecture.

This project is an original creation by **omanox-dev** and is provided strictly for **educational, research, and demonstration purposes**.

---

## 🎯 Core Features

- 📝 **Text Analysis** – Detect sarcasm with probability and confidence scoring  
- 🖼️ **Image Analysis** – Extract text (OCR) and analyze for sarcasm  
- 🎤 **Voice Analysis** – Record or upload audio → Transcribe → Analyze tone and sarcasm  
- ⚡ Real-time results via FastAPI backend  
- 🧩 Modular AI integration (Gemini + OCR APIs)

---

## 🚀 Quick Setup

### Prerequisites
- Python 3.8+  
- Node.js 18+  
- API Keys: **Gemini API** and **OCR.space**

### Installation

#### Backend
```bash
cd backend
pip install -r requirements.txt

# Create .env file with your keys:
# GEMINI_API_KEY=your_key
# OCR_API_KEY=your_key

python -m uvicorn main:app --reload

#### Frontend

cd frontend
npm install
npm run dev
```

Then open → [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing

1. **Text:** Enter text → Click “Analyze”
2. **Image:** Upload image → OCR → Analyze
3. **Voice:** Record or upload audio → Transcribe → Analyze

All inputs are processed through **Gemini AI** for sarcasm detection and tone interpretation.

---

## 📁 Project Structure

```
├── backend/          # FastAPI server
│   └── main.py
├── frontend/         # React + Vite app
│   └── src/
├── LICENSE.txt
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

| Endpoint                  | Description                        |
| ------------------------- | ---------------------------------- |
| `POST /api/analyze/text`  | Analyze text for sarcasm           |
| `POST /api/analyze/image` | Perform OCR + sarcasm analysis     |
| `POST /api/analyze/voice` | Transcribe and analyze voice input |

Each response includes:
`sarcasm_label`, `intensity`, `emotions`, `risk_score`, and `explanation`.

---

## 🧩 Development Environment & AI Assistance

This project was developed using **Visual Studio Code (VS Code)** with **GitHub Copilot** and **GitHub Copilot Agents** assisting the coding workflow.

**How Tools Were Used:**

* **VS Code:** Main IDE for writing, testing, and debugging
* **GitHub Copilot:** Assisted with syntax, boilerplate, and documentation suggestions
* **GitHub Copilot Agents (Agentic AI):** Helped in refactoring, automating repetitive scaffolding, and test script generation
* **Google Gemini API:** Provided AI inference for sarcasm detection
* **OCR.space API:** Extracted text from images for sarcasm analysis

> 🧠 *All architectural design, code orchestration, and final implementation were created and reviewed by omanox-dev. AI tools were used ethically as development assistants.*

---

## 🎓 Ideal Use Cases

Perfect for:

* Final-year or MCA/BTech AI projects
* NLP and sentiment analysis research
* Web development portfolios
* Hackathons and AI innovation showcases

---

## ⚖️ License & Ownership

### Copyright © 2025 **omanox-dev**

This project and its source code are the **exclusive intellectual property** of **omanox-dev**.
It is **licensed only for educational and non-commercial use**.

> ❌ Redistribution, resale, or public upload (including forks or re-branding) is strictly prohibited without written consent.
> ⚠️ This software is **not a clinical or diagnostic tool** and must not be used for mental-health or therapeutic purposes.
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

````
---
