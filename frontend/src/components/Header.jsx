import React, {useContext, useState} from 'react'
import { Link } from 'react-router-dom'
import { ModeContext } from '../context/ModeContext'

export default function Header(){
  const { mode, toggleMode } = useContext(ModeContext); // Access mode and toggleMode from context
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header" style={{
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      margin: '16px',
      padding: '16px 24px',
      position: 'sticky',
      top: '16px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div className="brand">
        <Link 
          to="/" 
          className="brand-link" 
          style={{
            fontSize: '1.5em',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}
        >
          🎭 SarcasmDetect AI
        </Link>
      </div>
      <nav 
        className={`nav ${open ? 'open' : ''}`} 
        aria-label="Main navigation"
      >
        <Link 
          to="/text" 
          onClick={() => setOpen(false)}
          style={{
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            fontWeight: '500',
            display: 'block' // Always visible
          }}
        >
          📝 Text
        </Link>
        <Link 
          to="/voice" 
          onClick={() => setOpen(false)}
          style={{
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            fontWeight: '500',
            display: mode === 'default' ? 'block' : 'none' // Visible only in default mode
          }}
        >
          🎤 Voice
        </Link>
        <Link 
          to="/image" 
          onClick={() => setOpen(false)}
          style={{
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            fontWeight: '500',
            display: 'block' // Always visible
          }}
        >
          📸 Image
        </Link>
      </nav>
      <button 
        className="hamburger" 
        aria-label="Toggle menu" 
        onClick={()=>setOpen(!open)} 
        aria-expanded={open}
        style={{
          display: 'none',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '10px',
          padding: '10px',
          cursor: 'pointer'
        }}
      >
        <span style={{display: 'block', width: '24px', height: '18px', position: 'relative'}}>
          {/* Top line */}
          <span 
            style={{
              display: 'block',
              background: '#a5b4fc',
              height: '3px',
              borderRadius: '2px',
              position: 'absolute',
              width: '100%',
              top: open ? '50%' : '0',
              left: 0,
              transform: open ? 'translateY(-50%) rotate(45deg)' : 'none',
              transition: 'all 0.2s ease'
            }}
          />
          {/* Middle line */}
          <span 
            style={{
              display: 'block',
              background: '#a5b4fc',
              height: '3px',
              borderRadius: '2px',
              position: 'absolute',
              width: '100%',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              opacity: open ? 0 : 1,
              transition: 'opacity 0.15s ease'
            }}
          />
          {/* Bottom line */}
          <span 
            style={{
              display: 'block',
              background: '#a5b4fc',
              height: '3px',
              borderRadius: '2px',
              position: 'absolute',
              width: '100%',
              top: open ? '50%' : '100%',
              left: 0,
              transform: open ? 'translateY(-50%) rotate(-45deg)' : 'translateY(-100%)',
              transition: 'all 0.2s ease'
            }}
          />
        </span>
      </button>
      <button 
        onClick={toggleMode} 
        style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {mode === 'default' ? 'Default' : 'Social Media Analysis'} Mode
      </button>
      
      {/* Lightweight mobile styles - NO animations */}
      <style>{`
        @media (max-width: 800px) {
          .site-header {
            flex-wrap: wrap;
          }
          .hamburger {
            display: block !important;
          }
          .nav {
            display: ${open ? 'flex' : 'none'};
            position: absolute;
            top: calc(100% + 12px);
            right: 16px;
            left: 16px;
            background: rgba(30, 41, 59, 0.98);
            backdrop-filter: blur(8px);
            flex-direction: column;
            padding: 16px;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            gap: 8px;
          }
          .nav a {
            width: 100%;
            text-align: center;
            padding: 14px !important;
          }
        }
        @media (min-width: 801px) {
          .nav {
            display: flex !important;
            gap: 8px;
            align-items: center;
          }
        }
        /* Simple hover effects - no heavy animations */
        .nav a:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
        }
        .hamburger:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </header>
  )
}
