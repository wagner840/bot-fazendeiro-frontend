import {
  Beef,
  Bird,
  Building2,
  Factory,
  Flame,
  Grape,
  Hammer,
  Newspaper,
  Paintbrush,
  Pickaxe,
  Scissors,
  Shield,
  Stethoscope,
  Store,
  Trees,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from 'lucide-react';

const ICONS_BY_CODE: Record<string, LucideIcon> = {
  fazenda: Wheat,
  restaurante: UtensilsCrossed,
  bar: Grape,
  padaria: Wheat,
  acougue: Beef,
  grafica: Paintbrush,
  estabulo: Trees,
  artesanato: Scissors,
  jornal: Newspaper,
  atelie: Paintbrush,
  cavalaria: Shield,
  tabacaria: Flame,
  tatuagem: Paintbrush,
  ferraria: Hammer,
  madeireira: Trees,
  mineradora: Pickaxe,
  clinica: Stethoscope,
  mercearia: Store,
  bercario: Building2,
  agroindustria: Factory,
  cartorio: Building2,
  armaria: Shield,
  municoes: Shield,
  passaros: Bird,
  nativo: Trees,
};

export function getBusinessIcon(codigo?: string | null): LucideIcon {
  if (!codigo) return Building2;
  return ICONS_BY_CODE[codigo] ?? Building2;
}

export function getBaseScenarioLabel(baseRedmId?: number | null): string {
  return baseRedmId === 2 ? 'Valiria RP' : 'Downtown RP';
}
