import { PaymentMethodType } from "@prisma/client";

// Adicione estas interfaces auxiliares
export interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: number;
  validityDays: number;
  // ... outros campos conforme necessário
}

export interface SaleCashback {
  id: number;
  cashback: Cashback;
  status: string;
  amount: number;
  expiryDate: string;
}

export interface TourOperator {
  id: number;
  name: string;
  phone: string;
  contact: string;
  email: string;
  site: string;
  login: string;
  password: string;
  upfrontCommission: number | null;
  installmentCommission: number | null;
  observation: string;
}

export interface Client {
  id: number;
  name: string;
  login: string;
  cpf: string;
  dateOfBirth: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  state: string;
  city: string;
}

export interface Sale {
  id: number;
  idInTourOperator: string;
  sallerId: number;
  tourOperatorId: number;
  clientId: number;
  saleDate: string;
  checkIn: string;
  checkOut: string;
  tourOperator: TourOperator;
  client: Client;
  companions?: {
    id: number;
    companionId: number;
  }[];
  saleTicket: {
    id: number;
    ticketId: number;
    date: string;
    adults: number;
    kids: number;
    halfPriceTicket: number;
    price: number;
  }[];
  saleHosting: {
    id: number;
    hostingId: number;
    rooms: number;
    price: number;
  }[];
  grossTotal: number;
  totalCashback: number;
  totalDiscount: number;
  netTotal: number;
  saleCashback?: SaleCashback | null; // Adicione esta linha
  cashbackId?: number; // Este campo pode ser mantido para compatibilidade
  paymentMethod?: PaymentMethodType;
  ticketDiscount: string;
  hostingDiscount: string;
  observation?: string;
  canceledSale?: boolean;
  invoice?: {
    issuedInvoice?: string;
    estimatedIssueDate?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    expectedReceiptDate?: string;
    invoiceReceived?: string;
    receiptDate?: string;
  };
}
