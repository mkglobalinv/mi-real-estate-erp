import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, event, data } = body;

    // We only care about successful payment events
    if (event !== 'payment.success') {
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();

    // 1. Update Ledger
    const { error: ledgerError } = await supabase.from('ledger_transactions').insert({
      date: new Date().toISOString(),
      amount: data.amount,
      type: 'Credit',
      description: `Payment for ${reference}`,
      reference_id: reference
    });

    if (ledgerError) throw ledgerError;

    // 2. Check if this is an Easy Buy Installment payment
    if (data.metadata?.isInstallment) {
      const { accountId, monthNumber } = data.metadata;
      
      // Update Installment status
      await supabase.from('installments')
        .update({ status: 'Paid', paid_date: new Date().toISOString() })
        .eq('account_id', accountId)
        .eq('month_number', monthNumber);

      // Fetch Account and Update Outstanding Balance
      const { data: account } = await supabase.from('easy_buy_accounts').select('outstanding_balance, amount_paid').eq('id', accountId).single();
      if (account) {
        await supabase.from('easy_buy_accounts')
          .update({ 
            outstanding_balance: account.outstanding_balance - data.amount,
            amount_paid: account.amount_paid + data.amount
          })
          .eq('id', accountId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
