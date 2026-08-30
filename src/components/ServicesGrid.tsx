import React from 'react';
import { ServiceDefinition } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { ArrowRight } from 'lucide-react';

interface ServicesGridProps {
  services: ServiceDefinition[];
  onSelectService: (service: ServiceDefinition) => void;
  onOpenGenericRequest: () => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  onSelectService,
  onOpenGenericRequest
}) => {
  return (
    <div className="space-y-4">
      {/* Services Grid (Compact & Clean) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            id={`service-card-${service.id}`}
            onClick={() => onSelectService(service)}
            className="group relative bg-white hover:bg-amber-50/40 p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Icon & Title */}
              <div className="flex items-center gap-2 sm:gap-2.5 mb-2">
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
