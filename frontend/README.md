# SarcasmDetect AI - Frontend

**React 18** + **Vite 5** | Modern UI for Multi-Modal Sarcasm Analysis

Frontend application built with React and Vite for SarcasmDetect AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Run

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

## 📦 Tech Stack

- React 18.2
- Vite 5.0
- React Router 6.20
- Axios 1.6

## 🔧 Configuration

Backend connection configured via Vite proxy in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // Change for production
    changeOrigin: true
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Update `vite.config.js` proxy target to your production backend URL before deploying.

## 📁 Structure

```
frontend/
├── src/
│   ├── pages/       # Main pages
│   ├── components/  # UI components
│   └── main.jsx     # Entry point
└── vite.config.js   # Vite config
```

## 🐛 Common Issues

**Backend connection fails:**
- Ensure backend runs on port 8000
- Check proxy settings in `vite.config.js`

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Voice recording issues:**
- Use Chrome or Edge for best compatibility

## 📚 More Info

See [main README](../README.md) for complete project documentation.

---

**Built with React + Vite**
