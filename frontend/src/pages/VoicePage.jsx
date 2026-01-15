import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config.js";
import { ModeContext } from "../context/ModeContext";

export default function VoicePage() {
  const { mode, toggleMode } = useContext(ModeContext);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const isSocial = mode === "social_media";
  const accentColor = isSocial ? "purple" : "indigo";

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  function startRecording() {
    if (!isSupported) {
      setError("Audio recording not supported in this browser.");
      return;
    }
    setError(null);
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
          setAudioFile(file);
          setAudioFileName("Recorded stream active");
        };
        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch(() => setError("Microphone access denied or unavailable"));
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  function handleAudioFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      setError(null);
    }
  }

  async function submit() {
    if (!audioFile && !transcript.trim()) {
      setError("Initialize audio signal or textual transcript");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const fd = new FormData();
    if (audioFile) fd.append("audio_file", audioFile);
    fd.append("transcript", transcript);
    fd.append("acoustic_notes", "");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze/voice`, fd, {
        headers: { "Content-Type": "multipart/form-data", "X-Domain": mode },
        timeout: 60000
      });
      if (audioFile && res.data.transcript) setTranscript(res.data.transcript);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen ${isSocial ? "bg-slate-950" : "bg-indigo-950"} text-slate-100 font-sans selection:bg-${accentColor}-500/30 overflow-x-hidden relative transition-colors duration-700`}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSocial ? "from-purple-900/10" : "from-indigo-900/10"} via-transparent to-transparent`}></div>
        <div className="data-point top-[15%] left-[80%] opacity-20"></div>
        <div className="data-point top-[75%] left-[10%] opacity-20"></div>
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
            {isSocial ? "Frequency Modulation v3.0" : "Acoustic Intelligence v3.0"}
          </span>
          <h2 className="text-4xl font-extralight tracking-tight text-white mb-4">
            Voice <span className="font-medium">Analysis</span>
          </h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Deconstruct tonal micro-fluctuations and semantic irony from audio streams.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Input Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Recording Section */}
              <div className="border-r border-white/5 pr-8">
                <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-4">Oscilloscope Control</h3>
                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={!isSupported}
                      className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all group"
                    >
                      <span className="material-symbols-outlined text-red-500">mic</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20"
                    >
                      <span className="material-symbols-outlined text-white">stop</span>
                    </button>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Signal Status</span>
                    <span className={`text-xs font-medium ${isRecording ? "text-red-400" : "text-slate-300"}`}>
                      {isRecording ? "Transmitting..." : "Ready to sample"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div>
                <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-4">Direct Injection</h3>
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full border border-white/10 border-dashed flex items-center justify-center group-hover:border-indigo-400/50 transition-all">
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-indigo-400">upload_file</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">File Stream</span>
                    <span className="text-xs font-medium text-slate-300 truncate max-w-[150px]">
                      {audioFileName || "Initialize upload"}
                    </span>
                  </div>
                  <input type="file" onChange={handleAudioFileChange} className="hidden" accept="audio/*,video/mp4" />
                </label>
              </div>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Captured transcript will appear here, or inject raw text..."
              rows={4}
              className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-slate-300 placeholder-slate-700 font-light text-sm resize-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={submit}
                disabled={loading || (!audioFile && !transcript)}
                className={`px-8 py-3 ${isSocial ? "bg-purple-500" : "bg-indigo-500"} hover:opacity-90 disabled:opacity-30 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all`}
              >
                {loading ? "Decrypting..." : "Analyze Signal"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/10 text-red-400/80 p-4 rounded-xl text-[10px] font-medium tracking-widest uppercase">
              ERR_ACK_FAILED: {error}
            </div>
          )}

          {result && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
               <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">Acoustic Signature Resolved</h3>
                  </div>

                  <div className="mb-8">
                    <div className={`text-5xl font-medium ${isSocial ? "text-purple-400" : "text-indigo-400"} mb-2`}>
                      {result.sarcasm_intensity}%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-[0.3em] font-medium">
                      Tonal Irony Intensity
                    </div>
                  </div>

                  <p className="text-slate-300 text-lg font-light leading-relaxed italic mb-8 border-l-2 border-white/10 pl-6">
                    "{result.explanation}"
                  </p>

                  {result.highlights && result.highlights.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Acoustic Highlights</h4>
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

                <div className="w-full md:w-48 bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center">
                    <div className={`text-2xl font-bold mb-1 ${result.risk_score > 60 ? "text-red-400" : "text-green-400"}`}>
                      {result.risk_score}/100
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest text-center">Misinterpretation Score</div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                       <div className={`h-full ${result.risk_score > 60 ? "bg-red-500" : "bg-green-500"}`} style={{width: `${result.risk_score}%`}}></div>
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
