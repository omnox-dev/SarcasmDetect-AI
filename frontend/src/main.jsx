import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import Landing from './pages/Landing'
import TextPage from './pages/TextPage'
import VoicePage from './pages/VoicePage'
import ImagePage from './pages/ImagePage'
import Header from './components/Header'

function App(){
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/text' element={<TextPage/>} />
        <Route path='/voice' element={<VoicePage/>} />
        <Route path='/image' element={<ImagePage/>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
