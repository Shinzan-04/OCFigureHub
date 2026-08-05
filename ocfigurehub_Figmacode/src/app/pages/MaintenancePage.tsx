import React from 'react';
import { Settings, Server, Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-500 blur-[80px] opacity-20 rounded-full"></div>
        <div className="relative w-32 h-32 rounded-full border border-[#262626] bg-[#111111] flex items-center justify-center">
          <Settings size={48} className="text-purple-500 animate-[spin_4s_linear_infinite]" />
        </div>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
        Website Under Maintenance
      </h1>
      
      <p className="text-[#888] max-w-lg mx-auto text-lg mb-8 leading-relaxed">
        We are currently performing scheduled maintenance to improve your experience. 
        Please check back shortly!
      </p>

      <div className="flex items-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
          <Wrench size={16} /> Improvements incoming
        </div>
        <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
          <Server size={16} /> Backend updates
        </div>
      </div>
    </div>
  );
}
