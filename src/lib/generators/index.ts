export const generatePropertyRef = (count: number): string => {
  return `MI-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateLeadRef = (count: number): string => {
  return `LD-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateBookingRef = (count: number): string => {
  return `INSP-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateReservationRef = (count: number): string => {
  return `RES-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateCampaignSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const generateCustomerRef = (count: number): string => {
  return `MIRE-CUS-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateEasyBuyRef = (count: number): string => {
  return `EB-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateTicketRef = (count: number): string => {
  return `TKT-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateAllocationRef = (count: number): string => {
  return `ALLOC-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};

export const generateAgentSerial = (count: number): string => {
  return `MI-AG-${count.toString().padStart(6, '0')}`;
};

export const generateReferralRef = (count: number): string => {
  return `REF-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;
};
