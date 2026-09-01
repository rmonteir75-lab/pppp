import React, { useState } from 'react';
import { ServiceDefinition } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { ArrowRight, Trash2, AlertCircle } from 'lucide-react';

interface ServicesGridProps {
  services: ServiceDefinition[];
  onSelectService: (service: ServiceDefinition) => void;
  onOpenGenericRequest: () => void;
  onDeleteService?: (serviceId: string) => void;
  isAdmin?: boolean;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  onSelectService,
  onOpenGenericRequest,
  onDeleteService,
  isAdmin = false
}) => {
  const [serviceToDelete, setServiceToDelete] = useState<ServiceDefinition | null>(null);

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (serviceToDelete && onDeleteService) {
      onDeleteService(serviceToDelete.id);
      setServiceToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Delete Confirmation Modal for Admin */}
      {serviceToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setServiceToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Excluir Serviço?</h4>
              <p className="text-xs text-slate-600 mt-1">
                Deseja remover <strong>{serviceToDelete.title}</strong> da lista de serviços disponíveis?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid (Compact & Clean) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            id={`service-card-${service.id}`}
            onClick={() => onSelectService(service)}
            className="group relative bg-white hover:bg-amber-50/40 p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            {/* Quick delete button for Admin */}
            {isAdmin && onDeleteService && (
              <button
                type="button"
                title="Excluir este serviço"
                onClick={(e) => {
                  e.stopPropagation();
                  setServiceToDelete(service);
                }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div>
              {/* Icon & Title */}
              <div className="flex items-center gap-2 sm:gap-2.5 mb-2 pr-4">
                <div className={`p-2 sm:p-2.5 rounded-xl text-white shadow-sm ${service.color} transform group-hover:scale-105 transition-transform flex-shrink-0`}>
                  <ServiceIcon name={service.iconName} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-extrabold text-[11px] sm:text-xs md:text-sm text-[#001838] group-hover:text-amber-600 transition-colors uppercase leading-tight line-clamp-2">
                  {service.title}
                </h3>
              </div>

              {/* Short snippet */}
              <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {service.shortDescription}
              </p>
            </div>

            {/* Direct Action link */}
            <div className="mt-2.5 sm:mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-amber-600 group-hover:text-amber-700 min-h-[24px]">
              <span>Solicitar</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Outro serviço footer link */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onOpenGenericRequest}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 underline transition-colors"
        >
          <span>Não encontrou o que procura? Clique aqui para descrever seu serviço personalizado</span>
        </button>
      </div>

    </div>
  );
};
