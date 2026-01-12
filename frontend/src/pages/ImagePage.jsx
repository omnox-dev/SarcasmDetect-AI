import React, {useState, useContext} from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config.js'
import { ModeContext } from '../context/ModeContext' // Import ModeContext

export default function ImagePage(){
  const { mode } = useContext(ModeContext); // Access the current mode from context

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleFileChange(e){
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    
    // Create preview
    if(selectedFile){
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  async function submit(){
    if(!file){ setError('Please select an image file'); return }
    setLoading(true); setError(null); setResult(null)
    try{
      // Preprocess image to avoid OCR provider failures on very small or unusual files
      const processed = await preprocessImageFile(file)
      const fd = new FormData()
      fd.append('file', processed, file.name)
      fd.append('image_caption', caption || '')
    
      const res = await axios.post(`${API_BASE_URL}/api/analyze/image`, fd, { 
        headers: {
          'Content-Type':'multipart/form-data',
          'X-Domain': mode // Add the X-Domain header
        },
        timeout: 60000 // 60 second timeout for OCR processing
      })
      setResult(res.data)
    }catch(e){
      setError(e.response?.data?.detail || e.message)
    }finally{ setLoading(false) }
  }

  // Client-side preprocessing: load image into canvas, resize (or upscale small images), and export as JPEG blob
  function preprocessImageFile(file){
    const MIN_DIM = 600 // upscale tiny images to at least this dimension
    const MAX_DIM = 1600 // limit max dimension to reduce upload size

    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        try{
          let {width, height} = img
          // If very small, upscale proportionally to MIN_DIM
          const largest = Math.max(width, height)
          let scale = 1
          if(largest < MIN_DIM) scale = MIN_DIM / largest
          else if(largest > MAX_DIM) scale = MAX_DIM / largest

          const outW = Math.round(width * scale)
          const outH = Math.round(height * scale)
          const canvas = document.createElement('canvas')
          canvas.width = outW
          canvas.height = outH
          const ctx = canvas.getContext('2d')
          // Fill transparent backgrounds with white to help OCR
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0,0,outW,outH)
          ctx.drawImage(img, 0, 0, outW, outH)
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url)
            if(!blob) return reject(new Error('Image processing failed'))
            // Return a Blob that can be appended as file in FormData
            resolve(blob)
          }, 'image/jpeg', 0.92)
        }catch(err){
          URL.revokeObjectURL(url)
          reject(err)
        }
      }
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for processing')) }
      img.src = url
    })
  }

  return (
    <div className="page container">
      <header className="header">
        <h1>🖼️ Image Sarcasm Analysis {mode === 'social_media' && <span style={{fontSize: '0.6em', color: '#ec4899', fontWeight: '600'}}>(Social Media Mode)</span>}</h1>
        <Link to="/" className="btn" style={{
          padding: '10px 20px',
          fontSize: '14px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc'
        }}>← Back to Home</Link>
      </header>

      <main>
        <p style={{color: '#94a3b8', fontSize: '15px', marginBottom: '24px'}}>
          📸 Upload an image with text (screenshot, meme, message, etc.) • 🤖 OCR will automatically extract and analyze for sarcasm
        </p>

        {/* Upload Image */}
        <div style={{
          marginBottom: '24px',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px', color: '#a5b4fc'}}>
            📤 Upload Image
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{
              display: 'block',
              padding: '12px',
              border: '3px dashed rgba(99, 102, 241, 0.5)',
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              background: 'rgba(51, 65, 85, 0.5)',
              fontSize: '16px',
              fontWeight: '500',
              color: '#f1f5f9'
            }}
          />
        </div>

        {/* Image Preview */}
        {preview && (
          <div style={{
            marginBottom: '24px',
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <label style={{display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '16px', color: '#a5b4fc'}}>
              🖼️ Image Preview
            </label>
            <div style={{
              border: '2px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              maxWidth: '500px',
              background: 'rgba(51, 65, 85, 0.3)'
            }}>
              <img 
                src={preview} 
                alt="Preview" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        )}

        {/* Optional Caption */}
        <div style={{
          marginBottom: '24px',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px', color: '#a5b4fc'}}>
            💬 Image Caption (Optional)
          </label>
          <input 
            value={caption} 
            onChange={e=>setCaption(e.target.value)}
            placeholder="Add context about the image..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              fontSize: '15px',
              background: 'rgba(51, 65, 85, 0.5)',
              color: '#f1f5f9'
            }}
          />
        </div>

        <div className="actions">
          <button 
            className="btn" 
            onClick={submit} 
            disabled={loading || !file}
            style={{
              fontSize: '18px',
              padding: '14px 32px',
              fontWeight: '600'
            }}
          >
            {loading ? '🔍 Extracting & Analyzing...' : '🚀 Analyze Image'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <p>⏳ Extracting text from image...</p>
            <p style={{fontSize: '0.9em', color: '#94a3b8'}}>This may take 2-5 seconds</p>
          </div>
        )}

        {error && <div className="error">❌ Error: {error}</div>}

        {result && (
          <div className="result">
            <h3>📊 Analysis Results</h3>
            
            <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>📝 Extracted Text (OCR):</h4>
              <div style={{
                background: 'rgba(51, 65, 85, 0.5)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
                color: '#e2e8f0'
              }}>
                {result.ocr_text || '(No text detected)'}
              </div>
            </div>

            {(() => {
              const normalizedLabel = (result.sarcasm_label || '').toLowerCase()
              const isSarcastic = normalizedLabel.includes('sarcastic')
              const badgeStyle = {
                background: isSarcastic
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '600'
              }
              const labelText = result.sarcasm_label || (isSarcastic ? 'Sarcastic' : 'Not Sarcastic')

              return (
                <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                  <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>
                    {mode === 'social_media' ? '🎭 Sarcasm Analysis (Social Media Context)' : '🎭 Sarcasm Analysis'}
                  </h4>
                  <div className="badge" style={badgeStyle}>
                    {labelText} — {result.sarcasm_intensity}% intensity
                  </div>
                </div>
              )
            })()}

            <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>💡 Explanation:</h4>
              <p style={{color: '#cbd5e1'}}>{result.explanation}</p>
              {result.mode_explanation && (
                <p style={{ color: '#94a3b8', fontSize: '0.9em', marginTop: '8px' }}>
                  ℹ️ {result.mode_explanation}
                </p>
              )}
            </div>

            {result.emotions && result.emotions.length > 0 && (
              <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>😊 Detected Emotions:</h4>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  {result.emotions.map((emotion, i) => {
                    let emotionText = '';
                    // Parse JSON-like strings into objects if needed
                    let e = emotion
                    if (typeof e === 'string') {
                      const t = e.trim()
                      if ((t.startsWith('{') || t.startsWith('['))) {
                        try {
                          const parsed = JSON.parse(t)
                          e = Array.isArray(parsed) ? (parsed[0] || parsed) : parsed
                        } catch (err) {
                          e = emotion
                        }
                      }
                    }

                    if (typeof e === 'string') {
                      emotionText = e;
                    } else if (e && typeof e === 'object') {
                      const label = e.label || e.emotion || e.name;
                      const prob = e.prob ?? e.probability ?? e.score;
                      if (label && (typeof prob === 'number')) {
                        emotionText = `${label} (${Math.round(prob * 100)}%)`;
                      } else if (label) {
                        emotionText = label;
                      } else {
                        emotionText = JSON.stringify(e);
                      }
                    } else {
                      emotionText = String(e);
                    }

                    return (
                      <span key={i} style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '0.9em',
                        color: '#c7d2fe',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        {emotionText}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>⚠️ Misinterpretation Risk Score:</h4>
              <div style={{
                background: result.risk_score < 34 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                           result.risk_score < 67 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
                           'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '600',
                fontSize: '1.1em'
              }}>
                {result.risk_score}/100 — {result.risk_score < 34 ? '🟢 Low Risk' : result.risk_score < 67 ? '🟡 Moderate Risk' : '🔴 High Risk'}
              </div>
              <p style={{color: '#94a3b8', fontSize: '0.9em', marginTop: '8px'}}>
                How likely this message could be misunderstood or cause confusion
              </p>
            </div>

            {result.highlights && result.highlights.length > 0 && (
              <div style={{marginBottom: '20px'}}>
                <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>✨ Key Highlights:</h4>
                <ul style={{color: '#cbd5e1'}}>
                  {result.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer" style={{marginTop: 60, textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.95em', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
        Powered by <strong style={{color: '#a5b4fc'}}>OCR.space</strong> for text extraction & <strong style={{color: '#a5b4fc'}}>Google Gemini AI</strong> for analysis
      </footer>
    </div>
  )
}
