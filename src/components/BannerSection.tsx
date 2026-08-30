import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { ServiceCategory, ServiceDefinition } from '../types';
import { SMExpressLogo } from './SMExpressLogo';

interface BannerSectionProps {
  onRequestClick: (initialText?: string, category?: ServiceCategory) => void;
  onSelectCategory?: (category: ServiceCategory) => void;
  services: ServiceDefinition[];
}

export const BannerSection: React.FC<BannerSectionProps> = ({ 
  onRequestClick, 
  onSelectCategory,
  services 
}) => {
  const [problemDescription, setProblemDescription] = useState('');

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (problemDescription.trim()) {
      onRequestClick(problemDescription.trim());
    } else {
      onRequestClick();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#001838] via-[#022452] to-[#001026] text-white p-4 xs:p-6 sm:p-8 md:p-10 shadow-2xl border border-amber-500/30">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-60 sm:w-80 h-60 sm:h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 sm:w-80 h-60 sm:h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
        
        {/* Official Brand Logo Emblem */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 max-w-[80vw] max-h-[80vw] transform hover:scale-105 transition-transform duration-300 drop-shadow-[0_15px_35px_rgba(0,0,0,0.55)] flex items-center justify-center">
            <SMExpressLogo variant="badge" size="responsive" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
        </div>

        {/* Central Direct Input Form */}
        <form onSubmit={handleSubmitSearch} className="relative max-w-2xl mx-auto pt-1 sm:pt-2 w-full">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/10 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-white/20 shadow-2xl focus-within:border-amber-400 focus-within:bg-white/15 transition-all">
            <div className="relative flex-1 flex items-center min-h-[44px]">
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-400 ml-3 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Ex: Trocar fiação, consertar vazamento, pintura..."
                className="w-full bg-transparent text-white placeholder-slate-300 text-xs sm:text-sm md:text-base py-2.5 sm:py-3 pr-3 focus:outline-none font-medium"
              />
            </div>
            
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-400/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider transform hover:scale-[1.02] touch-target"
            >
              <span>Pedir Orçamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Minimal trust proof */}
        <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Profissionais Verificados</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Orçamento Gratuito</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Atendimento via WhatsApp</span>
          </span>
        </div>

      </div>
    </div>
  );
};
