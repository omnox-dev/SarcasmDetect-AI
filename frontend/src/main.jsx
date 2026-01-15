import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './styles.css'
import Landing from './pages/Landing'
import Catalog from './pages/Catalog'
import TextPage from './pages/TextPage'
import VoicePage from './pages/VoicePage'
import ImagePage from './pages/ImagePage'
import Header from './components/Header'
import ModeTheme from './components/ModeTheme'
import { ModeProvider } from './context/ModeContext'
import ScrollToTop from './components/ScrollToTop'

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      <ModeTheme />
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/catalog' element={<Catalog/>} />
        <Route path='/text' element={<TextPage/>} />
        <Route path='/voice' element={<VoicePage/>} />
        <Route path='/image' element={<ImagePage/>} />
      </Routes>
    </>
  );
}

function App(){
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<ModeProvider><App /></ModeProvider>)
