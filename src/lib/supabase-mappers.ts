import { PropertyListing, Project, Customer, Lead, EasyBuyAccount, Installment, PaymentProof, LedgerTransaction, Allocation, Document, CustomerCareTicket, Receipt, InspectionBooking, Reservation, ApplicationFormTemplate, CampaignAiDraft, CampaignMedia } from './types';
import { ActivityLog, Notification } from './models-extensions';

export function mapDbToProperty(dbProp: any): PropertyListing {
  return {
    id: dbProp.id,
    ref: dbProp.ref,
    title: dbProp.title,
    type: dbProp.type,
    purpose: dbProp.purpose,
    location: dbProp.location,
    price: Number(dbProp.price),
    bedrooms: dbProp.bedrooms,
    bathrooms: dbProp.bathrooms,
    area: dbProp.area,
    status: dbProp.status,
    verificationStatus: dbProp.verification_status,
    easyBuyEligible: dbProp.easy_buy_eligible,
    description: dbProp.description,
    features: typeof dbProp.features === 'string' ? JSON.parse(dbProp.features) : (dbProp.features || []),
    images: typeof dbProp.images === 'string' ? JSON.parse(dbProp.images) : (dbProp.images || []),
    galleryImages: typeof dbProp.images === 'string' ? JSON.parse(dbProp.images) : (dbProp.images || []),
    state: '', lga: '', address: '', featured: false,
    createdAt: dbProp.created_at
  };
}

export function mapPropertyToDb(prop: Partial<PropertyListing>): any {
  return {
    ...(prop.id && { id: prop.id }),
    ...(prop.ref && { ref: prop.ref }),
    ...(prop.title && { title: prop.title }),
    ...(prop.type && { type: prop.type }),
    ...(prop.purpose && { purpose: prop.purpose }),
    ...(prop.location && { location: prop.location }),
    ...(prop.price !== undefined && { price: prop.price }),
    ...(prop.bedrooms !== undefined && { bedrooms: prop.bedrooms }),
    ...(prop.bathrooms !== undefined && { bathrooms: prop.bathrooms }),
    ...(prop.area && { area: prop.area }),
    ...(prop.status && { status: prop.status }),
    ...(prop.verificationStatus && { verification_status: prop.verificationStatus }),
    ...(prop.easyBuyEligible !== undefined && { easy_buy_eligible: prop.easyBuyEligible }),
    ...(prop.description && { description: prop.description }),
    ...(prop.features && { features: JSON.stringify(prop.features) }),
    ...(prop.images && { images: JSON.stringify(prop.images) })
  };
}

// Minimal mappings for the rest to fallback safely
export function mapDbToProject(db: any): Project {
  return {
    ...db,
    startingPrice: Number(db.starting_price),
    availableUnits: Number(db.available_units),
    coverImage: db.cover_image,
    locationId: db.location_id,
    easyBuyStatus: db.easy_buy_status,
    createdAt: db.created_at
  };
}

export function mapDbToLead(db: any): Lead {
  return {
    ...db,
    assignedTo: db.assigned_to,
    assignmentDate: db.assignment_date,
    followUpDate: db.follow_up_date,
    createdAt: db.created_at
  };
}

export function mapLeadToDb(lead: Partial<Lead>): any {
  return {
    ...(lead.id && { id: lead.id }),
    ...(lead.ref && { ref: lead.ref }),
    ...(lead.name && { name: lead.name }),
    ...(lead.phone && { phone: lead.phone }),
    ...(lead.whatsapp && { whatsapp: lead.whatsapp }),
    ...(lead.source && { source: lead.source }),
    ...(lead.interest && { interest: lead.interest }),
    ...(lead.budget && { budget: lead.budget }),
    ...(lead.location && { location: lead.location }),
    ...(lead.notes && { notes: lead.notes }),
    ...(lead.score !== undefined && { score: lead.score }),
    ...(lead.temperature && { temperature: lead.temperature }),
    ...(lead.status && { status: lead.status }),
    ...(lead.assignedTo && { assigned_to: lead.assignedTo }),
    ...(lead.assignmentDate && { assignment_date: lead.assignmentDate }),
    ...(lead.followUpDate && { follow_up_date: lead.followUpDate })
  };
}

export function mapDbToCustomer(db: any): Customer {
  return {
    ...db,
    fullName: db.full_name,
    nextOfKinName: db.nok_name,
    nextOfKinPhone: db.nok_phone,
    nextOfKinRelationship: db.nok_relation,
    registrationDate: db.created_at, // Mapping created_at to registrationDate for types parity
    createdAt: db.created_at
  };
}

export function mapCustomerToDb(cust: Partial<Customer>): any {
  return {
    ...(cust.id && { id: cust.id }),
    ...(cust.ref && { ref: cust.ref }),
    ...(cust.fullName && { full_name: cust.fullName }),
    ...(cust.email && { email: cust.email }),
    ...(cust.phone && { phone: cust.phone }),
    ...(cust.address && { address: cust.address }),
    ...(cust.occupation && { occupation: cust.occupation }),
    ...(cust.nextOfKinName && { nok_name: cust.nextOfKinName }),
    ...(cust.nextOfKinPhone && { nok_phone: cust.nextOfKinPhone }),
    ...(cust.nextOfKinRelationship && { nok_relation: cust.nextOfKinRelationship }),
    ...(cust.status && { status: cust.status })
  };
}

export function mapDbToEasyBuyAccount(db: any): EasyBuyAccount {
  return {
    ...db,
    customerId: db.customer_id,
    propertyId: db.property_id,
    projectId: db.project_id, // If project_id exists in your future migrations, otherwise ignore
    totalPropertyPrice: Number(db.total_amount),
    initialDeposit: Number(db.initial_deposit),
    monthlyInstallment: Number(db.monthly_installment),
    durationMonths: db.duration_months,
    startDate: db.start_date,
    endDate: db.end_date,
    outstandingBalance: Number(db.outstanding_balance),
    createdAt: db.created_at
  };
}

export function mapEasyBuyAccountToDb(acc: Partial<EasyBuyAccount>): any {
  return {
    ...(acc.id && { id: acc.id }),
    ...(acc.ref && { ref: acc.ref }),
    ...(acc.customerId && { customer_id: acc.customerId }),
    ...(acc.propertyId && { property_id: acc.propertyId }),
    ...(acc.totalPropertyPrice !== undefined && { total_amount: acc.totalPropertyPrice }),
    ...(acc.initialDeposit !== undefined && { initial_deposit: acc.initialDeposit }),
    ...(acc.monthlyInstallment !== undefined && { monthly_installment: acc.monthlyInstallment }),
    ...(acc.durationMonths !== undefined && { duration_months: acc.durationMonths }),
    ...(acc.startDate && { start_date: acc.startDate }),
    ...(acc.endDate && { end_date: acc.endDate }),
    ...(acc.outstandingBalance !== undefined && { outstanding_balance: acc.outstandingBalance }),
    ...(acc.status && { status: acc.status })
  };
}

export function mapDbToInstallment(db: any): Installment {
  return {
    ...db,
    accountId: db.account_id,
    installmentNumber: db.month_number,
    dueDate: db.due_date,
    amountDue: Number(db.amount),
    amountPaid: db.status === 'Paid' ? Number(db.amount) : 0, // Fallback since paid_date exists but amount_paid might not be distinct in DB
    paymentDate: db.paid_date
  };
}

export function mapInstallmentToDb(inst: Partial<Installment>): any {
  return {
    ...(inst.id && { id: inst.id }),
    ...(inst.accountId && { account_id: inst.accountId }),
    ...(inst.installmentNumber !== undefined && { month_number: inst.installmentNumber }),
    ...(inst.amountDue !== undefined && { amount: inst.amountDue }),
    ...(inst.dueDate && { due_date: inst.dueDate }),
    ...(inst.status && { status: inst.status }),
    ...(inst.paymentDate && { paid_date: inst.paymentDate })
  };
}

export function mapDbToApplication(db: any): any {
  return {
    ...db,
    customerId: db.customer_id,
    propertyId: db.property_id,
    documentsVerified: db.documents_verified,
    submittedBy: db.submitted_by,
    reviewedBy: db.reviewed_by,
    approvedBy: db.approved_by,
    createdAt: db.created_at
  };
}

export function mapApplicationToDb(app: any): any {
  return {
    ...(app.id && { id: app.id }),
    ...(app.ref && { ref: app.ref }),
    ...(app.customerId && { customer_id: app.customerId }),
    ...(app.propertyId && { property_id: app.propertyId }),
    ...(app.status && { status: app.status }),
    ...(app.documentsVerified !== undefined && { documents_verified: app.documentsVerified }),
    ...(app.submittedBy && { submitted_by: app.submittedBy }),
    ...(app.reviewedBy && { reviewed_by: app.reviewedBy }),
    ...(app.approvedBy && { approved_by: app.approvedBy })
  };
}

export function mapDbToPaymentProof(db: any): PaymentProof {
  return {
    ...db,
    customerId: db.customer_id,
    accountId: db.account_id,
    paymentDate: db.payment_date,
    referenceNumber: db.reference_number,
    proofImageUrl: db.proof_image_url,
    appliedTo: db.applied_to,
    createdAt: db.created_at
  };
}

export function mapPaymentProofToDb(proof: Partial<PaymentProof>): any {
  return {
    ...(proof.id && { id: proof.id }),
    ...(proof.customerId && { customer_id: proof.customerId }),
    ...(proof.accountId && { account_id: proof.accountId }),
    ...(proof.amount !== undefined && { amount: proof.amount }),
    ...(proof.paymentDate && { payment_date: proof.paymentDate }),
    ...(proof.referenceNumber && { reference_number: proof.referenceNumber }),
    ...(proof.proofImageUrl && { proof_image_url: proof.proofImageUrl }),
    ...(proof.appliedTo && { applied_to: proof.appliedTo }),
    ...(proof.notes && { notes: proof.notes }),
    ...(proof.status && { status: proof.status })
  };
}

export function mapDbToLedgerTransaction(db: any): LedgerTransaction {
  return {
    ...db,
    customerId: db.customer_id,
    referenceId: db.reference_id,
    verifiedBy: db.verified_by,
    createdAt: db.created_at
  };
}

export function mapLedgerTransactionToDb(tx: Partial<LedgerTransaction>): any {
  return {
    ...(tx.id && { id: tx.id }),
    ...(tx.date && { date: tx.date }),
    ...(tx.amount !== undefined && { amount: tx.amount }),
    ...(tx.type && { type: tx.type }),
    ...(tx.description && { description: tx.description }),
    ...(tx.customerId && { customer_id: tx.customerId }),
    ...(tx.referenceId && { reference_id: tx.referenceId }),
    ...(tx.verifiedBy && { verified_by: tx.verifiedBy })
  };
}

export function mapDbToReceipt(db: any): Receipt {
  return {
    ...db,
    receiptNumber: db.receipt_number,
    customerId: db.customer_id,
    paymentProofId: db.payment_proof_id,
    issuedBy: db.issued_by,
    createdAt: db.created_at
  };
}

export function mapReceiptToDb(receipt: Partial<Receipt>): any {
  return {
    ...(receipt.id && { id: receipt.id }),
    ...(receipt.receiptNumber && { receipt_number: receipt.receiptNumber }),
    ...(receipt.customerId && { customer_id: receipt.customerId }),
    ...(receipt.amount !== undefined && { amount: receipt.amount }),
    ...(receipt.paymentProofId && { payment_proof_id: receipt.paymentProofId }),
    ...(receipt.issuedBy && { issued_by: receipt.issuedBy }),
    ...(receipt.status && { status: receipt.status })
  };
}

export function mapDbToAllocation(db: any): Allocation {
  return {
    ...db,
    customerId: db.customer_id,
    projectId: db.project_id,
    blockNumber: db.block_number,
    plotNumber: db.plot_number,
    allocationDate: db.allocation_date,
    createdAt: db.created_at
  };
}

export function mapAllocationToDb(alloc: Partial<Allocation>): any {
  return {
    ...(alloc.id && { id: alloc.id }),
    ...(alloc.customerId && { customer_id: alloc.customerId }),
    ...(alloc.projectId && { project_id: alloc.projectId }),
    ...(alloc.blockNumber && { block_number: alloc.blockNumber }),
    ...(alloc.plotNumber && { plot_number: alloc.plotNumber }),
    ...(alloc.allocationDate && { allocation_date: alloc.allocationDate }),
    ...(alloc.status && { status: alloc.status })
  };
}

export function mapDbToInspection(db: any): InspectionBooking {
  return {
    ...db,
    customerName: db.customer_name,
    propertyId: db.property_id,
    propertyRef: db.property_ref,
    createdAt: db.created_at
  };
}

export function mapInspectionToDb(insp: Partial<InspectionBooking>): any {
  return {
    ...(insp.id && { id: insp.id }),
    ...(insp.ref && { ref: insp.ref }),
    ...(insp.customerName && { customer_name: insp.customerName }),
    ...(insp.phone && { phone: insp.phone }),
    ...(insp.propertyId && { property_id: insp.propertyId }),
    ...(insp.propertyRef && { property_ref: insp.propertyRef }),
    ...(insp.date && { date: insp.date }),
    ...(insp.time && { time: insp.time }),
    ...(insp.status && { status: insp.status })
  };
}

export function mapDbToReservation(db: any): Reservation {
  return {
    ...db,
    customerId: db.customer_id,
    customerName: db.customer_name,
    propertyId: db.property_id,
    propertyRef: db.property_ref,
    projectId: db.project_id,
    plotNumber: db.plot_number,
    allocationStatus: db.allocation_status,
    reservationAmount: Number(db.reservation_amount),
    paymentGateway: db.payment_gateway,
    paymentReference: db.payment_reference,
    paymentStatus: db.payment_status,
    expirationDate: db.expiration_date,
    createdAt: db.created_at
  };
}

export function mapReservationToDb(res: Partial<Reservation>): any {
  return {
    ...(res.id && { id: res.id }),
    ...(res.ref && { ref: res.ref }),
    ...(res.customerId && { customer_id: res.customerId }),
    ...(res.customerName && { customer_name: res.customerName }),
    ...(res.propertyId && { property_id: res.propertyId }),
    ...(res.propertyRef && { property_ref: res.propertyRef }),
    ...(res.projectId && { project_id: res.projectId }),
    ...(res.plotNumber && { plot_number: res.plotNumber }),
    ...(res.allocationStatus && { allocation_status: res.allocationStatus }),
    ...(res.reservationAmount !== undefined && { reservation_amount: res.reservationAmount }),
    ...(res.paymentGateway && { payment_gateway: res.paymentGateway }),
    ...(res.paymentReference && { payment_reference: res.paymentReference }),
    ...(res.paymentStatus && { payment_status: res.paymentStatus }),
    ...(res.date && { date: res.date }),
    ...(res.expirationDate && { expiration_date: res.expirationDate }),
    ...(res.status && { status: res.status })
  };
}

export function mapDbToCustomerCareTicket(db: any): CustomerCareTicket {
  return {
    ...db,
    customerId: db.customer_id,
    assignedTo: db.assigned_to,
    createdAt: db.created_at
  };
}

export function mapCustomerCareTicketToDb(ticket: Partial<CustomerCareTicket>): any {
  return {
    ...(ticket.id && { id: ticket.id }),
    ...(ticket.ref && { ref: ticket.ref }),
    ...(ticket.customerId && { customer_id: ticket.customerId }),
    ...(ticket.type && { type: ticket.type }),
    ...(ticket.subject && { subject: ticket.subject }),
    ...(ticket.description && { description: ticket.description }),
    ...(ticket.priority && { priority: ticket.priority }),
    ...(ticket.status && { status: ticket.status }),
    ...(ticket.assignedTo && { assigned_to: ticket.assignedTo })
  };
}

export function mapDbToCampaign(db: any): any {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    projectId: db.project_id,
    description: db.description,
    featuredImage: db.featured_image,
    fbAdReference: db.fb_ad_reference,
    status: db.status,
    startDate: db.start_date,
    endDate: db.end_date,
    whatsappNumber: db.whatsapp_number,
    supportedLanguages: db.supported_languages,
    defaultLanguage: db.default_language,
    greetingEnabled: db.greeting_enabled,
    greetingConfig: db.greeting_config,
    preApplicationEnabled: db.pre_application_enabled,
    applicationFormTemplateId: db.application_form_template_id,
    preApplicationPrompt: db.pre_application_prompt,
    whatsappMessageTemplate: db.whatsapp_message_template,
    createdAt: db.created_at,
    clicks: db.campaign_analytics?.[0]?.count ?? 0,
    leadsGenerated: db.lead_submissions?.[0]?.count ?? 0
  };
}

export function mapCampaignToDb(camp: any): any {
  return {
    ...(camp.id && { id: camp.id }),
    ...(camp.name && { name: camp.name }),
    ...(camp.slug && { slug: camp.slug }),
    ...(camp.projectId && { project_id: camp.projectId }),
    ...(camp.description && { description: camp.description }),
    ...(camp.featuredImage && { featured_image: camp.featuredImage }),
    ...(camp.fbAdReference && { fb_ad_reference: camp.fbAdReference }),
    ...(camp.status && { status: camp.status }),
    ...(camp.startDate && { start_date: camp.startDate }),
    ...(camp.endDate && { end_date: camp.endDate }),
    ...(camp.whatsappNumber && { whatsapp_number: camp.whatsappNumber }),
    ...(camp.supportedLanguages && { supported_languages: camp.supportedLanguages }),
    ...(camp.defaultLanguage && { default_language: camp.defaultLanguage }),
    ...(camp.greetingEnabled !== undefined && { greeting_enabled: camp.greetingEnabled }),
    ...(camp.greetingConfig && { greeting_config: camp.greetingConfig }),
    ...(camp.preApplicationEnabled !== undefined && { pre_application_enabled: camp.preApplicationEnabled }),
    ...(camp.applicationFormTemplateId !== undefined && { application_form_template_id: camp.applicationFormTemplateId || null }),
    ...(camp.preApplicationPrompt !== undefined && { pre_application_prompt: camp.preApplicationPrompt }),
    ...(camp.whatsappMessageTemplate !== undefined && { whatsapp_message_template: camp.whatsappMessageTemplate })
  };
}

export function mapDbToCampaignQuestion(db: any): any {
  return {
    id: db.id,
    campaignId: db.campaign_id,
    type: db.type,
    questionText: db.question_text,
    options: db.options,
    orderIndex: db.order_index,
    isRequired: db.is_required,
    questionKey: db.question_key,
    parentQuestionId: db.parent_question_id,
    showIfOption: db.show_if_option,
    createdAt: db.created_at
  };
}

export function mapCampaignQuestionToDb(q: any): any {
  return {
    ...(q.id && { id: q.id }),
    ...(q.campaignId && { campaign_id: q.campaignId }),
    ...(q.type && { type: q.type }),
    ...(q.questionText && { question_text: q.questionText }),
    ...(q.options && { options: q.options }),
    ...(q.orderIndex !== undefined && { order_index: q.orderIndex }),
    ...(q.isRequired !== undefined && { is_required: q.isRequired }),
    ...(q.questionKey !== undefined && { question_key: q.questionKey }),
    ...(q.parentQuestionId !== undefined && { parent_question_id: q.parentQuestionId || null }),
    ...(q.showIfOption !== undefined && { show_if_option: q.showIfOption })
  };
}

export function mapDbToApplicationFormTemplate(db: Record<string, unknown>): ApplicationFormTemplate {
  return {
    id: db.id as string,
    name: db.name as string,
    description: db.description as string | undefined,
    fields: (db.fields as ApplicationFormTemplate['fields']) ?? [],
    status: db.status as ApplicationFormTemplate['status'],
    createdBy: db.created_by as string | undefined,
    createdAt: db.created_at as string
  };
}

export function mapApplicationFormTemplateToDb(t: Partial<ApplicationFormTemplate>): Record<string, unknown> {
  return {
    ...(t.id && { id: t.id }),
    ...(t.name && { name: t.name }),
    ...(t.description !== undefined && { description: t.description }),
    ...(t.fields && { fields: t.fields }),
    ...(t.status && { status: t.status }),
    ...(t.createdBy && { created_by: t.createdBy })
  };
}

export function mapDbToCampaignAiDraft(db: Record<string, unknown>): CampaignAiDraft {
  return {
    id: db.id as string,
    campaignId: db.campaign_id as string | undefined,
    promptText: db.prompt_text as string,
    generatedConfig: db.generated_config as Record<string, unknown>,
    status: db.status as CampaignAiDraft['status'],
    createdBy: db.created_by as string | undefined,
    reviewedBy: db.reviewed_by as string | undefined,
    reviewedAt: db.reviewed_at as string | undefined,
    createdAt: db.created_at as string
  };
}

export function mapCampaignAiDraftToDb(d: Partial<CampaignAiDraft>): Record<string, unknown> {
  return {
    ...(d.id && { id: d.id }),
    ...(d.campaignId !== undefined && { campaign_id: d.campaignId || null }),
    ...(d.promptText && { prompt_text: d.promptText }),
    ...(d.generatedConfig && { generated_config: d.generatedConfig }),
    ...(d.status && { status: d.status }),
    ...(d.createdBy && { created_by: d.createdBy }),
    ...(d.reviewedBy !== undefined && { reviewed_by: d.reviewedBy || null }),
    ...(d.reviewedAt !== undefined && { reviewed_at: d.reviewedAt })
  };
}

export function mapDbToCampaignFaq(db: any): any {
  return {
    id: db.id,
    campaignId: db.campaign_id,
    question: db.question,
    answer: db.answer,
    orderIndex: db.order_index,
    createdAt: db.created_at
  };
}

export function mapCampaignFaqToDb(faq: any): any {
  return {
    ...(faq.id && { id: faq.id }),
    ...(faq.campaignId && { campaign_id: faq.campaignId }),
    ...(faq.question && { question: faq.question }),
    ...(faq.answer && { answer: faq.answer }),
    ...(faq.orderIndex !== undefined && { order_index: faq.orderIndex })
  };
}

export function mapDbToCampaignMedia(db: Record<string, unknown>): CampaignMedia {
  return {
    id: db.id as string,
    campaignId: db.campaign_id as string,
    fileUrl: db.file_url as string,
    type: db.type as string,
    title: db.title as string | undefined,
    createdAt: db.created_at as string
  };
}

export function mapCampaignMediaToDb(m: Partial<CampaignMedia>): Record<string, unknown> {
  return {
    ...(m.id && { id: m.id }),
    ...(m.campaignId && { campaign_id: m.campaignId }),
    ...(m.fileUrl && { file_url: m.fileUrl }),
    ...(m.type && { type: m.type }),
    ...(m.title !== undefined && { title: m.title })
  };
}

export function mapDbToNotification(db: any): Notification {
  return {
    ...db,
    userId: db.user_id,
    isRead: db.is_read,
    createdAt: db.created_at
  };
}

export function mapNotificationToDb(notification: Partial<Notification>): any {
  return {
    ...(notification.id && { id: notification.id }),
    ...(notification.title && { title: notification.title }),
    ...(notification.message && { message: notification.message }),
    ...(notification.userId && { user_id: notification.userId }),
    ...(notification.type && { type: notification.type }),
    ...(notification.isRead !== undefined && { is_read: notification.isRead })
  };
}

export function mapDbToActivityLog(db: any): ActivityLog {
  const dateObj = new Date(db.created_at || new Date());
  return {
    id: db.id,
    user: db.profiles?.full_name || 'System',
    module: db.module,
    action: db.action,
    date: dateObj.toLocaleDateString(),
    time: dateObj.toLocaleTimeString(),
    createdAt: db.created_at
  };
}

export function mapActivityLogToDb(log: Partial<ActivityLog>): any {
  return {
    ...(log.id && { id: log.id }),
    module: log.module || 'System',
    action: log.action || 'Unknown Action'
  };
}

export function mapDbToWebsiteEnquiry(db: any): any {
  return {
    id: db.id, name: db.name, email: db.email, phone: db.phone,
    subject: db.subject, message: db.message, status: db.status, createdAt: db.created_at
  };
}
export function mapWebsiteEnquiryToDb(data: any): any {
  return {
    ...(data.id && { id: data.id }), ...(data.name && { name: data.name }),
    ...(data.email && { email: data.email }), ...(data.phone && { phone: data.phone }),
    ...(data.subject && { subject: data.subject }), ...(data.message && { message: data.message }),
    ...(data.status && { status: data.status })
  };
}

export function mapDbToAnnouncement(db: any): any {
  return {
    id: db.id, title: db.title, message: db.message, startDate: db.start_date,
    endDate: db.end_date, activeStatus: db.active_status, priority: db.priority, createdAt: db.created_at
  };
}
export function mapAnnouncementToDb(data: any): any {
  return {
    ...(data.id && { id: data.id }), ...(data.title && { title: data.title }),
    ...(data.message && { message: data.message }), ...(data.startDate && { start_date: data.startDate }),
    ...(data.endDate && { end_date: data.endDate }), ...(data.activeStatus !== undefined && { active_status: data.activeStatus }),
    ...(data.priority && { priority: data.priority })
  };
}

export function mapDbToTestimonial(db: any): any {
  return {
    id: db.id, customerName: db.customer_name, content: db.content, rating: db.rating,
    videoUrl: db.video_url, status: db.status, createdAt: db.created_at
  };
}
export function mapTestimonialToDb(data: any): any {
  return {
    ...(data.id && { id: data.id }), ...(data.customerName && { customer_name: data.customerName }),
    ...(data.content && { content: data.content }), ...(data.rating !== undefined && { rating: data.rating }),
    ...(data.videoUrl !== undefined && { video_url: data.videoUrl }), ...(data.status && { status: data.status })
  };
}

export function mapDbToOfficeInfo(db: any): any {
  return {
    id: db.id, address: db.address, phone1: db.phone1, phone2: db.phone2,
    whatsapp: db.whatsapp, email1: db.email1, email2: db.email2, mapsLink: db.maps_link,
    businessHours: db.business_hours, updatedAt: db.updated_at
  };
}
export function mapOfficeInfoToDb(data: any): any {
  return {
    ...(data.id && { id: data.id }), ...(data.address && { address: data.address }),
    ...(data.phone1 && { phone1: data.phone1 }), ...(data.phone2 && { phone2: data.phone2 }),
    ...(data.whatsapp && { whatsapp: data.whatsapp }), ...(data.email1 && { email1: data.email1 }),
    ...(data.email2 && { email2: data.email2 }), ...(data.mapsLink && { maps_link: data.mapsLink }),
    ...(data.businessHours && { business_hours: data.businessHours })
  };
}

export function mapDbToTask(db: any): any {
  return {
    id: db.id, title: db.title, category: db.category, status: db.status,
    dueDate: db.due_date, relatedRecordId: db.related_record_id, notes: db.notes,
    assignedTo: db.assigned_to, createdBy: db.created_by, createdAt: db.created_at
  };
}
export function mapTaskToDb(data: any): any {
  return {
    ...(data.id && { id: data.id }), ...(data.title && { title: data.title }),
    ...(data.category && { category: data.category }), ...(data.status && { status: data.status }),
    ...(data.dueDate && { due_date: data.dueDate }), ...(data.relatedRecordId && { related_record_id: data.relatedRecordId }),
    ...(data.notes && { notes: data.notes }), ...(data.assignedTo && { assigned_to: data.assignedTo }),
    ...(data.createdBy && { created_by: data.createdBy })
  };
}

export function mapDbToSearchAnalytics(db: any): any {
  return { id: db.id, type: db.type, target: db.target, timestamp: db.timestamp };
}
export function mapSearchAnalyticsToDb(data: any): any {
  return {
    ...(data.id && { id: data.id }), ...(data.type && { type: data.type }), ...(data.target && { target: data.target })
  };
}
