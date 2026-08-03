import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify the user is authenticated and is a Super Admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const body = await request.json();

    // Build the DB payload from the request body
    const mapped: Record<string, any> = {};
    if (body.id) mapped.id = body.id;
    if (body.address !== undefined) mapped.address = body.address;
    if (body.phone1 !== undefined) mapped.phone1 = body.phone1;
    if (body.phone2 !== undefined) mapped.phone2 = body.phone2;
    if (body.whatsapp !== undefined) mapped.whatsapp = body.whatsapp;
    if (body.email1 !== undefined) mapped.email1 = body.email1;
    if (body.email2 !== undefined) mapped.email2 = body.email2;
    if (body.mapsLink !== undefined) mapped.maps_link = body.mapsLink;
    if (body.businessHours !== undefined) mapped.business_hours = body.businessHours;

    const { data, error } = await supabase
      .from('office_info')
      .upsert(mapped, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Office info upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB response back to frontend shape
    const result = {
      id: data.id,
      address: data.address,
      phone1: data.phone1,
      phone2: data.phone2,
      whatsapp: data.whatsapp,
      email1: data.email1,
      email2: data.email2,
      mapsLink: data.maps_link,
      businessHours: data.business_hours,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('Unexpected error in office-info route:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
