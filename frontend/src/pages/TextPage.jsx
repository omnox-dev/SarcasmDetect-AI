import React, {useState} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function TextPage(){
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const samples = [
    "Yeah, great — another meeting.",
    "I guess I'll just disappear, no one cares anyway.",
    "Awesome, because waking up early is my favorite thing.",
    "Wow, you actually finished on time. Miracles happen.",
    "I'm fine, don't worry.",
  ]

  async function analyze(){
    setLoading(true)
    setError(null)
    setResult(null)
    try{
      const res = await axios.post('/api/analyze/text', {text})
      console.log('analyze success', res)
      setResult(res.data)
    }catch(e){
      // stringify structured error details so React doesn't try to render objects
      const details = e.response?.data?.detail || e.response?.data || e.message
      const msg = typeof details === 'string' ? details : JSON.stringify(details)
      console.error('analyze error', e, details)
      setError(msg)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="page container">
      <header className="header">
        <h1>📝 Text Analysis</h1>
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
          Paste text or pick a sample to analyze sarcasm and emotions.
        </p>

        {/* Sample Selection */}
        <div style={{
          marginBottom: '24px',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <label htmlFor="sample-select" style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px', color: '#a5b4fc'}}>
            💡 Try a Sample
          </label>
          <select 
            id="sample-select" 
            onChange={e=>setText(e.target.value)} 
            value=""
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              fontSize: '15px',
              background: 'rgba(51, 65, 85, 0.5)',
              color: '#f1f5f9',
              cursor: 'pointer'
            }}
          >
            <option value="">-- pick a sample --</option>
            {samples.map((s,i)=>(<option key={i} value={s}>{s.substring(0,80)}</option>))}
          </select>
        </div>

        {/* Text Input */}
        <div style={{
          marginBottom: '24px',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <label htmlFor="text-input" style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px', color: '#a5b4fc'}}>
            📝 Your Text
          </label>
          <textarea 
            id="text-input" 
            value={text} 
            onChange={e=>setText(e.target.value)} 
            placeholder="Paste a post or comment here...&#10;&#10;Example: 'Yeah, great — another meeting.'"
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              background: 'rgba(51, 65, 85, 0.5)',
              color: '#f1f5f9'
            }}
          ></textarea>
          <small style={{color: '#94a3b8', fontSize: '0.9em', display: 'block', marginTop: '8px'}}>
            Character count: {text.length}
          </small>
        </div>

        <div className="actions">
          <button 
            className="btn" 
            onClick={analyze} 
            disabled={loading || !text}
            style={{
              fontSize: '18px',
              padding: '14px 32px',
              fontWeight: '600'
            }}
          >
            {loading ? '🔍 Analyzing...' : '🚀 Analyze Text'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <p>⏳ Analyzing text for sarcasm...</p>
            <p style={{fontSize: '0.9em', color: '#94a3b8'}}>This may take 2-3 seconds</p>
          </div>
        )}

        {error && <div className="error">❌ Error: {error}</div>}

        {result && (
          <div className="result">
            <h3>📊 Analysis Results</h3>
            
            <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>🎭 Sarcasm Analysis:</h4>
              <div className="badge" style={{
                background: result.sarcasm_label === 'sarcastic' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '12px',
                display: 'inline-block',
                fontWeight: '600'
              }}>
                {result.sarcasm_label.toUpperCase()} - {result.sarcasm_intensity}% intensity
              </div>
            </div>

            <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>💡 Explanation:</h4>
              <p style={{color: '#cbd5e1'}}>{result.explanation}</p>
            </div>

            {result.emotions && result.emotions.length > 0 && (
              <div style={{marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <h4 style={{marginBottom: '8px', color: '#f1f5f9'}}>😊 Detected Emotions:</h4>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    {result.emotions.map((e, i) => {
                      let emotionText = '';
                      let obj = e
                      if (typeof obj === 'string'){
                        const t = obj.trim()
                        if ((t.startsWith('{') || t.startsWith('['))) {
                          try{
                            const parsed = JSON.parse(t)
                            obj = Array.isArray(parsed) ? (parsed[0] || parsed) : parsed
                          }catch(err){
                            obj = e
                          }
                        }
                      }

                      if (typeof obj === 'string') {
                        emotionText = obj;
                      } else if (obj && typeof obj === 'object') {
                        const label = obj.label || obj.emotion || obj.name;
                        const prob = obj.prob ?? obj.probability ?? obj.score;
                        if (label && (typeof prob === 'number')) {
                          emotionText = `${label} (${Math.round(prob * 100)}%)`;
                        } else if (label) {
                          emotionText = label;
                        } else {
                          emotionText = JSON.stringify(obj);
                        }
                      } else {
                        emotionText = String(obj);
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
                      )
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
                  {result.highlights.map((h,i)=> <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer" style={{marginTop: 60, textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.95em', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
        Powered by <strong style={{color: '#a5b4fc'}}>Google Gemini AI</strong> for sarcasm analysis
      </footer>
    </div>
  )
}
