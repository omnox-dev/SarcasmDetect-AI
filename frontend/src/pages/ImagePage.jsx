import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config.js";
import { ModeContext } from "../context/ModeContext";

export default function ImagePage() {
  const { mode, toggleMode } = useContext(ModeContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSocial = mode === "social_media";
  const accentColor = isSocial ? "purple" : "indigo";

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  }

  async function submit() {
    if (!file) {
      setError("Please select an image file");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const processed = await preprocessImageFile(file);
      const fd = new FormData();
      fd.append("file", processed, file.name);
      fd.append("image_caption", caption || "");

      const res = await axios.post(`${API_BASE_URL}/api/analyze/image`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Domain": mode
        },
        timeout: 60000
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  function preprocessImageFile(file) {
    const MIN_DIM = 600;
    const MAX_DIM = 1600;
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          const largest = Math.max(width, height);
          let scale = 1;
          if (largest < MIN_DIM) scale = MIN_DIM / largest;
          else if (largest > MAX_DIM) scale = MAX_DIM / largest;
          const outW = Math.round(width * scale);
          const outH = Math.round(height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, outW, outH);
          ctx.drawImage(img, 0, 0, outW, outH);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Image processing failed"));
            resolve(blob);
          }, "image/jpeg", 0.92);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
      img.src = url;
    });
  }

  return (
    <div className={`min-h-screen ${isSocial ? "bg-slate-950" : "bg-indigo-950"} text-slate-100 font-sans selection:bg-${accentColor}-500/30 overflow-x-hidden relative transition-colors duration-700`}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSocial ? "from-purple-900/10" : "from-indigo-900/10"} via-transparent to-transparent`}></div>
        <div className="data-point top-[5%] left-[40%] opacity-20"></div>
        <div className="data-point top-[70%] left-[85%] opacity-20"></div>
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

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <div className="mb-12">
          <span className={`${isSocial ? "text-purple-400/80" : "text-indigo-400/80"} text-[10px] font-medium tracking-[0.6em] uppercase block mb-4`}>
            {isSocial ? "Contextual Vision Engine v3.0" : "Visual Intelligence v3.0"}
          </span>
          <h2 className="text-4xl font-extralight tracking-tight text-white mb-4">
            Image <span className="font-medium">Analysis</span>
          </h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Extracting semantic signals from visual media using high-performance OCR and tonal mapping.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Vision Core</h3>
              
              <div className="mb-8">
                <label className="group block cursor-pointer">
                  <div className={`w-full h-48 rounded-xl border-2 border-dashed ${isSocial ? "border-purple-500/30" : "border-indigo-500/30"} flex flex-col items-center justify-center gap-4 bg-white/5 group-hover:bg-white/10 transition-all`}>
                    <span className={`material-symbols-outlined text-4xl ${isSocial ? "text-purple-400/50" : "text-indigo-400/50"}`}>add_a_photo</span>
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-300 uppercase tracking-widest leading-loose">Initialize Scan</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">JPG, PNG, WEBP (Max 20MB)</div>
                    </div>
                  </div>
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              </div>

              <div className="mb-8">
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Optional Context</h3>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Inject additional metadata or caption..."
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-slate-300 placeholder-slate-700 font-light text-sm focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              <button
                onClick={submit}
                disabled={loading || !file}
                className={`w-full py-4 ${isSocial ? "bg-purple-500 shadow-purple-500/10" : "bg-indigo-500 shadow-indigo-500/10"} hover:opacity-90 disabled:opacity-30 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all shadow-lg`}
              >
                {loading ? "Engaging OCR Nexus..." : "Run Multi-Modal Analysis"}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/10 text-red-400/80 p-4 rounded-xl text-[10px] font-medium tracking-widest uppercase">
                ERR_VISION_INTERRUPT: {error}
              </div>
            )}
          </div>

          {/* Right Column: Preview/Results */}
          <div className="flex flex-col gap-6">
            {!result && preview && (
               <div className="bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-sm relative overflow-hidden group">
                   <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                  <img src={preview} alt="Input stream" className="w-full rounded-xl opacity-80" style={{ maxHeight: "600px", objectFit: "contain" }} />
                  <div className="absolute top-4 left-4 text-[9px] font-bold tracking-[0.4em] text-white/50 uppercase">Reticule Level: Active</div>
               </div>
            )}

            {!result && !preview && (
              <div className="bg-white/5 border border-white/5 rounded-2xl h-[400px] flex items-center justify-center text-slate-600 text-[10px] uppercase tracking-widest italic border-dashed">
                Awaiting visual signal...
              </div>
            )}

            {result && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">Semantic Grid Recovered</h3>
                </div>

                <div className="mb-10">
                  <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.5em] mb-4 text-center">OCR Output</h4>
                  <div className="bg-black/40 rounded-xl p-4 text-slate-400 text-xs font-light leading-relaxed border border-white/5">
                    {result.ocr_text || "No legible text detected in signal."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="text-center">
                    <div className={`text-5xl font-medium ${isSocial ? "text-purple-400" : "text-indigo-400"} mb-1`}>{result.sarcasm_intensity}%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Sarcasm Level</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-medium ${result.risk_score > 60 ? "text-red-400" : "text-green-400"} mb-1`}>{result.risk_score}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Risk Score</div>
                  </div>
                </div>

                <p className="text-slate-300 text-lg font-light leading-relaxed italic mb-8 border-l-2 border-white/10 pl-6">
                  "{result.explanation}"
                </p>

                {result.highlights && result.highlights.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 text-left">Visual Highlights</h4>
                    <div className="space-y-2 mt-4 text-left">
                      {result.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className={`mt-1.5 w-1 h-1 rounded-full ${isSocial ? "bg-purple-500" : "bg-indigo-500"}`}></span>
                          <span className="text-sm text-slate-400 font-light">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-left">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Emotional Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.emotions?.map((e, i) => (
                      <span key={i} className={`px-3 py-1 bg-${accentColor}-500/10 border border-${accentColor}-500/20 rounded-full text-[10px] text-slate-300 uppercase tracking-wider`}>
                        {typeof e === "string" ? e : (e.label || e.emotion)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-12 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em]">Integrated Gemini Nexus v3.0  Protocol Connected</p>
      </footer>

      
    </div>
  );
}
