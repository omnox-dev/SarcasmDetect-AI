import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ModeContext } from "../context/ModeContext";

export default function Catalog() {
  const { mode, toggleMode } = useContext(ModeContext);
  const isSocial = mode === "social_media";

  return (
    <div className={`min-h-screen ${isSocial ? "bg-slate-950" : "bg-indigo-950"} text-slate-100 font-display selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-700`}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSocial ? "from-purple-900/20" : "from-indigo-900/20"} via-transparent to-transparent`}></div>
        <div className="data-point top-[10%] left-[20%] opacity-20"></div>
        <div className="data-point top-[80%] left-[70%] opacity-20"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <span className={`material-symbols-outlined ${isSocial ? "text-purple-400" : "text-indigo-400"} font-light text-3xl group-hover:rotate-180 transition-transform duration-700`}>flare</span>
          <span className="text-sm font-light tracking-[0.4em] uppercase text-slate-300">SarcasmDetect</span>
        </Link>
        <div className="flex gap-6 items-center">
          <button 
            onClick={toggleMode}
            className={`px-6 py-2 ${isSocial ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"} border rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-opacity-20 transition-all`}
          >
            {isSocial ? "Social Mode" : "Default Mode"}
          </button>
          <Link to="/" className="text-[11px] font-medium tracking-widest uppercase text-slate-400 hover:text-white transition-colors">
            Exit Terminal
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-48 pb-32 flex flex-col items-center">
        <div className="text-center max-w-4xl px-6 mb-20">
          <span className={`${isSocial ? "text-purple-400/80" : "text-indigo-400/80"} text-xs font-medium tracking-[0.6em] uppercase block mb-6`}>
            {isSocial ? "Social Metadata Selection" : "Intelligence Selection Hub"}
          </span>
          <h2 className="text-6xl font-extralight tracking-tight text-white mb-6">
            Module <span className="font-medium">Directory</span>
          </h2>
          <p className="text-slate-400 text-lg font-light max-w-xl mx-auto leading-relaxed">
            Initialize a specific cognitive analysis protocol from the directory below.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center justify-center w-full px-6 max-w-7xl">
          <Link to="/text" className="frosted-circle w-72 h-72 md:w-80 md:h-80 group">
            <span className={`material-symbols-outlined circle-icon ${isSocial ? "text-purple-400" : "text-indigo-400"} group-hover:opacity-0 group-hover:scale-50 transition-all`}>notes</span>
            <div className="circle-content group-hover:opacity-100">
              <h3 className="text-white font-medium text-lg mb-2 uppercase tracking-widest">Textual Patterns</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Deep linguistic parsing to identify syntactic inconsistencies and ironic semantic shifts.
              </p>
            </div>
          </Link>

          <Link to="/voice" className="frosted-circle w-80 h-80 md:w-96 md:h-96 group">
            <span className={`material-symbols-outlined circle-icon ${isSocial ? "text-purple-400" : "text-indigo-400"} group-hover:opacity-0 group-hover:scale-50 transition-all`}>settings_voice</span>
            <div className="circle-content group-hover:opacity-100">
              <h3 className="text-white font-medium text-xl mb-3 uppercase tracking-widest">Acoustic Nuance</h3>
              <p className="text-slate-400 text-base font-light leading-relaxed">
                Real-time tonal analysis detecting subtle micro-fluctuations in vocal pitch and cadence.
              </p>
            </div>
          </Link>

          <Link to="/image" className="frosted-circle w-72 h-72 md:w-80 md:h-80 group">
            <span className={`material-symbols-outlined circle-icon ${isSocial ? "text-purple-400" : "text-indigo-400"} group-hover:opacity-0 group-hover:scale-50 transition-all`}>filter_vintage</span>
            <div className="circle-content group-hover:opacity-100">
              <h3 className="text-white font-medium text-lg mb-2 uppercase tracking-widest">Visual Satire</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Computer vision decoding context-clues and symbolic contradictions in visual media.
              </p>
            </div>
          </Link>
        </div>
      </main>

      <footer className="py-12 text-center text-[10px] text-slate-600 uppercase tracking-[0.4em] mt-auto">
        Protocol Hub v3.0  Cognitive Gateway Active
      </footer>
    </div>
  );
}
