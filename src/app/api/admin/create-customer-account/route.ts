import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables (URL or Service Role Key)');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "Temp-";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

import { api } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { email, fullName, phone, formData } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required for portal account.' }, { status: 400 });
    }

    const tempPassword = generatePassword(8);

    // Create user in Supabase Auth
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
        phone: phone || ''
      }
    });

    if (error) {
      console.error('Failed to create auth user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (formData) {
      // 2. Save Customer Record
      const fullAddress = formData.idSerial ? `[ID: ${formData.idSerial}] ${formData.address}` : formData.address;
      const newCustomer = await api.saveCustomer({
        userId: data.user.id,
        fullName: formData.fullName,
        email: email,
        phone: formData.phone,
        address: fullAddress,
        status: 'Active',
        nextOfKinName: formData.nokName,
        nextOfKinPhone: formData.nokPhone,
        nextOfKinRelationship: formData.nokRelation
      }, supabaseAdmin);

      // 3. Auto-generate application
      await api.saveApplication({
        customerId: newCustomer.id,
        status: 'Chairman Approved',
        documentsVerified: true
      }, supabaseAdmin);

      // 4. Create Easy Buy Account
      const monthlyInst = formData.monthlyInst || 0; // Passed from client
      const endDate = new Date(formData.installmentStartDate);
      endDate.setMonth(endDate.getMonth() + formData.installmentPeriod);
      
      const ebAccount = await api.saveEasyBuyAccount({
        customerId: newCustomer.id,
        projectId: formData.projectId,
        totalPropertyPrice: formData.totalAmount,
        initialDeposit: formData.initialDeposit,
        monthlyInstallment: monthlyInst,
        durationMonths: formData.installmentPeriod,
        startDate: formData.installmentStartDate,
        endDate: endDate.toISOString().split('T')[0],
        outstandingBalance: formData.totalAmount - formData.initialDeposit,
        status: 'Active'
      }, supabaseAdmin);

      // 5. Generate Installment Schedule Records
      let currentDate = new Date(formData.installmentStartDate);
      let remainingBalance = formData.totalAmount - formData.initialDeposit;
      
      for (let i = 1; i <= formData.installmentPeriod; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        const currentInstAmount = (i === formData.installmentPeriod) ? remainingBalance : monthlyInst;

        await api.saveInstallment({
          accountId: ebAccount.id,
          installmentNumber: i,
          amountDue: currentInstAmount,
          dueDate: currentDate.toISOString().split('T')[0],
          status: 'Pending'
        }, supabaseAdmin);

        remainingBalance -= currentInstAmount;
      }
      
      // 6. Allocation Prep (if Plot Number provided)
      if (formData.plotNumber) {
        await api.saveAllocation({
          customerId: newCustomer.id,
          projectId: formData.projectId,
          blockNumber: 'TBD',
          plotNumber: formData.plotNumber,
          status: 'Pending Allocation'
        }, supabaseAdmin);
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      tempPassword: tempPassword,
      username: email
    });
  } catch (error: any) {
    console.error('Error creating customer account:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', stack: error.stack }, { status: 500 });
  }
}
