export type NavTab = 
  | 'uebersicht' 
  | 'unternehmen-und-partner' 
  | 'kunden-und-mitglieder' 
  | 'aktivitaeten-und-deals' 
  | 'analysen-und-berichte' 
  | 'einstellungen'
  | 'neues-unternehmen';

export type PartnerStatus = 'Premium Partner' | 'Aktiv' | 'In Prüfung' | 'Verifiziert' | 'Pausiert';

export interface Partner {
  id: string;
  spontiId: string;
  name: string;
  legalForm?: string;
  hrb?: string;
  category: string;
  subCategory: string;
  city: string;
  district: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dealsCount: number;
  bookingsCount: number;
  status: PartnerStatus;
  isTopPartner?: boolean;
  satisfaction?: number;
  conversionRate?: number;
  currentTopDeal?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  description?: string;
  website?: string;
  instagram?: string;
  tier?: 'Standard' | 'Premium Partner' | 'Pilot Beta';
  commissionRate?: number;
  payoutInterval?: 'Wöchentlich' | '14-tägig' | 'Monatlich';
  checkInSystem?: string;
}

export type DealStatus = 'Live' | 'In Prüfung' | 'Geplant' | 'Abgelaufen';

export interface Deal {
  id: string;
  partnerId: string;
  partnerName: string;
  locationName: string;
  logoUrl?: string;
  imageUrl?: string;
  title: string;
  description: string;
  status: DealStatus;
  timeRemaining?: string;
  bookedCount: number;
  totalCapacity: number;
  bookingRate?: string;
  rating: number;
  reviewCount: number;
  priceCheckOk?: boolean;
  partnerLevel?: string;
  reservationsCount?: number;
}

export interface Workshop {
  id: string;
  dateStr: string;
  price: string;
  title: string;
  provider: string;
  location: string;
  bookedCount: number;
  totalSpots: number;
  statusLabel?: string;
  isUrgent?: boolean;
}

export type MemberTier = 'Sponti Club Gold' | 'Sponti Free' | 'Student';
export type MemberStatus = 'Aktiv' | 'E-Mail unbestätigt' | 'Pausiert' | 'Gesperrt';

export interface CustomerMember {
  id: string;
  spontiId: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  tier: MemberTier;
  joinedDate: string;
  redemptionsCount: number;
  lastActivity: string;
  lastDealName: string;
  status: MemberStatus;
  avatarColor?: string;
}

export interface ActivityLogItem {
  id: string;
  userInitials: string;
  userName: string;
  timeAgo: string;
  description: string;
  dealHighlight?: string;
  partnerHighlight?: string;
  type: 'redemption' | 'registration' | 'event' | 'system';
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
