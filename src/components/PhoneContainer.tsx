import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneContainerProps {
  isPhoneFrame: boolean;
  children: React.ReactNode;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({ isPhoneFrame, children }) => {
  if (!isPhoneFrame) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="flex justify-center py-4 bg-slate-900/60 rounded-3xl backdrop-blur-md border border-slate-800">
      
      {/* Smartphone Frame Container */}
      <div className="relative w-full max-w-[420px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-900">
        
        {/* Top Notch / Dynamic Island Camera */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-50 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
        </div>

        {/* Inner Phone Screen */}
        <div className="relative bg-slate-100 rounded-[38px] overflow-hidden min-h-[720px] max-h-[820px] flex flex-col shadow-inner">
          
          {/* Simulated Phone Status Bar */}
          <div className="bg-[#001838] text-white px-6 pt-3 pb-1 flex justify-between items-center text-[11px] font-bold z-40 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Phone Screen Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-slate-800 scrollbar-thin">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="bg-white py-2 flex justify-center items-center z-40 border-t border-slate-100">
            <div className="w-32 h-1 bg-slate-400 rounded-full" />
          </div>

        </div>

      </div>

    </div>
  );
};
