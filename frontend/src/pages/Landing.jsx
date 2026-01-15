import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ModeContext } from "../context/ModeContext";

export default function Landing() {
  const { mode, toggleMode } = useContext(ModeContext);

  const isSocial = mode === 'social_media';

  return (
    <div className={`min-h-screen ${isSocial ? 'bg-slate-950' : 'bg-indigo-950'} text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-700`}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isSocial ? 'from-purple-900/20' : 'from-indigo-900/20'} via-transparent to-transparent transition-colors duration-700`}></div>
        <div className={`data-point top-[10%] left-[20%] ${isSocial ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[15%] left-[80%] ${isSocial ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[40%] left-[15%] ${isSocial ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[60%] left-[85%] ${isSocial ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[85%] left-[30%] ${isSocial ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[25%] left-[50%] ${isSocial ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[75%] left-[60%] ${isSocial ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[90%] left-[10%] ${isSocial ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[50%] left-[40%] ${isSocial ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
        <div className={`data-point top-[30%] left-[70%] ${isSocial ? 'bg-pink-400' : 'bg-indigo-400'}`}></div>
      </div>

      <nav className="fixed top-0 w-full z-50 px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${isSocial ? 'text-purple-400' : 'text-indigo-400'} font-light text-3xl transition-colors`}>flare</span>
          <span className="text-sm font-light tracking-[0.4em] uppercase text-slate-300">SarcasmDetect</span>
        </div>
        <div className="flex gap-6 items-center">
          <button 
            onClick={toggleMode}
            className={`px-6 py-2 ${isSocial ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'} border rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-opacity-20 transition-all`}
          >
            {isSocial ? 'Social Mode' : 'Default Mode'}
          </button>
          
          <Link 
            to="/catalog"
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium tracking-widest uppercase hover:bg-white/10 transition-all"
          >
            Launch Console
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-48 pb-32 min-h-screen flex flex-col items-center">
        <div className="text-center max-w-4xl px-6 mb-32">
          <span className={`${isSocial ? 'text-purple-400/80' : 'text-indigo-400/80'} text-xs font-medium tracking-[0.6em] uppercase block mb-6 transition-colors`}>
            {isSocial ? 'Social Media Intelligence v3.0' : 'Cognitive Intelligence v3.0'}
          </span>
          <h1 className="text-7xl md:text-8xl font-extralight tracking-tight text-white mb-10 text-glow leading-tight">
            The Science of <br /> <span className="font-medium">Subtext</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            {isSocial ? 'Analyzing the landscape of digital irony across social platforms.' : 'Navigating the complexities of human irony through high-dimensional sentiment mapping.'}
          </p>
        </div>
      </main>

      <footer className="relative z-10 pt-20 pb-12 mt-20">
        <div className="light-leak absolute bottom-0 left-0 w-full h-[500px]"></div>
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-white/5 pt-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-indigo-400/60 text-xl">flare</span>
                <span className="text-xs font-light tracking-[0.4em] uppercase text-slate-400">SarcasmDetect AI</span>
              </div>
              <p className="text-slate-500 font-light text-sm max-w-xs">
                Advanced cognitive layers for the modern communication landscape. Decoding intent, one dimension at a time.
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-6">Exploration</h4>
              <ul className="space-y-4">
                <li><a className="text-xs text-slate-500 hover:text-indigo-400 transition-colors" href="#">Neural Network</a></li>
                <li><a className="text-xs text-slate-500 hover:text-indigo-400 transition-colors" href="#">Case Studies</a></li>
                <li><a className="text-xs text-slate-500 hover:text-indigo-400 transition-colors" href="#">Research Paper</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-6">Connection</h4>
              <ul className="space-y-4">
                <li><a className="text-xs text-slate-500 hover:text-indigo-400 transition-colors" href="#">Terminal Access</a></li>
                <li><a className="text-xs text-slate-500 hover:text-indigo-400 transition-colors" href="#">Open Source</a></li>
                <li><a className="text-xs text-slate-500 hover:text-indigo-400 transition-colors" href="#">API Keys</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
            <p> 2024 SarcasmDetect Intelligence Systems. Protocol Established.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a className="hover:text-indigo-400 transition-colors" href="#">Privacy Shield</a>
              <a className="hover:text-indigo-400 transition-colors" href="#">Ethical Framework</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
