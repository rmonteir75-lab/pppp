import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface DigitalSignaturePadProps {
  signerName: string;
  signerCpf: string;
  onSignatureChange: (signatureDataUrl: string | null) => void;
  hasSignature: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  signerName,
  signerCpf,
  onSignatureChange,
  hasSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(signerName || '');
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (signerName && !typedName) {
      setTypedName(signerName);
    }
  }, [signerName]);

  // Canvas drawing setup
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#F59E0B'; // Amber color
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  // Generate image from typed name
  const handleGenerateTypedSignature = () => {
    if (!typedName.trim()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 120);

    ctx.font = 'italic bold 28px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#F59E0B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName.trim(), 200, 50);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Assinado digitalmente por ${signerName} • CPF ${signerCpf}`, 200, 95);

    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
    setHasDrawn(true);
  };

  return (
    <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Assinatura Digital do Prestador (Obrigatória)
          </span>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px]">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              mode === 'draw' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Desenhar com Dedo/Mouse
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              mode === 'type' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Assinatura Tipográfica
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="space-y-2">
          <div className="relative border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-2xl bg-slate-900/90 overflow-hidden cursor-crosshair group transition-all">
            <canvas
              ref={canvasRef}
              width={500}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 block touch-none"
            />

            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 group-hover:text-amber-400/80 transition-colors">
                <PenTool className="w-6 h-6 mb-1 opacity-70" />
                <span className="text-xs font-semibold">
                  Faça sua assinatura ou rubrica aqui
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  (Use o dedo na tela do celular ou o mouse no computador)
                </span>
              </div>
            )}

            {hasDrawn && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Assinatura Capturada
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400">
              Signatário: <strong className="text-white">{signerName || 'Prestador'}</strong> (CPF: {signerCpf || '---'})
            </span>

            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold transition-colors py-1 px-2 hover:bg-slate-900 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" /> Limpar e Refazer
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-[11px] font-bold text-slate-300">
              Nome Completo para Assinatura Eletrônica:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Seu nome completo"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleGenerateTypedSignature}
                className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aplicar Assinatura</span>
              </button>
            </div>

            {hasSignature && (
              <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-serif italic text-amber-300 font-bold">
                    {typedName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  ✓ Válida
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
