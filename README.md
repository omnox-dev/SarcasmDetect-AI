# SarcasmDetect AI - Multi-Modal Sarcasm Analysis

**SarcasmDetect AI** | Text, Image & Voice Analysis

Web application for detecting sarcasm using Google Gemini AI and OCR technology.

## 🎯 Features

- **Text Analysis**: Analyze text for sarcasm with intensity scoring
- **Image Analysis**: Extract text from images and analyze for sarcasm
- **Voice Analysis**: Record or upload audio → Transcribe → Analyze

## 🚀 Quick Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- API Keys: Gemini API, OCR.space

### Installation

**Backend:**
```bash
cd backend
pip install -r requirements.txt

# Create .env file with your API keys:
# GEMINI_API_KEY=your_key
# OCR_API_KEY=your_key

python -m uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## 🧪 Testing

Test all features:
- **Text**: Paste text → Analyze
- **Image**: Upload image → Auto-extract → Analyze  
- **Voice**: Record or upload audio → Transcribe → Analyze

## 📦 Deployment

Can be deployed on free tiers:
- Backend: Railway, Render, etc.
- Frontend: Vercel, Netlify, etc.

See `FREE_DEPLOYMENT.md` for details.
## 📊 Project Structure

```
├── backend/         # FastAPI server
│   └── main.py
├── frontend/        # React + Vite app
│   └── src/
└── README.md
```

## 🛠️ Tech Stack

**Backend:** Python, FastAPI, Google Gemini AI, OCR.space  
**Frontend:** React 18, Vite 5, React Router, Axios

## 📝 API Endpoints

- `POST /api/analyze/text` - Text sarcasm analysis
- `POST /api/analyze/image` - Image OCR + analysis
- `POST /api/analyze/voice` - Voice transcription + analysis

Response includes: sarcasm label, intensity, emotions, risk score, explanation.

## 🐛 Common Issues

**Backend:**
- Missing dependencies? Run `pip install -r requirements.txt`
- API key errors? Check `.env` file in backend folder
- Port 8000 busy? Use `--port 8001` flag

**Frontend:**
- CORS errors? Ensure backend runs on port 8000
- Build errors? Delete `node_modules` and reinstall
- Voice issues? Use Chrome/Edge for best compatibility

- ## 📚 Documentation

- `frontend/README.md` - Frontend setup
- `FREE_DEPLOYMENT.md` - Deployment guide
- `PROJECT_JOURNAL.md` - Development notes

## 📄 License

MIT License - Free for educational and commercial use.

---

**Built with React + FastAPI + AI**

For detailed setup and troubleshooting, see documentation files above.
````
3. **Manual Transcript**: Paste text directly

All options → Gemini AI transcription → Sarcasm analysis

## 🚧 Future Enhancements (Optional)

Ideas for extending the project:
- [ ] User authentication & login
- [ ] Save analysis history to database
- [ ] Export results to PDF/CSV
- [ ] Batch analysis (multiple files at once)
- [ ] Real-time analysis via WebSocket
- [ ] Multi-language support
- [ ] Sentiment trends over time
- [ ] Browser extension
- [ ] Mobile app (React Native)

## � License

MIT License - Free to use for educational and commercial purposes.

## 👨‍💻 Tech Stack

**Backend:**
- Python 3.8+
- FastAPI (web framework)
- Uvicorn (ASGI server)
- Google Generative AI (Gemini)
- Pydantic (data validation)

**Frontend:**
- React 18.2
- Vite 5.0 (build tool)
- React Router 6.20 (navigation)
- Axios 1.6 (HTTP client)

**APIs:**
- Google Gemini AI (text, image, audio analysis)
- OCR.space (image text extraction)
- Web Speech API (browser recording)

**Deployment:**
- Railway (backend hosting)
- Vercel (frontend hosting)
- GitHub (version control)

---

## 🎓 For Students & Teachers

This project is perfect for:
- **Final year projects** (BE/BTech/MCA)
- **AI/ML course assignments**
- **Web development portfolios**
- **Hackathon submissions**
- **Research papers** on sarcasm detection

**Key Features for Academic Projects:**
- ✅ Modern tech stack (React + FastAPI)
- ✅ AI/ML integration (Gemini multimodal)
- ✅ Real-world application
- ✅ Complete documentation
- ✅ Zero ongoing costs
- ✅ Production-ready deployment
- ✅ Multiple input modalities (text, image, voice)

---

**Questions?** Check the documentation files or open an issue!

**Ready to deploy?** Follow `FREE_DEPLOYMENT.md` for step-by-step instructions! 🚀

**Need help?** All features are tested and working. Just follow the Quick Setup above! 💪
