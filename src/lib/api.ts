import { createClient } from '@/utils/supabase/client';
import { mapDbToProperty, mapPropertyToDb, mapDbToProject, mapProjectToDb, mapDbToLead, mapLeadToDb, mapDbToCustomer, mapCustomerToDb, mapDbToCampaign, mapCampaignToDb, mapDbToCampaignQuestion, mapCampaignQuestionToDb, mapDbToCampaignFaq, mapCampaignFaqToDb, mapDbToCampaignMedia, mapCampaignMediaToDb, mapDbToEasyBuyAccount, mapEasyBuyAccountToDb, mapDbToInstallment, mapInstallmentToDb, mapDbToPaymentProof, mapPaymentProofToDb, mapDbToLedgerTransaction, mapLedgerTransactionToDb, mapDbToReceipt, mapReceiptToDb, mapDbToAllocation, mapAllocationToDb, mapDbToInspection, mapInspectionToDb, mapDbToReservation, mapReservationToDb, mapDbToCustomerCareTicket, mapCustomerCareTicketToDb, mapDbToActivityLog, mapActivityLogToDb, mapDbToNotification, mapDbToWebsiteEnquiry, mapWebsiteEnquiryToDb, mapDbToAnnouncement, mapAnnouncementToDb, mapDbToBanner, mapBannerToDb, mapDbToAgent, mapAgentToDb, mapDbToTestimonial, mapTestimonialToDb, mapDbToOfficeInfo, mapOfficeInfoToDb, mapDbToTask, mapTaskToDb, mapDbToSearchAnalytics, mapDbToApplication, mapApplicationToDb, mapDbToApplicationFormTemplate, mapApplicationFormTemplateToDb, mapDbToCampaignAiDraft, mapCampaignAiDraftToDb, mapDbToCampaignPackage, mapCampaignPackageToDb } from './supabase-mappers';
import { PropertyListing, Project, Customer, Application, Lead, Campaign, CampaignQuestion, CampaignFaq, CampaignMedia, EasyBuyAccount, Installment, PaymentProof, LedgerTransaction, Receipt, Allocation, InspectionBooking, Reservation, CustomerCareTicket, WebsiteEnquiry, Announcement, Banner, Agent, Testimonial, OfficeInfo, Task, SearchAnalytics, Location, ApplicationFormTemplate, CampaignAiDraft, CampaignPackage } from './types';
import { ActivityLog, Notification } from './models-extensions';
import { generateCustomerRef, generateEasyBuyRef, generateBookingRef, generateReservationRef, generateLeadRef, generateTicketRef, generatePropertyRef, generateAllocationRef, generateAgentSerial } from './generators';
import { DEFAULT_QUALIFICATION_QUESTIONS, DEFAULT_CONDITIONAL_QUESTION } from './defaultCampaignQuestions';

// We use the browser client for the UI data layer
const getSupabase = () => createClient();

export const api = {

  // --- PROPERTIES ---
  async getProperties(): Promise<PropertyListing[]> {
    const { data, error } = await getSupabase().from('properties').select('*');
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (data) return data.map(mapDbToProperty);
    return [];
  },

  async getPropertyById(id: string): Promise<PropertyListing | null> {
    const { data, error } = await getSupabase().from('properties').select('*').or(`id.eq.${id},ref.eq.${id}`).maybeSingle();
    if (error) return null;
    if (data) return mapDbToProperty(data);
    return null;
  },

  async saveProperty(property: Partial<PropertyListing>): Promise<PropertyListing> {
    if (!property.id) {
        property.ref = generatePropertyRef(Math.floor(Math.random() * 1000));
    }
    const mapped = mapPropertyToDb(property);
    const { data, error } = await getSupabase().from('properties').upsert(mapped).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToProperty(data);
  },

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    const { data, error } = await getSupabase().from('projects').select('*, locations(name)').order('created_at', { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (data) return data.map(mapDbToProject);
    return [];
  },

  async saveProject(proj: Partial<Project>): Promise<Project> {
    if (!proj.name || !proj.name.trim()) throw new Error('Project name is required');
    if (!proj.description || !proj.description.trim()) throw new Error('Project description is required');
    if (proj.availableUnits === undefined || isNaN(Number(proj.availableUnits)) || Number(proj.availableUnits) < 0) {
      throw new Error('Available units must be a valid non-negative number');
    }
    if (proj.startingPrice === undefined || isNaN(Number(proj.startingPrice)) || Number(proj.startingPrice) < 0) {
      throw new Error('Starting price must be a valid non-negative number');
    }
    const mapped = mapProjectToDb(proj);
    const { data, error } = await getSupabase().from('projects').upsert(mapped).select('*, locations(name)').single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToProject(data);
  },

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await getSupabase().from('projects').select('*, locations(name)').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapDbToProject(data);
  },

  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await getSupabase().from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToLead);
      return [];
    } catch (err) {
      console.error('Failed to get leads', err);
      throw err;
    }
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    try {
      let score = 10;
      let temp: 'Cold' | 'Warm' | 'Hot' = 'Cold';
      
      if (data.source === 'Property Reservation') {
        score = 95; temp = 'Hot';
      } else if (data.source === 'Inspection Booking') {
        score = 80; temp = 'Hot';
      } else if (data.source === 'Property Request') {
        score = 60; temp = 'Warm';
      } else {
        score = 30; temp = 'Cold';
      }
      
      if (data.phone && data.phone !== 'Not Provided') score += 5;

      data.score = score;
      data.temperature = temp;
      data.status = 'New';

      if (!data.id && !data.ref) {
        const { count, error: countErr } = await getSupabase().from('leads').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        data.ref = generateLeadRef((count || 0) + 1);
      }

      const mapped = mapLeadToDb(data);
      const { data: dbData, error } = await getSupabase().from('leads').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToLead(dbData);
    } catch (err) {
      console.error('Failed to create lead', err);
      throw err;
    }
  },

  async updateLeadAssignment(id: string, assignedTo: string, notes: string, followUpDate: string): Promise<void> {
    const { error } = await getSupabase().from('leads').update({ 
      assigned_to: assignedTo, 
      notes: notes, 
      follow_up_date: followUpDate,
      assignment_date: new Date().toISOString()
    }).eq('id', id);
    if (error) throw new Error(`Supabase error: ${error.message}`);
  },

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await getSupabase().from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToCustomer);
      return [];
    } catch (err) {
      console.error('Failed to get customers', err);
      throw err;
    }
  },

  async saveCustomer(customer: Partial<Customer>, client?: any): Promise<Customer> {
    try {
      const supabase = client || getSupabase();
      if (!customer.id && !customer.ref) {
        const { count, error: countErr } = await supabase.from('customers').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        customer.ref = generateCustomerRef((count || 0) + 1);
      }
      
      const mapped = mapCustomerToDb(customer);
      const { data, error } = await supabase.from('customers').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToCustomer(data);
    } catch (err) {
      console.error('Failed to save customer', err);
      throw err;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await getSupabase().from('customers').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- EASY BUY ACCOUNTS ---
  async getEasyBuyAccounts(): Promise<EasyBuyAccount[]> {
    try {
      const { data, error } = await getSupabase().from('easy_buy_accounts').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToEasyBuyAccount);
      return [];
    } catch (err) {
      console.error('Failed to get easy buy accounts', err);
      throw err;
    }
  },

  async saveEasyBuyAccount(account: Partial<EasyBuyAccount>, client?: any): Promise<EasyBuyAccount> {
    try {
      const supabase = client || getSupabase();
      if (!account.id && !account.ref) {
        const { count, error: countErr } = await supabase.from('easy_buy_accounts').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        account.ref = generateEasyBuyRef((count || 0) + 1);
      }

      const mapped = mapEasyBuyAccountToDb(account);
      const { data, error } = await supabase.from('easy_buy_accounts').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToEasyBuyAccount(data);
    } catch (err) {
      console.error('Failed to save easy buy account', err);
      throw err;
    }
  },

  // --- APPLICATIONS ---
  async getApplications(): Promise<Application[]> {
    try {
      const { data, error } = await getSupabase().from('applications').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToApplication);
      return [];
    } catch (err) {
      console.error('Failed to get applications', err);
      throw err;
    }
  },

  async saveApplication(app: Partial<Application>, client?: any): Promise<Application> {
    try {
      const supabase = client || getSupabase();
      if (!app.id && !app.ref) {
        const { count, error: countErr } = await supabase.from('applications').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        app.ref = `APP-2026-${String((count || 0) + 1).padStart(4, '0')}`;
      }

      const mapped = mapApplicationToDb(app);
      const { data, error } = await supabase.from('applications').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToApplication(data);
    } catch (err) {
      console.error('Failed to save application', err);
      throw err;
    }
  },

  // --- INSTALLMENTS ---
  async getInstallments(): Promise<Installment[]> {
    try {
      const { data, error } = await getSupabase().from('installments').select('*').order('due_date', { ascending: true });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToInstallment);
      return [];
    } catch (err) {
      console.error('Failed to get installments', err);
      throw err;
    }
  },

  async saveInstallment(installment: Partial<Installment>, client?: any): Promise<Installment> {
    try {
      const supabase = client || getSupabase();
      const mapped = mapInstallmentToDb(installment);
      const { data, error } = await supabase.from('installments').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToInstallment(data);
    } catch (err) {
      console.error('Failed to save installment', err);
      throw err;
    }
  },

  // --- PAYMENT PROOFS & FINANCE ---
  async getPaymentProofs(): Promise<PaymentProof[]> {
    try {
      const { data, error } = await getSupabase().from('payment_proofs').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToPaymentProof);
      return [];
    } catch (err) {
      console.error('Failed to get payment proofs', err);
      throw err;
    }
  },

  async savePaymentProof(proof: Partial<PaymentProof>): Promise<PaymentProof> {
    try {
      const mapped = mapPaymentProofToDb(proof);
      const { data, error } = await getSupabase().from('payment_proofs').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToPaymentProof(data);
    } catch (err) {
      console.error('Failed to save payment proof', err);
      throw err;
    }
  },

  async getLedgerTransactions(): Promise<LedgerTransaction[]> {
    try {
      const { data, error } = await getSupabase().from('ledger_transactions').select('*').order('date', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToLedgerTransaction);
      return [];
    } catch (err) {
      console.error('Failed to get ledger transactions', err);
      throw err;
    }
  },

  async saveLedgerTransaction(tx: Partial<LedgerTransaction>): Promise<LedgerTransaction> {
    try {
      const mapped = mapLedgerTransactionToDb(tx);
      const { data, error } = await getSupabase().from('ledger_transactions').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToLedgerTransaction(data);
    } catch (err) {
      console.error('Failed to save ledger transaction', err);
      throw err;
    }
  },

  async getReceipts(): Promise<Receipt[]> {
    try {
      const { data, error } = await getSupabase().from('receipts').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToReceipt);
      return [];
    } catch (err) {
      console.error('Failed to get receipts', err);
      throw err;
    }
  },

  async saveReceipt(receipt: Partial<Receipt>): Promise<Receipt> {
    try {
      const mapped = mapReceiptToDb(receipt);
      const { data, error } = await getSupabase().from('receipts').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToReceipt(data);
    } catch (err) {
      console.error('Failed to save receipt', err);
      throw err;
    }
  },

  // PAYMENT VERIFICATION
  // NOTE: The original verify_payment_transaction RPC does not exist in the database.
  // Replaced with sequential direct updates to prevent runtime crash.
  // For full atomicity, deploy the verify_payment_transaction RPC to Supabase.
  async verifyPayment(
    proofId: string,
    amount: number,
    customerId: string,
    accountId: string,
    installmentNumber: number,
    issuedByProfileId: string,
    customReceiptNumber: string
  ): Promise<void> {
    const supabase = getSupabase();
    try {
      // 1. Mark payment proof as verified
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .update({
          status: 'Verified',
          verified_by: issuedByProfileId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', proofId);
      if (proofError) throw new Error(`Failed to verify payment proof: ${proofError.message}`);

      // 2. Create receipt
      const { error: receiptError } = await supabase
        .from('receipts')
        .insert({
          receipt_number: customReceiptNumber,
          customer_id: customerId,
          account_id: accountId,
          amount,
          issued_by: issuedByProfileId,
          issued_date: new Date().toISOString(),
          status: 'Issued',
        });
      if (receiptError) console.error('Receipt creation warning:', receiptError.message);

      // 3. Mark the installment as paid
      const { error: installError } = await supabase
        .from('installments')
        .update({ status: 'Paid', paid_date: new Date().toISOString() })
        .eq('account_id', accountId)
        .eq('installment_number', installmentNumber);
      if (installError) console.error('Installment update warning:', installError.message);

    } catch (err) {
      console.error('Payment verification failed', err);
      throw err;
    }
  },

  // --- OPERATIONS ---
  async getAllocations(): Promise<Allocation[]> {
    try {
      const { data, error } = await getSupabase().from('allocations').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToAllocation);
      return [];
    } catch (err) {
      console.error('Failed to get allocations', err);
      throw err;
    }
  },

  async saveAllocation(alloc: Partial<Allocation>, client?: any): Promise<Allocation> {
    try {
      const supabase = client || getSupabase();
      if (!alloc.id && !alloc.ref) {
        const { count, error: countErr } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        alloc.ref = generateAllocationRef((count || 0) + 1);
      }
      if (!alloc.id && !alloc.allocationDate) {
        alloc.allocationDate = new Date().toISOString().split('T')[0];
      }

      // Basic check for existing plot allocation
      if (!alloc.id && alloc.projectId && alloc.blockNumber && alloc.plotNumber) {
        const { count, error: countErr } = await supabase
          .from('allocations')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', alloc.projectId)
          .eq('block_number', alloc.blockNumber)
          .eq('plot_number', alloc.plotNumber)
          .in('status', ['Allocated', 'Pending Allocation', 'Approved']);
          
        if (countErr) throw new Error(countErr.message);
        if (count && count > 0) {
          throw new Error('ALLOCATION_ERROR: Plot is already allocated or pending allocation for another customer.');
        }
      }

      const mapped = mapAllocationToDb(alloc);
      const { data, error } = await supabase.from('allocations').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToAllocation(data);
    } catch (err) {
      console.error('Failed to save allocation', err);
      throw err;
    }
  },

  async getInspections(): Promise<InspectionBooking[]> {
    try {
      const { data, error } = await getSupabase().from('inspections').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToInspection);
      return [];
    } catch (err) {
      console.error('Failed to get inspections', err);
      throw err;
    }
  },

  async saveInspection(insp: Partial<InspectionBooking>): Promise<InspectionBooking> {
    try {
      if (!insp.id && !insp.ref) {
        const { count, error: countErr } = await getSupabase().from('inspections').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        insp.ref = generateBookingRef((count || 0) + 1);
      }
      const mapped = mapInspectionToDb(insp);
      const { data, error } = await getSupabase().from('inspections').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToInspection(data);
    } catch (err) {
      console.error('Failed to save inspection', err);
      throw err;
    }
  },

  async getReservations(): Promise<Reservation[]> {
    try {
      const { data, error } = await getSupabase().from('reservations').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToReservation);
      return [];
    } catch (err) {
      console.error('Failed to get reservations', err);
      throw err;
    }
  },

  async getTasks(): Promise<Task[]> {
    const { data, error } = await getSupabase().from('tasks').select('*').order('due_date', { ascending: true });
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToTask) : [];
  },

  async saveReservation(res: Partial<Reservation>): Promise<Reservation> {
    try {
      if (!res.id && !res.ref) {
        const { count, error: countErr } = await getSupabase().from('reservations').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        res.ref = generateReservationRef((count || 0) + 1);
      }
      const mapped = mapReservationToDb(res);
      const { data, error } = await getSupabase().from('reservations').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToReservation(data);
    } catch (err) {
      console.error('Failed to save reservation', err);
      throw err;
    }
  },

  // TRANSACTIONAL RESERVATION BLOCK
  async processReservation(reservationData: Partial<Reservation>, customerProfileId: string): Promise<void> {
    try {
      if (!reservationData.ref) {
         const { count } = await getSupabase().from('reservations').select('*', { count: 'exact', head: true });
         reservationData.ref = generateReservationRef((count || 0) + 1);
      }
      const mapped = mapReservationToDb(reservationData);
      const { error } = await getSupabase().rpc('process_reservation_transaction', {
         p_reservation_data: mapped,
         p_customer_profile_id: customerProfileId
      });
      if (error) throw new Error(`Reservation Transaction Failed: ${error.message}`);
    } catch (err) {
      console.error('Reservation transaction failed', err);
      throw err;
    }
  },

  // --- CUSTOMER CARE TICKETS ---
  async getCustomerCareTickets(): Promise<CustomerCareTicket[]> {
    try {
      const { data, error } = await getSupabase().from('customer_care_tickets').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToCustomerCareTicket);
      return [];
    } catch (err) {
      console.error('Failed to get customer care tickets', err);
      throw err;
    }
  },

  async saveCustomerCareTicket(ticket: Partial<CustomerCareTicket>): Promise<CustomerCareTicket> {
    try {
      if (!ticket.id && !ticket.ref) {
        const { count, error: countErr } = await getSupabase().from('customer_care_tickets').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        ticket.ref = generateTicketRef((count || 0) + 1);
      }
      const mapped = mapCustomerCareTicketToDb(ticket);
      const { data, error } = await getSupabase().from('customer_care_tickets').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToCustomerCareTicket(data);
    } catch (err) {
      console.error('Failed to save ticket', err);
      throw err;
    }
  },

  // --- ACTIVITY LOGS & NOTIFICATIONS ---
  async getLogs(): Promise<ActivityLog[]> {
    try {
      const { data, error } = await getSupabase().from('activity_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(100);
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToActivityLog);
      return [];
    } catch (err) {
      console.error('Failed to get activity logs', err);
      throw err;
    }
  },

  async logActivity(logData: Partial<ActivityLog>): Promise<void> {
    try {
      let userId: string | null = null;
      const { data: { user } } = await getSupabase().auth.getUser();
      if (user) {
        userId = user.id;
      }
      
      const mapped = mapActivityLogToDb(logData);
      const dbPayload = {
        ...mapped,
        user_id: userId
      };
      
      const { error } = await getSupabase().from('activity_logs').insert(dbPayload);
      if (error) throw new Error(`Supabase error: ${error.message}`);
    } catch (err) {
      console.error('Failed to log activity', err);
    }
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await getSupabase().from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      if (data) return data.map(mapDbToNotification);
      return [];
    } catch (err) {
      console.error('Failed to get notifications', err);
      throw err;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      // DB column is read_status (NOT is_read — mapper bug)
      const { error } = await getSupabase().from('notifications').update({ read_status: true }).eq('id', id);
      if (error) throw new Error(`Supabase error: ${error.message}`);
    } catch (err) {
      console.error('Failed to mark notification read', err);
      throw err;
    }
  },

  // --- CAMPAIGNS ---
  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await getSupabase().from('campaigns').select('*, lead_submissions(count), campaign_analytics(count)').order('created_at', { ascending: false });
    if (!error && data) return data.map(mapDbToCampaign);
    return [];
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await getSupabase().from('campaigns').select('*').eq('id', id).maybeSingle();
    if (!error && data) return mapDbToCampaign(data);
    return null;
  },

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    const { data, error } = await getSupabase().from('campaigns').select('*').eq('slug', slug).maybeSingle();
    if (!error && data) return mapDbToCampaign(data);
    return null;
  },

  async saveCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const mapped = mapCampaignToDb(campaign);
    const { data, error } = await getSupabase().from('campaigns').upsert(mapped).select().single();
    if (error) throw error;
    return mapDbToCampaign(data);
  },

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await getSupabase().from('campaigns').delete().eq('id', id);
    if (error) throw error;
  },

  // Campaign status management reuses the existing `status` column
  // (Draft/Active/Paused/Archived/Ended) — covers Activate/Pause/Archive.
  async updateCampaignStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    const { data, error } = await getSupabase().from('campaigns').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToCampaign(data);
  },

  // Duplicates a campaign plus its questions (preserving branching links)
  // and FAQs. The duplicate always starts as a Draft so it must be
  // explicitly activated by an Admin.
  async duplicateCampaign(id: string): Promise<Campaign> {
    const original = await this.getCampaignById(id);
    if (!original) throw new Error('Campaign not found');

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-5)}`;
    const newCampaign = await this.saveCampaign({
      name: `${original.name} (Copy)`,
      slug: newSlug,
      projectId: original.projectId,
      description: original.description,
      featuredImage: original.featuredImage,
      fbAdReference: original.fbAdReference,
      status: 'Draft',
      whatsappNumber: original.whatsappNumber,
      supportedLanguages: original.supportedLanguages,
      defaultLanguage: original.defaultLanguage,
      greetingEnabled: original.greetingEnabled,
      greetingConfig: original.greetingConfig,
      preApplicationEnabled: original.preApplicationEnabled,
      applicationFormTemplateId: original.applicationFormTemplateId,
      preApplicationPrompt: original.preApplicationPrompt,
      whatsappMessageTemplate: original.whatsappMessageTemplate
    });

    const [questions, faqs] = await Promise.all([
      this.getCampaignQuestions(id),
      this.getCampaignFaqs(id)
    ]);

    // Pass 1: create the duplicated questions (without branching links yet,
    // since the new parent ids don't exist until they're inserted).
    const questionIdMap = new Map<string, string>();
    for (const q of questions) {
      const newQ = await this.saveCampaignQuestion({
        campaignId: newCampaign.id,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        orderIndex: q.orderIndex,
        isRequired: q.isRequired,
        questionKey: q.questionKey
      });
      questionIdMap.set(q.id, newQ.id);
    }

    // Pass 2: re-wire conditional branching onto the new question ids.
    for (const q of questions) {
      if (q.parentQuestionId && questionIdMap.has(q.parentQuestionId)) {
        const newChildId = questionIdMap.get(q.id);
        const newParentId = questionIdMap.get(q.parentQuestionId);
        if (newChildId && newParentId) {
          await this.saveCampaignQuestion({
            id: newChildId,
            parentQuestionId: newParentId,
            showIfOption: q.showIfOption
          });
        }
      }
    }

    for (const f of faqs) {
      await this.saveCampaignFaq({
        campaignId: newCampaign.id,
        question: f.question,
        answer: f.answer,
        orderIndex: f.orderIndex
      });
    }

    return newCampaign;
  },

  // --- CAMPAIGN PACKAGES ---
  async getCampaignPackages(campaignId: string): Promise<CampaignPackage[]> {
    const { data, error } = await getSupabase().from('campaign_packages').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true });
    if (!error && data) return data.map(mapDbToCampaignPackage);
    return [];
  },

  async saveCampaignPackage(pkg: Partial<CampaignPackage>): Promise<CampaignPackage> {
    const mapped = mapCampaignPackageToDb(pkg);
    const { data, error } = await getSupabase().from('campaign_packages').upsert(mapped).select().single();
    if (error) throw error;
    return mapDbToCampaignPackage(data);
  },

  async deleteCampaignPackage(id: string): Promise<void> {
    const { error } = await getSupabase().from('campaign_packages').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CAMPAIGN QUESTIONS ---
  async getCampaignQuestions(campaignId: string): Promise<CampaignQuestion[]> {
    const { data, error } = await getSupabase().from('campaign_questions').select('*').eq('campaign_id', campaignId).order('order_index', { ascending: true });
    if (!error && data) return data.map(mapDbToCampaignQuestion);
    return [];
  },

  async saveCampaignQuestion(question: Partial<CampaignQuestion>): Promise<CampaignQuestion> {
    const mapped = mapCampaignQuestionToDb(question);
    const { data, error } = await getSupabase().from('campaign_questions').upsert(mapped).select().single();
    if (error) throw error;
    return mapDbToCampaignQuestion(data);
  },

  async deleteCampaignQuestion(id: string): Promise<void> {
    const { error } = await getSupabase().from('campaign_questions').delete().eq('id', id);
    if (error) throw error;
  },

  // Seeds a brand-new campaign with the approved default qualification
  // questions so it has a working, Admin-editable flow immediately
  // (rather than the public page silently using an in-memory fallback
  // Admin can never see or edit). Includes one working conditional
  // branching example (installment follow-up), wired to the real id of
  // the readiness question once it exists.
  async seedDefaultCampaignQuestions(campaignId: string): Promise<CampaignQuestion[]> {
    const created: CampaignQuestion[] = [];
    const keyToId = new Map<string, string>();
    for (const q of DEFAULT_QUALIFICATION_QUESTIONS) {
      const saved = await this.saveCampaignQuestion({ ...q, campaignId });
      created.push(saved);
      if (q.questionKey) keyToId.set(q.questionKey, saved.id);
    }

    const parentId = keyToId.get(DEFAULT_CONDITIONAL_QUESTION.triggerQuestionKey);
    if (parentId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { triggerQuestionKey, ...conditional } = DEFAULT_CONDITIONAL_QUESTION;
      const savedConditional = await this.saveCampaignQuestion({ ...conditional, campaignId, parentQuestionId: parentId });
      created.push(savedConditional);
    }

    return created;
  },

  // --- CAMPAIGN FAQS ---
  async getCampaignFaqs(campaignId: string): Promise<CampaignFaq[]> {
    const { data, error } = await getSupabase().from('campaign_faqs').select('*').eq('campaign_id', campaignId).order('order_index', { ascending: true });
    if (!error && data) return data.map(mapDbToCampaignFaq);
    return [];
  },

  async saveCampaignFaq(faq: Partial<CampaignFaq>): Promise<CampaignFaq> {
    const mapped = mapCampaignFaqToDb(faq);
    const { data, error } = await getSupabase().from('campaign_faqs').upsert(mapped).select().single();
    if (error) throw error;
    return mapDbToCampaignFaq(data);
  },

  async deleteCampaignFaq(id: string): Promise<void> {
    const { error } = await getSupabase().from('campaign_faqs').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CAMPAIGN MEDIA (property presentation gallery) ---
  async getCampaignMedia(campaignId: string): Promise<CampaignMedia[]> {
    const { data, error } = await getSupabase().from('campaign_media').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? data.map(mapDbToCampaignMedia) : [];
  },

  async saveCampaignMedia(media: Partial<CampaignMedia>): Promise<CampaignMedia> {
    const mapped = mapCampaignMediaToDb(media);
    const { data, error } = await getSupabase().from('campaign_media').upsert(mapped).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToCampaignMedia(data);
  },

  async deleteCampaignMedia(id: string): Promise<void> {
    const { error } = await getSupabase().from('campaign_media').delete().eq('id', id);
    if (error) throw error;
  },

  // --- APPLICATION FORM TEMPLATES (Landing Page Agent: pre-application form config) ---
  async getApplicationFormTemplates(): Promise<ApplicationFormTemplate[]> {
    const { data, error } = await getSupabase().from('application_form_templates').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? data.map(mapDbToApplicationFormTemplate) : [];
  },

  async saveApplicationFormTemplate(template: Partial<ApplicationFormTemplate>): Promise<ApplicationFormTemplate> {
    const mapped = mapApplicationFormTemplateToDb(template);
    const { data, error } = await getSupabase().from('application_form_templates').upsert(mapped).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToApplicationFormTemplate(data);
  },

  async getApplicationFormTemplateById(id: string): Promise<ApplicationFormTemplate | null> {
    const { data, error } = await getSupabase().from('application_form_templates').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapDbToApplicationFormTemplate(data);
  },

  // --- CAMPAIGN AI DRAFTS (Landing Page Agent: AI Builder draft -> review -> approve) ---
  async getCampaignAiDrafts(campaignId?: string): Promise<CampaignAiDraft[]> {
    const url = campaignId 
      ? `/api/admin/campaigns/ai-draft?campaignId=${encodeURIComponent(campaignId)}`
      : '/api/admin/campaigns/ai-draft';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data ? data.map(mapDbToCampaignAiDraft) : [];
  },

  async saveCampaignAiDraft(draft: Partial<CampaignAiDraft>): Promise<CampaignAiDraft> {
    const mapped = mapCampaignAiDraftToDb(draft);
    const { data, error } = await getSupabase().from('campaign_ai_drafts').upsert(mapped).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToCampaignAiDraft(data);
  },

  // Calls the server-side AI Builder route (LLM call happens server-side
  // only). Returns a Pending Review draft — never a live campaign.
  async generateCampaignAiDraft(prompt: string): Promise<CampaignAiDraft> {
    const response = await fetch('/api/admin/campaigns/ai-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return mapDbToCampaignAiDraft(await response.json());
  },

  async rejectCampaignAiDraft(draftId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('campaign_ai_drafts').update({
      status: 'Rejected',
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString()
    }).eq('id', draftId);
    if (error) throw new Error(`Supabase error: ${error.message}`);
  },

  // Approve & Publish (Phase 10): turns a Pending Review draft into a real
  // Draft-status campaign — never Active, so "publish" (activating it) is
  // still a separate, explicit Admin action. This is the ONLY path from an
  // AI draft into the live campaign tables.
  async approveCampaignAiDraft(draftId: string): Promise<Campaign> {
    const supabase = getSupabase();
    const { data: draftRow, error: draftError } = await supabase.from('campaign_ai_drafts').select('*').eq('id', draftId).single();
    if (draftError) throw new Error(`Failed to load draft: ${draftError.message}`);

    const config = draftRow.generated_config as {
      name: string;
      suggestedSlug: string;
      description?: string;
      greetingEnabled?: boolean;
      preApplicationEnabled?: boolean;
      preApplicationPrompt?: string | null;
      questions: Array<{
        questionKey?: string | null;
        type: CampaignQuestion['type'];
        questionText: string;
        options?: string[] | null;
        isRequired: boolean;
        parentQuestionKey?: string | null;
        showIfOption?: string | null;
      }>;
    };

    let slug = (config.suggestedSlug || config.name || 'campaign').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (await this.getCampaignBySlug(slug)) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }

    let newCampaign: Campaign;
    try {
      newCampaign = await this.saveCampaign({
        name: config.name,
        slug,
        description: config.description,
        status: 'Draft',
        greetingEnabled: config.greetingEnabled,
        preApplicationEnabled: config.preApplicationEnabled,
        preApplicationPrompt: config.preApplicationPrompt || undefined
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'unknown error';
      throw new Error(`Failed to create campaign from draft: ${msg}`);
    }

    const keyToId = new Map<string, string>();
    try {
      for (const q of config.questions || []) {
        const saved = await this.saveCampaignQuestion({
          campaignId: newCampaign.id,
          type: q.type,
          questionText: q.questionText,
          options: q.options || undefined,
          isRequired: q.isRequired,
          questionKey: q.questionKey || undefined
        });
        if (q.questionKey) keyToId.set(q.questionKey, saved.id);
      }
      for (const q of config.questions || []) {
        if (q.questionKey && q.parentQuestionKey && keyToId.has(q.parentQuestionKey)) {
          const childId = keyToId.get(q.questionKey);
          const parentId = keyToId.get(q.parentQuestionKey);
          if (childId && parentId) {
            await this.saveCampaignQuestion({ id: childId, parentQuestionId: parentId, showIfOption: q.showIfOption || null });
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'unknown error';
      throw new Error(`Campaign "${newCampaign.name}" was created, but saving its questions failed: ${msg}`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase.from('campaign_ai_drafts').update({
      status: 'Approved',
      campaign_id: newCampaign.id,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString()
    }).eq('id', draftId);
    if (updateError) throw new Error(`Failed to update draft: ${updateError.message}`);

    return newCampaign;
  },

  // --- EVENT TRACKING & SUBMISSIONS ---
  async trackCampaignEvent(campaignId: string, eventType: string): Promise<void> {
    try {
      const { error } = await getSupabase().from('campaign_analytics').insert({
        campaign_id: campaignId,
        event_type: eventType
      });
      if (error) console.error('Supabase trackCampaignEvent error:', error);
    } catch (err) {
      console.error('Failed to track campaign event', err);
    }
  },

  async submitCampaignLead(campaignId: string, leadData: Record<string, unknown>, answers: Array<{ questionId: string; answerText: string }>, scoreData: { score: number; category: string; readiness?: string; timeline?: string }): Promise<{ submission: unknown; score: unknown }> {
    const { data: submissionData, error: subError } = await getSupabase().from('lead_submissions').insert({
      campaign_id: campaignId,
      name: leadData.name,
      phone: leadData.phone,
      source: 'Campaign Landing Page',
      status: 'New'
    }).select().single();

    if (subError) throw new Error(`Failed to save lead submission: ${subError.message}`);

    const leadId = (submissionData as { id: string }).id;

    if (answers && answers.length > 0) {
      const answersPayload = answers.map(a => ({
        lead_id: leadId,
        question_id: a.questionId,
        answer_text: a.answerText
      }));
      const { error: ansError } = await getSupabase().from('lead_answers').insert(answersPayload);
      if (ansError) console.error('Supabase lead_answers error:', ansError);
    }

    const { error: scoreError } = await getSupabase().from('lead_scores').insert({
      lead_id: leadId,
      score: scoreData.score,
      category: scoreData.category
    });
    if (scoreError) console.error('Supabase lead_scores error:', scoreError);

    const campaign = await this.getCampaignById(campaignId);
    
    const answersSummary = answers.map(a => `- ${a.answerText}`).join('\n');
    const notesSummary = `[CAMPAIGN LEAD: ${campaign?.name || 'Unknown Campaign'}]\nCategory: ${scoreData.category} (${scoreData.score} pts)\nReadiness: ${scoreData.readiness ?? 'N/A'}\nTimeline: ${scoreData.timeline ?? 'N/A'}\n\nAnswers:\n${answersSummary}`;

    try {
      const { data: crmLeadData, error: crmError } = await getSupabase().from('leads').insert({
        ref: `MIRE-LD-${Date.now().toString().slice(-6)}`,
        name: leadData.name,
        phone: leadData.phone,
        whatsapp: leadData.phone,
        source: 'Facebook Lead Campaign',
        interest: campaign?.name || 'Campaign Offer',
        budget: 'Campaign Specific',
        location: 'Campaign specific',
        notes: notesSummary,
        score: scoreData.score,
        temperature: scoreData.category,
        status: 'New'
      }).select().single();

      if (crmError) {
        console.error('Supabase create CRM lead error:', crmError);
      } else if (crmLeadData?.id) {
        // Link the campaign submission to the CRM lead it created, so the
        // two records are actually related (not just connected by a notes
        // string). Best-effort: the submission and CRM lead already exist
        // either way, so a failure here doesn't need to fail the whole flow.
        const { error: linkError } = await getSupabase()
          .from('lead_submissions')
          .update({ lead_id: crmLeadData.id })
          .eq('id', leadId);
        if (linkError) console.error('Failed to link lead_submission to CRM lead:', linkError);
      }
    } catch (err) {
      console.error('Failed to create CRM lead:', err);
    }

    return { submission: submissionData, score: scoreData };
  },

  async getCampaignAnalyticsEvents(campaignId?: string): Promise<unknown[]> {
    let query = getSupabase().from('campaign_analytics').select('*');
    if (campaignId) query = query.eq('campaign_id', campaignId);
    const { data, error } = await query;
    if (!error && data) return data;
    return [];
  },

  // Submissions for a campaign, with their lead score attached — used by
  // the campaign analytics/leads view.
  async getCampaignSubmissions(campaignId: string): Promise<unknown[]> {
    const { data, error } = await getSupabase()
      .from('lead_submissions')
      .select('*, lead_scores(score, category)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data || [];
  },

  async getTickets(): Promise<CustomerCareTicket[]> {
    return this.getCustomerCareTickets();
  },

  async getWebsiteEnquiries(): Promise<WebsiteEnquiry[]> {
    const { data, error } = await getSupabase().from('website_enquiries').select('*');
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToWebsiteEnquiry) : [];
  },

  async submitWebsiteEnquiry(payload: Partial<WebsiteEnquiry>): Promise<WebsiteEnquiry> {
    const { data, error } = await getSupabase().from('website_enquiries').insert(mapWebsiteEnquiryToDb(payload)).select().single();
    if (error) throw new Error(error.message);
    return mapDbToWebsiteEnquiry(data);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await getSupabase().from('announcements').select('*');
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToAnnouncement) : [];
  },

  async saveAnnouncement(payload: Partial<Announcement>): Promise<Announcement> {
    const { data, error } = await getSupabase().from('announcements').upsert(mapAnnouncementToDb(payload)).select().single();
    if (error) throw new Error(error.message);
    return mapDbToAnnouncement(data);
  },

  // All banners, for the Chairman/Admin management table (both active and
  // inactive, regardless of schedule window).
  async getBanners(): Promise<Banner[]> {
    const { data, error } = await getSupabase().from('banners').select('*').order('order_index', { ascending: true });
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToBanner) : [];
  },

  // Only banners the customer portal slider should actually render: active,
  // and (if scheduled) currently within their start/end window.
  async getActiveBanners(): Promise<Banner[]> {
    const { data, error } = await getSupabase().from('banners').select('*').eq('is_active', true).order('order_index', { ascending: true });
    if (error) throw new Error(error.message);
    const now = Date.now();
    return (data ? data.map(mapDbToBanner) : []).filter((b: Banner) => {
      if (b.startAt && new Date(b.startAt).getTime() > now) return false;
      if (b.endAt && new Date(b.endAt).getTime() < now) return false;
      return true;
    });
  },

  async saveBanner(payload: Partial<Banner>): Promise<Banner> {
    const { data, error } = await getSupabase().from('banners').upsert(mapBannerToDb(payload)).select().single();
    if (error) throw new Error(error.message);
    return mapDbToBanner(data);
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await getSupabase().from('testimonials').select('*');
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToTestimonial) : [];
  },

  async getOfficeInfo(): Promise<OfficeInfo> {
    const { data, error } = await getSupabase().from('office_info').select('*').limit(1).maybeSingle();
    if (error) {
      console.warn('Failed to get office info:', error.message);
      return { id: 'd3b07384-d113-4ec2-a5e6-df06d3e69f8c', address: '', phone1: '', phone2: '', whatsapp: '', email1: '', email2: '', mapsLink: '', businessHours: '' } as OfficeInfo;
    }
    return data ? mapDbToOfficeInfo(data) : { id: 'd3b07384-d113-4ec2-a5e6-df06d3e69f8c', address: '', phone1: '', phone2: '', whatsapp: '', email1: '', email2: '', mapsLink: '', businessHours: '' } as OfficeInfo;
  },

  async getRevenueReports(): Promise<{ monthly: number; yearly: number; total: number }> {
    const { data, error } = await getSupabase().from('ledger_transactions').select('amount, type');
    if (error) return { monthly: 0, yearly: 0, total: 0 };
    let total = 0;
    data?.forEach(tx => { if (tx.type === 'Credit') total += Number(tx.amount); });
    return { monthly: total / 12, yearly: total, total };
  },

  async trackSearch(target: string, type: string): Promise<void> {
    try {
      await getSupabase().from('search_analytics').insert({ target, type });
    } catch (err) {
      console.error(err);
    }
  },
  
  async getAnalytics(): Promise<SearchAnalytics[]> {
    const { data, error } = await getSupabase().from('search_analytics').select('*');
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToSearchAnalytics) : [];
  },

  async getDefaulters(): Promise<{ totalDefaulters: number; days30: number; days60: number; days90Plus: number; defaulterAccounts: unknown[] }> {
    const today = new Date();
    const { data: installments, error } = await getSupabase()
      .from('installments')
      .select('*, easy_buy_accounts(*)')
      .in('status', ['Overdue', 'Pending']);

    if (error || !installments) return { totalDefaulters: 0, days30: 0, days60: 0, days90Plus: 0, defaulterAccounts: [] };

    const accountMap = new Map<string, { account: unknown; maxDaysLate: number }>();

    for (const inst of installments) {
      if (!inst.due_date) continue;
      const dueDate = new Date(inst.due_date);
      if (dueDate >= today) continue;
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const accountId = inst.account_id;
      if (!accountMap.has(accountId) || accountMap.get(accountId)!.maxDaysLate < daysLate) {
        accountMap.set(accountId, { account: inst.easy_buy_accounts || { ref: accountId, customerId: inst.customer_id }, maxDaysLate: daysLate });
      }
    }

    let days30 = 0, days60 = 0, days90Plus = 0;
    const defaulterAccounts: unknown[] = [];

    for (const [, val] of accountMap) {
      defaulterAccounts.push(val);
      if (val.maxDaysLate >= 90) days90Plus++;
      else if (val.maxDaysLate >= 30) days60++;
      else days30++;
    }

    return { totalDefaulters: accountMap.size, days30, days60, days90Plus, defaulterAccounts };
  },

  // --- LEADS: ASSIGN ---
  async assignLead(id: string, assignedTo: string): Promise<Lead> {
    const { data, error } = await getSupabase()
      .from('leads')
      .update({ assigned_to: assignedTo })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToLead(data);
  },

  // --- TASKS: STATUS ---
  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    const { data, error } = await getSupabase()
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToTask(data);
  },

  async saveTask(task: Partial<Task>): Promise<Task> {
    const { data, error } = await getSupabase().from('tasks').upsert(mapTaskToDb(task)).select().single();
    if (error) throw new Error(error.message);
    return mapDbToTask(data);
  },

  // --- RESERVATIONS: STATUS ---
  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    const { data, error } = await getSupabase()
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToReservation(data);
  },

  async updateReservationAllocationStatus(id: string, allocationStatus: string): Promise<Reservation> {
    const { data, error } = await getSupabase()
      .from('reservations')
      .update({ allocation_status: allocationStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToReservation(data);
  },

  // --- LOCATIONS ---
  async getLocations(): Promise<Location[]> {
    const { data, error } = await getSupabase().from('locations').select('*').order('name');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async saveLocation(loc: Partial<Location>): Promise<Location> {
    const { data, error } = await getSupabase().from('locations').upsert(loc).select().single();
    if (error) throw new Error(error.message);
    return data as Location;
  },

  async deleteLocation(id: string): Promise<void> {
    const { error } = await getSupabase().from('locations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- PROPERTY SUBMISSIONS ---
  async getSubmissions(): Promise<unknown[]> {
    const { data, error } = await getSupabase().from('property_submissions').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createSubmission(payload: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await getSupabase().from('property_submissions').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateSubmissionStatus(id: string, status: string): Promise<unknown> {
    const { data, error } = await getSupabase()
      .from('property_submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // --- PROPERTY REQUESTS ---
  async getRequests(): Promise<unknown[]> {
    const { data, error } = await getSupabase().from('property_requests').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createRequest(payload: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await getSupabase().from('property_requests').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateRequestStatus(id: string, status: string): Promise<unknown> {
    const { data, error } = await getSupabase()
      .from('property_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // --- DOCUMENTS ---
  async getDocuments(customerId?: string): Promise<unknown[]> {
    let query = getSupabase().from('documents').select('*').order('generated_date', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async saveDocument(doc: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await getSupabase().from('documents').upsert(doc).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  // --- PROJECTS: TOGGLE STATUS ---
  async updateProjectStatus(id: string, active: boolean): Promise<Project> {
    const { data, error } = await getSupabase()
      .from('projects')
      .update({ active })
      .eq('id', id)
      .select('*, locations(name)')
      .single();
    if (error) throw new Error(error.message);
    return mapDbToProject(data);
  },

  // --- PROJECTS: ARCHIVE / RESTORE ---
  // Projects are never hard-deleted since campaigns, reservations and
  // allocations reference them via project_id. Archiving soft-removes a
  // project from active use (public site, campaign/project selectors)
  // while preserving the row and its references.
  async updateProjectArchiveStatus(id: string, archived: boolean): Promise<Project> {
    const { data, error } = await getSupabase()
      .from('projects')
      .update(archived ? { archived: true, active: false } : { archived: false })
      .eq('id', id)
      .select('*, locations(name)')
      .single();
    if (error) throw new Error(error.message);
    return mapDbToProject(data);
  },

  // --- INSPECTIONS: UPDATE ---
  async updateInspectionStatus(id: string, status: InspectionBooking['status']): Promise<InspectionBooking> {
    const { data, error } = await getSupabase()
      .from('inspections')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToInspection(data);
  },

  async updateInspectionAssignment(id: string, assignedTo: string): Promise<InspectionBooking> {
    const { data, error } = await getSupabase()
      .from('inspections')
      .update({ assigned_to: assignedTo })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToInspection(data);
  },

  // --- ANNOUNCEMENTS: DELETE ---
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await getSupabase().from('announcements').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- BANNERS: DELETE ---
  async deleteBanner(id: string): Promise<void> {
    const { error } = await getSupabase().from('banners').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- AGENT PORTAL: AGENTS ---
  // `client` lets server-side routes (registration, which must use the
  // service-role key) reuse this same function, matching how
  // saveCustomer/saveApplication already support an optional admin client.
  async saveAgent(agent: Partial<Agent>, client?: any): Promise<Agent> {
    const supabase = client || getSupabase();
    if (!agent.id && !agent.agentSerial) {
      const { count, error: countErr } = await supabase.from('agents').select('*', { count: 'exact', head: true });
      if (countErr) throw new Error(countErr.message);
      agent.agentSerial = generateAgentSerial((count || 0) + 1);
    }
    const mapped = mapAgentToDb(agent);
    const { data, error } = await supabase.from('agents').upsert(mapped).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return mapDbToAgent(data);
  },

  async getAgents(status?: Agent['status']): Promise<Agent[]> {
    let query = getSupabase().from('agents').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ? data.map(mapDbToAgent) : [];
  },

  async getMyAgentProfile(): Promise<Agent | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('agents').select('*').eq('profile_id', user.id).maybeSingle();
    if (error || !data) return null;
    return mapDbToAgent(data);
  },

  async approveAgent(id: string, approvedBy: string): Promise<Agent> {
    const { data, error } = await getSupabase().from('agents')
      .update({ status: 'Approved', approved_by: approvedBy, approved_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapDbToAgent(data);
  },

  async rejectAgent(id: string, reason: string, approvedBy: string): Promise<Agent> {
    const { data, error } = await getSupabase().from('agents')
      .update({ status: 'Rejected', rejection_reason: reason, approved_by: approvedBy, approved_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapDbToAgent(data);
  },

  // --- LEADS: UPDATE STATUS ---
  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    const { data, error } = await getSupabase()
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToLead(data);
  },

  // --- LEADS: CONVERT TO CUSTOMER ---
  async convertLeadToCustomer(leadId: string): Promise<Customer> {
    const supabase = getSupabase();
    const { data: leadData, error: leadError } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (leadError) throw new Error(`Lead fetch failed: ${leadError.message}`);
    
    const refCount = Math.floor(Math.random() * 10000);
    const customerRef = generateCustomerRef(refCount);
    
    const newCustomer = {
      ref: customerRef,
      full_name: leadData.name,
      phone: leadData.phone,
      whatsapp: leadData.whatsapp,
      email: leadData.email,
      address: leadData.location,
      status: 'Active'
    };
    
    const { data: customerData, error: custError } = await supabase.from('customers').insert(newCustomer).select().single();
    if (custError) throw new Error(`Customer creation failed: ${custError.message}`);
    
    await supabase.from('leads').update({ status: 'Closed Won' }).eq('id', leadId);
    
    return mapDbToCustomer(customerData);
  },

  // --- TESTIMONIALS ---
  async saveTestimonial(payload: Partial<Testimonial>): Promise<Testimonial> {
    const { data, error } = await getSupabase().from('testimonials').upsert(mapTestimonialToDb(payload)).select().single();
    if (error) throw new Error(error.message);
    return mapDbToTestimonial(data);
  },

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await getSupabase().from('testimonials').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- WEBSITE ENQUIRIES ---
  async updateWebsiteEnquiryStatus(id: string, status: string): Promise<WebsiteEnquiry> {
    const { data, error } = await getSupabase()
      .from('website_enquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToWebsiteEnquiry(data);
  },

  async deleteWebsiteEnquiry(id: string): Promise<void> {
    const { error } = await getSupabase().from('website_enquiries').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- OFFICE INFO: UPDATE ---
  async updateOfficeInfo(payload: Partial<OfficeInfo>): Promise<OfficeInfo> {
    const response = await fetch('/api/admin/office-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json() as Promise<OfficeInfo>;
  },

  // --- LOGGING & NOTIFICATIONS ---
  // NOTE: For targeted notifications (specific user), call createClient() directly
  // in your page component and look up profile IDs by role. This function inserts
  // a notification for a specific user when userId is provided.
  async createActivityLog(log: Partial<ActivityLog>): Promise<void> {
    try {
      const { error } = await getSupabase().from('activity_logs').insert([{
        user_id: log.userId ?? null,
        module: log.module,
        action: log.action,
        details: log.details || {}
      }]);
      if (error) console.error('Activity Log Error:', error);
    } catch (e) {
      console.error('Failed to create activity log', e);
    }
  },

  async createNotification(notification: Partial<Notification> & { userId?: string }): Promise<void> {
    try {
      const { error } = await getSupabase().from('notifications').insert([{
        user_id: notification.userId ?? null,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'System',
        read_status: false, // correct DB column name
      }]);
      if (error) console.error('Notification Error:', error);
    } catch (e) {
      console.error('Failed to create notification', e);
    }
  }
};
