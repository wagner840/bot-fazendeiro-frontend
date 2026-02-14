export interface Plano {
  id: number;
  nome: string;
  preco: number;
  duracao_dias: number;
}

export interface PixData {
  qrcode: string;
  copiaCola: string;
  expiracao: Date;
  paymentId: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'expired';

export interface UseCheckoutReturn {
  // Data
  planos: Plano[];
  selectedPlano: Plano | null;
  setSelectedPlano: (plano: Plano | null) => void;
  pixData: PixData | null;
  setPixData: (data: PixData | null) => void;

  // Loading states
  loading: boolean;
  generatingPix: boolean;

  // Form
  cpf: string;
  setCpf: (cpf: string) => void;
  email: string;
  setEmail: (email: string) => void;

  // Timer
  timeLeft: number;
  formatTime: (seconds: number) => string;

  // Payment status
  paymentStatus: PaymentStatus;
  setPaymentStatus: (status: PaymentStatus) => void;

  // Copy
  copied: boolean;
  copyToClipboard: () => void;

  // Actions
  generatePix: () => Promise<void>;
}
