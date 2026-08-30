import React from 'react';
import { 
  Waves, 
  Wrench, 
  Trees, 
  Sparkles, 
  Truck, 
  Droplet, 
  Hammer, 
  Armchair,
  PlusCircle, 
  HelpCircle,
  Building2,
  Flame,
  KeyRound,
  PhoneCall,
  Zap,
  Camera,
  Layers
} from 'lucide-react';

interface ServiceIconProps {
  name: string;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case 'Waves':
      return <Waves className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Trees':
      return <Trees className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Droplet':
      return <Droplet className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Armchair':
      return <Armchair className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'KeyRound':
      return <KeyRound className={className} />;
    case 'PhoneCall':
      return <PhoneCall className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'PlusCircle':
      return <PlusCircle className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
