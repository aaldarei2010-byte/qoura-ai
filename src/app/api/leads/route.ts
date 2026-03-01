import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/baserow';
import { localCreateLead } from '@/lib/local-store';
import { LeadFormData } from '@/types';

const isBaserowConfigured = () =>
  !!process.env.BASEROW_API_TOKEN && !!process.env.BASEROW_TABLE_ID;

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+971|00971|0)?[5][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validateLeadData(data: LeadFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.push('Valid UAE phone number is required');
  }

  if (!data.organization || data.organization.trim().length < 2) {
    errors.push('Organization name is required');
  }

  const validAudienceTypes = ['student', 'employee', 'government', 'private'];
  if (!data.audience_type || !validAudienceTypes.includes(data.audience_type)) {
    errors.push('Valid audience type is required');
  }

  const validInterests = ['training', 'consulting', 'solutions'];
  if (!data.interest || !validInterests.includes(data.interest)) {
    errors.push('Valid interest type is required');
  }

  if (!data.message || data.message.trim().length < 3) {
    errors.push('Message is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const leadData: LeadFormData = {
      full_name: body.full_name?.trim() || '',
      email: body.email?.trim().toLowerCase() || '',
      phone: body.phone?.trim() || '',
      organization: body.organization?.trim() || '',
      audience_type: body.audience_type || '',
      interest: body.interest || '',
      message: body.message?.trim() || '',
    };

    // Validate the data
    const validation = validateLeadData(leadData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    let lead;

    if (isBaserowConfigured()) {
      lead = await createLead(leadData);
    } else {
      // Fallback: save locally when Baserow is not configured
      console.log('[Leads] Baserow not configured — saving locally');
      lead = localCreateLead(leadData);
    }

    return NextResponse.json(
      { success: true, lead },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
