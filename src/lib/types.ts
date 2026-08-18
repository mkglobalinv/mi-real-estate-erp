import { Role } from './roles';

export interface BaseRolePrep {
  // Role Preparation Fields
  assignedTo?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  
  // Chairman
  approvedByChairman?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  approvalDate?: string;
  approvalNotes?: string;
  
  // Director
  submittedByDirector?: string;
  directorReviewStatus?: 'Pending' | 'Reviewed';
  directorReviewDate?: string;
  directorNotes?: string;
  directorRecommendation?: string;
  
  // Secretary
  verifiedBySecretary?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Failed';
  verificationDate?: string;
  verificationNotes?: string;
  receiptStatus?: 'Not Issued' | 'Issued';
  
  // Customer Care
  customerCareStatus?: 'OK' | 'Needs Attention';
  complaintStatus?: 'None' | 'Active' | 'Resolved';
  
  // Admin Engineer
  leadSource?: string;
  campaignSource?: string;
  assignedEngineer?: string;
}

export interface Task extends BaseRolePrep {
  id: string;
  title: string;
  category: 'Lead Follow-Up' | 'Inspection' | 'Reservation' | 'Allocation' | 'Payment Reminder' | 'Customer Complaint';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  relatedRecordId?: string;
  notes?: string;
  createdAt: string;
}

export interface Lead extends BaseRolePrep {
  id: string;
  ref: string;
  name: string;
  phone: string;
  whatsapp: string;
  source: string;
  campaign?: string;
  interest: string;
  budget: string;
  location: string;
  score: number;
  temperature: 'Cold' | 'Warm' | 'Hot';
  status: 'New' | 'Contacted' | 'Follow Up' | 'Qualified' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  lifecycleStage?: 'Lead' | 'Prospect' | 'Application Submitted' | 'Approved' | 'Allocated' | 'Active Customer' | 'Completed';
  documents?: string[];
  assignmentDate?: string;
  notes?: string;
  followUpDate?: string;
  customerId?: string;
  createdAt: string;
}

export interface Announcement extends BaseRolePrep {
  id: string;
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  activeStatus: boolean;
  priority: 'High' | 'Normal' | 'Low';
  createdAt: string;
}

// Customer portal dashboard promo slider. Purely promotional/click-through —
// unrelated to campaigns (lead capture) or announcements (text ticker).
export interface Banner {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  clickUrl?: string;
  isActive: boolean;
  orderIndex: number;
  startAt?: string;
  endAt?: string;
  createdAt: string;
}

export interface Project extends BaseRolePrep {
  id: string;
  name: string;
  description: string;
  location?: string;
  locationId?: string;
  coverImage?: string;
  availableUnits: number;
  startingPrice: number;
  easyBuyStatus: boolean;
  active: boolean;
  archived?: boolean;
  createdAt: string;
}

export interface InspectionBooking extends BaseRolePrep {
  id: string;
  ref: string;
  customerName: string;
  phone: string;
  propertyId: string;
  propertyRef: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface Reservation extends BaseRolePrep {
  id: string;
  ref: string;
  customerId?: string;
  customerName: string;
  propertyId: string;
  propertyRef: string;
  
  // Project Allocation Prep
  projectId?: string;
  plotNumber?: string;
  allocationStatus?: 'Not Allocated' | 'Pending Allocation' | 'Allocated';
  
  reservationAmount: number;
  paymentGateway?: string;
  paymentReference?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  date: string;
  expirationDate?: string;
  status: 'Pending' | 'Paid' | 'Expired' | 'Converted';
  createdAt: string;
}

export interface SearchAnalytics {
  id: string;
  type: 'search' | 'view' | 'click';
  target: string;
  timestamp: string;
}

export interface WebsiteEnquiry extends BaseRolePrep {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  businessType: string;
  description: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt: string;
}

export interface PropertyListing extends BaseRolePrep {
  id: string;
  ref: string;
  title: string;
  type: string;
  purpose: 'Sale' | 'Rent';
  projectId?: string;
  project?: string;
  state: string;
  lga: string;
  area: string;
  address: string;
  initialDeposit?: number;
  monthlyPayment?: number;
  bedrooms?: number;
  bathrooms?: number;
  landSize?: string;
  features: string[];
  verificationStatus: 'Verified' | 'Pending';
  galleryImages: string[];
  location: string;
  price: number;
  description: string;
  images: string[];
  facebookVideoUrl?: string;
  googleMapsUrl?: string;
  featured: boolean;
  easyBuyEligible: boolean;
  hotDeal?: boolean;
  newListing?: boolean;
  status: 'Available' | 'Reserved' | 'Under Review' | 'Sold' | 'Draft' | 'Published' | 'Rented';
  createdAt: string;
}

export interface PropertyRequest {
  id: string;
  name: string;
  phone: string;
  type: string;
  location: string;
  budget: string;
  notes: string;
  intent?: 'Buy Land' | 'Buy House' | 'Rent Property' | 'Easy Buy';
  urgency?: 'Immediately' | '30 Days' | '3 Months' | 'Just Researching';
  status: 'New' | 'Contacted' | 'Closed';
  createdAt: string;
}

export interface PropertySubmission {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: string;
  purpose: 'Sale' | 'Rent' | 'Joint Venture' | 'Estate Partnership';
  location: string;
  price: string;
  budget?: string;
  description: string;
  assignedTo?: string;
  marketing: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface CampaignGreetingConfig {
  [language: string]: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  projectId?: string;
  propertyRef?: string; // keeping for backward compatibility if needed, though projectId is the DB ref
  description?: string;
  featuredImage?: string;
  fbAdReference?: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Archived' | 'Ended';
  startDate?: string;
  endDate?: string;
  whatsappNumber?: string;

  // Language configuration
  supportedLanguages?: string[];
  defaultLanguage?: string;

  // Formal greeting configuration
  greetingEnabled?: boolean;
  greetingConfig?: CampaignGreetingConfig;

  // Optional pre-application form configuration
  preApplicationEnabled?: boolean;
  applicationFormTemplateId?: string;
  preApplicationPrompt?: string;

  // WhatsApp handoff configuration
  whatsappMessageTemplate?: string;

  // Qualification and scoring
  hotThreshold?: number;
  warmThreshold?: number;

  // Terms and details
  termsAndConditions?: string;
  termsAndConditionsHausa?: string;
  cancellationRules?: string;
  cancellationRulesHausa?: string;

  // Analytics
  clicks?: number;
  leadsGenerated?: number;

  createdAt: string;
}

export interface CampaignQuestion {
  id: string;
  campaignId: string;
  type: 'Radio' | 'Dropdown' | 'Text' | 'Phone' | 'Number' | 'Text Area';
  questionText: string;
  options?: string[]; // for radio/dropdown
  orderIndex: number;
  isRequired: boolean;

  // Stable machine key for well-known qualification questions
  // (e.g. 'name', 'location', 'plot_size', 'purpose',
  // 'payment_preference', 'timeline', 'readiness'). Optional.
  questionKey?: string;

  // Conditional branching: this question is only shown if the answer to
  // parentQuestionId equals showIfOption. Set to null (not undefined) to
  // explicitly clear an existing condition when saving an edit.
  parentQuestionId?: string | null;
  showIfOption?: string | null;

  // Multilingual and Scoring extensions
  questionTextHausa?: string;
  optionsHausa?: string[];
  optionsScores?: number[];

  createdAt: string;
}

export interface ApplicationFormTemplate {
  id: string;
  name: string;
  description?: string;
  // The actual official form document/link (hosted PDF or external form
  // URL) — the real integration point, mirroring documents.file_url.
  fileUrl?: string;
  fields: Array<{ key: string; label: string; type: string; required?: boolean }>;
  status: 'Active' | 'Inactive';
  createdBy?: string;
  createdAt: string;
}

export interface CampaignAiDraft {
  id: string;
  campaignId?: string;
  promptText: string;
  generatedConfig: Record<string, unknown>;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  createdBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CampaignFaq {
  id: string;
  campaignId: string;
  question: string;
  answer: string;
  orderIndex: number;
  createdAt: string;
}

export interface CampaignPackage {
  id: string;
  campaignId: string;
  name: string;
  nameHausa?: string;
  outrightPrice: number;
  initialDeposit: number;
  monthlyInstallment: number;
  durationMonths: number;
  description?: string;
  descriptionHausa?: string;
  createdAt: string;
}

export interface CampaignMedia {
  id: string;
  campaignId: string;
  fileUrl: string;
  type: string;
  title?: string;
  createdAt: string;
}

export interface OfficeInfo {
  address: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email1: string;
  email2: string;
  mapsLink: string;
  businessHours: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  module: string;
  action: string;
  date: string;
  time: string;
}

export interface Location {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface Testimonial {
  id: string;
  customerName: string;
  customerPhoto: string;
  review: string;
  rating: number;
  isActive: boolean;
}

// --- PHASE 3 ERP INTERFACES ---

export interface Application extends BaseRolePrep {
  id: string;
  ref: string;
  customerId: string;
  propertyId?: string;
  status: 'Pending Review' | 'Director Reviewed' | 'Chairman Approved' | 'Rejected' | 'Returned to Secretary';
  documentsVerified: boolean;
  submittedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

// Agent Portal — a referral partner, distinct from staff and Customer
// roles. Never able to approve customers, change payment/property status,
// or see another Agent's referrals/commissions (enforced by RLS, not just
// the UI — see schema.sql section 34).
export interface Agent {
  id: string;
  profileId?: string;
  agentSerial: string; // e.g. MI-AG-000125
  fullName: string;
  phone: string;
  email?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface Customer extends BaseRolePrep {
  id: string;
  ref: string; // e.g. MIRE-CUS-2026-0001
  fullName: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  nextOfKinName: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone: string;
  nextOfKinAddress?: string;
  registrationDate: string;
  status: 'Pending Review' | 'Active' | 'Inactive';
  createdAt?: string;
}

export interface EasyBuyAccount extends BaseRolePrep {
  id: string;
  ref: string; // e.g. EB-2026-001
  customerId: string;
  projectId: string;
  propertyId: string;
  plotNumber?: string;
  totalPropertyPrice: number;
  initialDeposit: number;
  monthlyInstallment: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  outstandingBalance: number;
  amountPaid?: number;
  status: 'Active' | 'Completed' | 'Suspended' | 'Defaulting' | 'Cancelled';
  createdAt: string;
}

export interface Installment extends BaseRolePrep {
  id: string;
  accountId: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  paymentDate?: string;
  status: 'Upcoming' | 'Paid' | 'Late Paid' | 'Pending' | 'Overdue';
}

export interface PaymentProof extends BaseRolePrep {
  id: string;
  customerId: string;
  accountId?: string;
  amount: number;
  paymentDate: string;
  referenceNumber: string;
  proofImageUrl: string;
  notes?: string;
  // e.g. 'Initial Deposit' or 'Month <installmentNumber>' - identifies which
  // installment this payment is for. Not a strict enum since installment
  // periods vary in length; payment_proofs.applied_to has no DB constraint.
  appliedTo: string;
  status: 'Pending Verification' | 'Verified' | 'Rejected';
  createdAt: string;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'Credit' | 'Debit';
  description: string;
  customerId: string;
  referenceId: string; // payment proof id or invoice id
  verifiedBy?: string;
  createdAt: string;
}

export interface Allocation extends BaseRolePrep {
  id: string;
  ref?: string;
  customerId: string;
  projectId: string;
  blockNumber: string;
  plotNumber: string;
  allocationDate?: string;
  status: 'Not Allocated' | 'Pending Allocation' | 'Approved' | 'Allocated' | 'Revoked';
  createdAt: string;
}

export interface Document {
  id: string;
  customerId: string;
  customerRef?: string;
  title: string;
  type: 'Registration Form' | 'Customer Profile' | 'Receipt' | 'Statement' | 'Allocation Letter' | 'Site Plan' | 'Sale Agreement' | 'Offer Letter';
  fileUrl: string;
  createdBy?: string;
  generatedDate: string;
}

export interface CustomerCareTicket extends BaseRolePrep {
  id: string;
  ref: string;
  customerId: string;
  type: 'Complaint' | 'Inquiry' | 'Request' | 'Follow-Up';
  subject: string;
  description: string;
  priority?: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Closed';
  createdAt: string;
}

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  assignedTo?: string;
  leadId?: string; // FK to the CRM leads row created from this submission
  createdAt: string;
}

export interface CampaignAnswer {
  id: string;
  leadId: string;
  questionId: string;
  answerText: string;
  createdAt: string;
}

export interface CampaignScore {
  id: string;
  leadId: string;
  score: number;
  category: 'Hot' | 'Warm' | 'Cold';
  createdAt: string;
}

export interface CampaignAnalyticsEvent {
  id: string;
  campaignId: string;
  eventType: 'page_view' | 'wizard_start' | 'wizard_complete' | 'whatsapp_click';
  createdAt: string;
}

export interface Receipt extends BaseRolePrep {
  id: string;
  receiptNumber: string;
  customerId: string;
  amount: number;
  paymentProofId?: string;
  issuedBy?: string;
  status: 'Issued' | 'Cancelled';
  createdAt: string;
}

