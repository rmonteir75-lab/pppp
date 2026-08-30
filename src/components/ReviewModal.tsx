import React, { useState } from 'react';
import { ServiceRequest } from '../types';
import { Star, X, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onSubmitReview: (requestId: string, stars: number, comment: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitReview
}) => {
  if (!isOpen || !request) return null;

  const [stars, setStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [comment, setComment] = useState<string>(
    'Profissional muito atencioso e serviço de excelente qualidade.'
  );

  const getLabelForRating = (num: number) => {
    switch (num) {
      case 5: return 'Excelente!';
      case 4: return 'Muito Bom!';
      case 3: return 'Satisfeito';
      case 2: return 'Regular';
      case 1: return 'Precisa Melhorar';
      default: return 'Excelente!';
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback if confetti canvas fails
    }

    onSubmitReview(request.id, stars, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800">
        
        {/* Header */}
        <div className="bg-[#001838] text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                {request.serviceTitle}
              </span>
              <h3 className="text-lg font-black tracking-tight leading-tight text-white">
                Avaliação do Cliente
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body matching flyer */}
        <form onSubmit={handleSend} className="p-6 space-y-6 text-center">
          
          <div className="space-y-1">
            <h4 className="text-xl font-extrabold text-[#001838]">
              Como foi o serviço?
            </h4>
            <p className="text-xs text-slate-500">
              Sua avaliação ajuda a manter a excelência da equipe SM Express!
            </p>
          </div>

          {/* Interactive Stars */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => {
                const isFilled = num <= (hoverStars || stars);
                return (
                  <button
                    key={num}
                    type="button"
                    onMouseEnter={() => setHoverStars(num)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setStars(num)}
                    className="p-1 transform hover:scale-125 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-extrabold text-amber-600 animate-pulse">
              {getLabelForRating(hoverStars || stars)}
            </p>
          </div>

          {/* Comment textarea */}
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Comentário ou Feedback:
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Submit Button matching Flyer */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Sparkles className="w-5 h-5" />
            <span>ENVIAR AVALIAÇÃO</span>
          </button>

        </form>

      </div>
    </div>
  );
};
