import React, { useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config.js";
import { ModeContext } from "../context/ModeContext";

export default function TextPage() {
  const { mode, toggleMode } = useContext(ModeContext);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isSocial = mode === "social_media";
  const accentColor = isSocial ? "purple" : "indigo";

  const samples = [
    "Yeah, great  another meeting.",
    "I guess I\"ll just disappear, no one cares anyway.",
    "Awesome, because waking up early is my favorite thing.",
    "Wow, you actually finished on time. Miracles happen.",
    "I\"m fine, don\"t worry.",
  ];

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, { text }, {
        headers: { "X-Domain": mode }
      });
      setResult(res.data);
    } catch (e) {
      const details = e.response?.data?.detail || e.response?.data || e.message;
      setError(typeof details === "string" ? details : JSON.stringify(details));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen ${isSocial ? "bg-slate-950" : "bg-indigo-950"} text-slate-100 font-sans selection:bg-${accentColor}-500/30 overflow-x-hidden relative transition-colors duration-700`}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSocial ? "from-purple-900/10" : "from-indigo-900/10"} via-transparent to-transparent`}></div>
        <div className="data-point top-[10%] left-[20%] opacity-20"></div>
        <div className="data-point top-[80%] left-[70%] opacity-20"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <span className={`material-symbols-outlined ${isSocial ? "text-purple-400" : "text-indigo-400"} font-light text-3xl transition-colors group-hover:rotate-180 duration-700`}>flare</span>
          <span className="text-sm font-light tracking-[0.4em] uppercase text-slate-300">SarcasmDetect</span>
        </Link>
        <div className="flex gap-6 items-center">
          <button 
            onClick={toggleMode}
            className={`px-6 py-2 ${isSocial ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"} border rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-opacity-20 transition-all`}
          >
            {isSocial ? "Social Mode" : "Default Mode"}
          </button>
          <Link to="/catalog" className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-white/10 transition-all">
            Back to Select Console
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <span className={`${isSocial ? "text-purple-400/80" : "text-indigo-400/80"} text-[10px] font-medium tracking-[0.6em] uppercase block mb-4`}>
            {isSocial ? "Social Media Engine" : "Linguistic Console"}
          </span>
          <h2 className="text-4xl font-extralight tracking-tight text-white mb-4">
            Textual <span className="font-medium">Analysis</span>
          </h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Submit textual data for high-dimensional irony detection and semantic parsing.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Sample Grid */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">lightbulb</span> Patterns to Test
            </h3>
            <div className="flex flex-wrap gap-2">
              {samples.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setText(s)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white transition-all whitespace-nowrap"
                >
                  {s.length > 30 ? s.substring(0, 30) + "..." : s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Inject raw text for processing..."
              rows={6}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-600 font-light text-lg resize-none"
            />
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                Chars: {text.length}
              </span>
              <button
                onClick={analyze}
                disabled={loading || !text}
                className={`px-8 py-3 ${isSocial ? "bg-purple-500" : "bg-indigo-500"} hover:opacity-90 disabled:opacity-30 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all shadow-lg shadow-indigo-500/10`}
              >
                {loading ? "Processing..." : "Run Analysis"}
              </button>
            </div>
          </div>

          {/* Results section */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium">
              ERR_SIGNAL_INTERRUPTED: {error}
            </div>
          )}

          {result && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">Data Stream Recovered</h3>
                  </div>

                  <div className="mb-8">
                    <div className={`text-5xl font-medium ${isSocial ? "text-purple-400" : "text-indigo-400"} mb-2`}>
                      {result.sarcasm_intensity}%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-[0.3em] font-medium">
                      Sarcasm Probability Detected
                    </div>
                  </div>

                  <p className="text-slate-300 text-lg font-light leading-relaxed italic mb-8 border-l-2 border-white/10 pl-6">
                    "{result.explanation}"
                  </p>

                  {result.highlights && result.highlights.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Key Highlights</h4>
                      <div className="space-y-2">
                        {result.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className={`mt-1.5 w-1 h-1 rounded-full ${isSocial ? "bg-purple-500" : "bg-indigo-500"}`}></span>
                            <span className="text-sm text-slate-400 font-light">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Emotional Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.emotions?.map((e, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-400 uppercase tracking-wider">
                          {typeof e === "string" ? e : (e.label || e.emotion)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 text-center">
                    <div className={`text-2xl font-bold mb-1 ${result.risk_score > 60 ? "text-red-400" : "text-green-400"}`}>
                      {result.risk_score}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest">Risk Score</div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                       <div className={`h-full ${result.risk_score > 60 ? "bg-red-500" : "bg-green-500"}`} style={{width: `${result.risk_score}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em]">Integrated Gemini Nexus v3.0</p>
      </footer>
    </div>
  );
}
