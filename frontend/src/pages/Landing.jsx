import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="page container">
      <header className="header">
        <div>
          <h1 className="title" style={{margin:0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2em'}}>🎭 SarcasmDetect AI</h1>
          <p className="tag">AI-powered sarcasm detection for text, voice, and images</p>
        </div>
        <div>
          <span className="pill" style={{background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '8px 16px', borderRadius: '20px', fontWeight: '600'}}>v1.0</span>
        </div>
      </header>

      <main>
        <section className="hero" style={{textAlign: 'center', padding: '60px 20px', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
          <div>
            <h2 className="title" style={{fontSize: '3em', marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800'}}>
              Understand Tone Instantly
            </h2>
            <p className="subtitle" style={{fontSize: '1.2em', color: '#94a3b8', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px'}}>
              Analyze text, speech, or images for sarcasm using advanced AI technology
            </p>
            <div className="hero-ctas" style={{marginTop: 32, display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <Link to="/text" className="btn" style={{padding: '16px 32px', fontSize: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>📝 Analyze Text</Link>
              <Link to="/image" className="btn" style={{padding: '16px 32px', fontSize: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>📸 Analyze Image</Link>
              <Link to="/voice" className="btn" style={{padding: '16px 32px', fontSize: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>🎤 Analyze Speech</Link>
            </div>
          </div>
        </section>

        <div className="cards" style={{marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'}}>
          <Link to="/text" className="card" style={{textDecoration: 'none'}}>
            <div style={{fontSize: '3.5em', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3))'}}>📝</div>
            <h3 style={{margin: '0 0 12px 0', fontSize: '1.5em'}}>Text Analysis</h3>
            <p className="muted" style={{margin: 0, fontSize: '1em', color: '#94a3b8'}}>Paste any text and get instant sarcasm detection with emotion analysis</p>
          </Link>
          
          <Link to="/image" className="card" style={{textDecoration: 'none'}}>
            <div style={{fontSize: '3.5em', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3))'}}>📸</div>
            <h3 style={{margin: '0 0 12px 0', fontSize: '1.5em'}}>Image Analysis</h3>
            <p className="muted" style={{margin: 0, fontSize: '1em', color: '#94a3b8'}}>Upload images with text, auto-extract with OCR & analyze tone</p>
          </Link>
          
          <Link to="/voice" className="card" style={{textDecoration: 'none'}}>
            <div style={{fontSize: '3.5em', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.3))'}}>🎤</div>
            <h3 style={{margin: '0 0 12px 0', fontSize: '1.5em'}}>Speech Analysis</h3>
            <p className="muted" style={{margin: 0, fontSize: '1em', color: '#94a3b8'}}>Record or upload audio for FREE AI transcription & analysis</p>
          </Link>
        </div>

        <section style={{marginTop: 48, padding: '32px', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <h3 style={{margin: '0 0 16px 0', fontSize: '1.8em', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>How It Works</h3>
          <p className="muted" style={{margin: 0, fontSize: '1.1em', color: '#94a3b8', lineHeight: '1.6'}}>
            Powered by <strong style={{color: '#a5b4fc'}}>Google Gemini AI</strong> and <strong style={{color: '#a5b4fc'}}>OCR.space</strong> • Detects sarcasm intensity, emotions, and risk scores • Fast, accurate & multi-language support
          </p>
        </section>

        <section style={{marginTop: 48, padding: '32px', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <h3 style={{margin: '0 0 24px 0', fontSize: '1.8em', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>❓ Frequently Asked Questions</h3>
          
          <div style={{display: 'grid', gap: '12px', textAlign: 'left'}}>
            {/* FAQ 1 - Risk Score */}
            <div style={{
              background: openFAQ === 0 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => toggleFAQ(0)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span>⚠️ What is the "Risk Score"?</span>
                <span style={{fontSize: '1.2em', transition: 'transform 0.2s ease', transform: openFAQ === 0 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
              </button>
              {openFAQ === 0 && (
                <div style={{padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  <p style={{margin: '0 0 12px 0'}}>
                    The <strong>Misinterpretation Risk Score (0-100)</strong> measures how likely a message could be misunderstood or cause confusion. It's calculated based on sarcasm intensity and emotional tone:
                  </p>
                  <ul style={{margin: '8px 0 12px 20px', color: '#94a3b8', lineHeight: '1.8'}}>
                    <li><strong style={{color: '#10b981'}}>🟢 0-33 (Low Risk):</strong> Clear communication, unlikely to cause confusion</li>
                    <li><strong style={{color: '#f59e0b'}}>🟡 34-66 (Moderate Risk):</strong> Some sarcasm present, could be misinterpreted</li>
                    <li><strong style={{color: '#ef4444'}}>🔴 67-100 (High Risk):</strong> Heavy sarcasm with negative tone, high chance of offense or misunderstanding</li>
                  </ul>
                  <p style={{margin: 0, color: '#94a3b8', fontSize: '0.95em'}}>
                    💡 <strong>Use cases:</strong> Email warnings before sending, customer service flagging, social media moderation, communication coaching
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 - Accuracy */}
            <div style={{
              background: openFAQ === 1 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => toggleFAQ(1)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span>🎯 How accurate is the sarcasm detection?</span>
                <span style={{fontSize: '1.2em', transition: 'transform 0.2s ease', transform: openFAQ === 1 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
              </button>
              {openFAQ === 1 && (
                <div style={{padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  <p style={{margin: 0}}>
                    Our AI model (powered by Google Gemini) achieves high accuracy by analyzing context, word patterns, and emotional tone. However, sarcasm is inherently subjective and context-dependent, so results should be used as guidance rather than absolute truth.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 - Languages */}
            <div style={{
              background: openFAQ === 2 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => toggleFAQ(2)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span>🌍 What languages are supported?</span>
                <span style={{fontSize: '1.2em', transition: 'transform 0.2s ease', transform: openFAQ === 2 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
              </button>
              {openFAQ === 2 && (
                <div style={{padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  <p style={{margin: 0}}>
                    Currently optimized for <strong>English</strong>. The AI can process other languages but accuracy may vary. Voice transcription supports 100+ languages via Google's Speech API.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 4 - Privacy */}
            <div style={{
              background: openFAQ === 3 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => toggleFAQ(3)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span>🔒 Is my data stored or shared?</span>
                <span style={{fontSize: '1.2em', transition: 'transform 0.2s ease', transform: openFAQ === 3 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
              </button>
              {openFAQ === 3 && (
                <div style={{padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  <p style={{margin: 0}}>
                    No. All analysis is done in real-time and nothing is permanently stored. Your text, audio, and images are processed securely and discarded immediately after analysis.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 5 - Free */}
            <div style={{
              background: openFAQ === 4 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => toggleFAQ(4)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span>💰 Is this service free?</span>
                <span style={{fontSize: '1.2em', transition: 'transform 0.2s ease', transform: openFAQ === 4 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
              </button>
              {openFAQ === 4 && (
                <div style={{padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  <p style={{margin: 0}}>
                    Yes! SarcasmDetect AI is completely free to use. All features including voice transcription, OCR, and AI analysis are available at no cost.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 6 - Audio Formats */}
            <div style={{
              background: openFAQ === 5 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <button
                onClick={() => toggleFAQ(5)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left'
                }}
              >
                <span>🎤 What audio formats are supported?</span>
                <span style={{fontSize: '1.2em', transition: 'transform 0.2s ease', transform: openFAQ === 5 ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
              </button>
              {openFAQ === 5 && (
                <div style={{padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  <p style={{margin: 0}}>
                    Supported formats: <strong>MP3, WAV, MP4, AAC, OGG, FLAC</strong> (max 20MB). You can also record directly from your browser using the microphone.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" style={{marginTop: 60, textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.95em', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
  SarcasmDetect AI v1.0 • Built with ❤️ using React + FastAPI + AI
      </footer>
    </div>
  )
}
