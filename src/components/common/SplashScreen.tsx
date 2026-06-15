"use client";

import React from 'react';
import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-between py-16 z-[9999] overflow-hidden select-none">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Logo Container with Spring Entry and Scale pulse */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 1.1, 1], opacity: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut",
            times: [0, 0.7, 1]
          }}
          className="w-36 h-32 flex items-center justify-center mb-6"
        >
          <img 
            src="/icon-512.png" 
            alt="RotinaPed Logo" 
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </motion.div>

        {/* Text Brand with delayed fade-in */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-3xl font-black text-slate-800 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Rotina<span className="text-[#1b6392]">Ped</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
            Cuidado Inteligente Pediátrico
          </p>
        </motion.div>
      </div>

      {/* Footer loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5 justify-center items-center">
          <span className="w-2.5 h-2.5 bg-[#1b6392] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 bg-[#74b9ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 bg-[#1b6392] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Iniciando Proteção Segura
        </span>
      </motion.div>
    </div>
  );
}