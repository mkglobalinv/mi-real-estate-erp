import { createClient } from '@/utils/supabase/client';
import { mapDbToProperty, mapPropertyToDb, mapDbToProject, mapDbToLead, mapLeadToDb, mapDbToCustomer, mapCustomerToDb, mapDbToCampaign, mapCampaignToDb, mapDbToCampaignQuestion, mapCampaignQuestionToDb, mapDbToCampaignFaq, mapCampaignFaqToDb, mapDbToEasyBuyAccount, mapEasyBuyAccountToDb, mapDbToInstallment, mapInstallmentToDb, mapDbToPaymentProof, mapPaymentProofToDb, mapDbToLedgerTransaction, mapLedgerTransactionToDb, mapDbToReceipt, mapReceiptToDb, mapDbToAllocation, mapAllocationToDb, mapDbToInspection, mapInspectionToDb, mapDbToReservation, mapReservationToDb, mapDbToCustomerCareTicket, mapCustomerCareTicketToDb, mapDbToActivityLog, mapActivityLogToDb, mapDbToNotification, mapNotificationToDb, mapDbToWebsiteEnquiry, mapWebsiteEnquiryToDb, mapDbToAnnouncement, mapAnnouncementToDb, mapDbToTestimonial, mapTestimonialToDb, mapDbToOfficeInfo, mapOfficeInfoToDb, mapDbToTask, mapTaskToDb, mapDbToSearchAnalytics, mapSearchAnalyticsToDb, mapDbToApplication, mapApplicationToDb } from './supabase-mappers';
import { PropertyListing, Project, Customer, Application, Lead, Campaign, CampaignQuestion, CampaignFaq, EasyBuyAccount, Installment, PaymentProof, LedgerTransaction, Receipt, Allocation, InspectionBooking, Reservation, CustomerCareTicket, WebsiteEnquiry, Announcement, Testimonial, OfficeInfo, Task, SearchAnalytics, Location } from './types';
import { ActivityLog, Notification } from './models-extensions';
import { generateCustomerRef, generateEasyBuyRef, generateBookingRef, generateReservationRef, generateLeadRef, generateTicketRef, generatePropertyRef } from './generators';

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
    const { data, error } = await getSupabase().from('projects').select('*');
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (data) return data.map(mapDbToProject);
    return [];
  },

  async saveProject(proj: Partial<Project>): Promise<Project> {
    const { data, error } = await getSupabase().from('projects').upsert(proj).select().single();
    if (error) throw new Error(`Supabase error: ${error.message}`);
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

  async saveCustomer(customer: Partial<Customer>): Promise<Customer> {
    try {
      if (!customer.id && !customer.ref) {
        const { count, error: countErr } = await getSupabase().from('customers').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        customer.ref = generateCustomerRef((count || 0) + 1);
      }
      
      const mapped = mapCustomerToDb(customer);
      const { data, error } = await getSupabase().from('customers').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToCustomer(data);
    } catch (err) {
      console.error('Failed to save customer', err);
      throw err;
    }
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

  async saveEasyBuyAccount(account: Partial<EasyBuyAccount>): Promise<EasyBuyAccount> {
    try {
      if (!account.id && !account.ref) {
        const { count, error: countErr } = await getSupabase().from('easy_buy_accounts').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        account.ref = generateEasyBuyRef((count || 0) + 1);
      }

      const mapped = mapEasyBuyAccountToDb(account);
      const { data, error } = await getSupabase().from('easy_buy_accounts').upsert(mapped).select().single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return mapDbToEasyBuyAccount(data);
    } catch (err) {
      console.error('Failed to save easy buy account', err);
      throw err;
    }
  },

  // --- APPLICATIONS ---
  async getApplications(): Promise<any[]> {
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

  async saveApplication(app: any): Promise<any> {
    try {
      if (!app.id && !app.ref) {
        const { count, error: countErr } = await getSupabase().from('applications').select('*', { count: 'exact', head: true });
        if (countErr) throw new Error(countErr.message);
        app.ref = `APP-2026-${String((count || 0) + 1).padStart(4, '0')}`;
      }

      const mapped = mapApplicationToDb(app);
      const { data, error } = await getSupabase().from('applications').upsert(mapped).select().single();
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

  async saveInstallment(installment: Partial<Installment>): Promise<Installment> {
    try {
      const mapped = mapInstallmentToDb(installment);
      const { data, error } = await getSupabase().from('installments').upsert(mapped).select().single();
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

  // TRANSACTIONAL PAYMENT VERIFICATION
  async verifyPayment(proofId: string, amount: number, customerId: string, accountId: string, installmentNumber: number, issuedByProfileId: string, customReceiptNumber: string): Promise<void> {
    try {
      // Execute the RPC for atomicity
      const { error } = await getSupabase().rpc('verify_payment_transaction', {
        p_proof_id: proofId,
        p_amount: amount,
        p_customer_id: customerId,
        p_account_id: accountId,
        p_installment_month: installmentNumber,
        p_issued_by: issuedByProfileId,
        p_receipt_number: customReceiptNumber
      });
      if (error) throw new Error(`Transaction Failed: ${error.message}`);
    } catch (err) {
      console.error('Payment verification transaction failed', err);
      throw err;
    }
  },

  // --- OPERATIONS (STAGE 3) ---
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

  async saveAllocation(alloc: Partial<Allocation>): Promise<Allocation> {
    try {
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
      const { data, error } = await getSupabase().from('allocations').upsert(mapped).select().single();
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
      const { error } = await getSupabase().from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw new Error(`Supabase error: ${error.message}`);
    } catch (err) {
      console.error('Failed to mark notification read', err);
      throw err;
    }
  },

  // --- CAMPAIGNS (PHASE 6) ---
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

  // --- EVENT TRACKING & SUBMISSIONS (SUPABASE INTEGRATED) ---
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

  async submitCampaignLead(campaignId: string, leadData: any, answers: any[], scoreData: any): Promise<any> {
    // 1. Save Lead Submission
    const { data: submissionData, error: subError } = await getSupabase().from('lead_submissions').insert({
      campaign_id: campaignId,
      name: leadData.name,
      phone: leadData.phone,
      source: 'Campaign Landing Page',
      status: 'New'
    }).select().single();

    if (subError) throw new Error(`Failed to save lead submission: ${subError.message}`);

    const leadId = submissionData.id;

    // 2. Save Answers
    if (answers && answers.length > 0) {
      const answersPayload = answers.map(a => ({
        lead_id: leadId,
        question_id: a.questionId,
        answer_text: a.answerText
      }));
      const { error: ansError } = await getSupabase().from('lead_answers').insert(answersPayload);
      if (ansError) console.error('Supabase lead_answers error:', ansError);
    }

    // 3. Save Score
    const { error: scoreError } = await getSupabase().from('lead_scores').insert({
      lead_id: leadId,
      score: scoreData.score,
      category: scoreData.category
    });
    if (scoreError) console.error('Supabase lead_scores error:', scoreError);

    // 4. Create CRM Lead Record
    // Retrieve the campaign name for CRM records
    const campaign = await this.getCampaignById(campaignId);
    
    const answersSummary = answers.map(a => `- ${a.answerText}`).join('\n');
    const notesSummary = `[CAMPAIGN LEAD: ${campaign?.name || 'Unknown Campaign'}]
Category: ${scoreData.category} (${scoreData.score} pts)
Readiness: ${scoreData.readiness}
Timeline: ${scoreData.timeline}

Answers:
${answersSummary}`;

    try {
      // Use standard CRM createLead which might eventually use Supabase
      // For now, mapping explicitly for direct Supabase insert
      const { error: crmError } = await getSupabase().from('leads').insert({
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
      });
      if (crmError) console.error('Supabase create CRM lead error:', crmError);
    } catch (err) {
      console.error('Failed to create CRM lead:', err);
    }

    return { submission: submissionData, score: scoreData };
  },

  async getCampaignAnalyticsEvents(campaignId?: string): Promise<any[]> {
    let query = getSupabase().from('campaign_analytics').select('*');
    if (campaignId) query = query.eq('campaign_id', campaignId);
    const { data, error } = await query;
    if (!error && data) return data;
    return [];
  },

  async getTickets(): Promise<any[]> {
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

  async getRevenueReports(): Promise<any> {
    // Generate dynamically from ledger_transactions
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

  async getDefaulters(): Promise<{ totalDefaulters: number; days30: number; days60: number; days90Plus: number; defaulterAccounts: any[] }> {
    const today = new Date();
    const { data: installments, error } = await supabase
      .from('installments')
      .select('*, easy_buy_accounts(*)')
      .in('status', ['Overdue', 'Pending']);

    if (error || !installments) return { totalDefaulters: 0, days30: 0, days60: 0, days90Plus: 0, defaulterAccounts: [] };

    const accountMap = new Map<string, { account: any; maxDaysLate: number }>();

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
    const defaulterAccounts: any[] = [];

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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToReservation(data);
  },

  async updateReservationAllocationStatus(id: string, allocationStatus: string): Promise<Reservation> {
    const { data, error } = await supabase
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
  async getSubmissions(): Promise<any[]> {
    const { data, error } = await getSupabase().from('property_submissions').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createSubmission(payload: any): Promise<any> {
    const { data, error } = await getSupabase().from('property_submissions').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateSubmissionStatus(id: string, status: string): Promise<any> {
    const { data, error } = await supabase
      .from('property_submissions')
      .update({ status, assigned_to: undefined })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // --- PROPERTY REQUESTS ---
  async getRequests(): Promise<any[]> {
    const { data, error } = await getSupabase().from('property_requests').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createRequest(payload: any): Promise<any> {
    const { data, error } = await getSupabase().from('property_requests').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateRequestStatus(id: string, status: string): Promise<any> {
    const { data, error } = await supabase
      .from('property_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // --- DOCUMENTS ---
  async getDocuments(customerId?: string): Promise<any[]> {
    let query = getSupabase().from('documents').select('*').order('generated_date', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async saveDocument(doc: any): Promise<any> {
    const { data, error } = await getSupabase().from('documents').upsert(doc).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  // --- PROJECTS: TOGGLE STATUS ---
  async updateProjectStatus(id: string, active: boolean): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ active })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToProject(data);
  },

  // --- INSPECTIONS: UPDATE ---
  async updateInspectionStatus(id: string, status: InspectionBooking['status']): Promise<InspectionBooking> {
    const { data, error } = await supabase
      .from('inspections')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapDbToInspection(data);
  },

  async updateInspectionAssignment(id: string, assignedTo: string): Promise<InspectionBooking> {
    const { data, error } = await supabase
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

  // --- LEADS: UPDATE STATUS ---
  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    const { data, error } = await supabase
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
    // 1. Fetch Lead
    const { data: leadData, error: leadError } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (leadError) throw new Error(`Lead fetch failed: ${leadError.message}`);
    
    // 2. Generate new Customer Ref (We use a random number for now or query max count)
    const refCount = Math.floor(Math.random() * 10000);
    const customerRef = generateCustomerRef(refCount);
    
    // 3. Create Customer
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
    
    // 4. Update Lead status to 'Closed Won'
    await supabase.from('leads').update({ status: 'Closed Won' }).eq('id', leadId);
    
    return mapDbToCustomer(customerData);
  },

  // --- TESTIMONIALS ---
  async saveTestimonial(payload: any): Promise<any> {
    const { data, error } = await getSupabase().from('testimonials').upsert(mapTestimonialToDb(payload)).select().single();
    if (error) throw new Error(error.message);
    return mapDbToTestimonial(data);
  },

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await getSupabase().from('testimonials').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- WEBSITE ENQUIRIES ---
  async updateWebsiteEnquiryStatus(id: string, status: string): Promise<any> {
    const { data, error } = await supabase
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
  // Uses a server-side API route to bypass browser RLS restrictions on office_info.
  // The server route authenticates the user via cookies and validates Super Admin role.
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
    return response.json();
  },

  // --- LOGGING & NOTIFICATIONS ---
  async createActivityLog(log: Partial<ActivityLog>): Promise<void> {
    try {
      const { error } = await getSupabase().from('activity_logs').insert([{
        user_id: log.userId,
        module: log.module,
        action: log.action,
        details: log.details || {}
      }]);
      if (error) console.error('Activity Log Error:', error);
    } catch (e) {
      console.error('Failed to create activity log', e);
    }
  },

  async createNotification(notification: Partial<Notification>): Promise<void> {
    try {
      const { error } = await getSupabase().from('notifications').insert([{
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'System'
      }]);
      if (error) console.error('Notification Error:', error);
    } catch (e) {
      console.error('Failed to create notification', e);
    }
  }
};
