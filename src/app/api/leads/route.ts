import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createLead } from '@/lib/baserow';
import { localCreateLead } from '@/lib/local-store';
import { LeadFormData } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email notification
    if (process.env.RESEND_API_KEY) {
      try {
        const emailResult = await resend.emails.send({
          from: 'Qoura AI <onboarding@resend.dev>',
          to: process.env.NOTIFICATION_EMAIL || 'a.aldarei2010@gmail.com',
          subject: `New Inquiry from ${leadData.full_name} - ${leadData.organization}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:12px;">
              <div style="background:#000;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">Qoura AI - New Inquiry</h1>
              </div>
              <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#FF7A00;margin-top:0;">Customer Details</h2>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:bold;">${leadData.full_name}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${leadData.email}">${leadData.email}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;"><a href="tel:${leadData.phone}">${leadData.phone}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Organization</td><td style="padding:8px 0;font-weight:bold;">${leadData.organization}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Type</td><td style="padding:8px 0;">${leadData.audience_type}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Interest</td><td style="padding:8px 0;">${leadData.interest}</td></tr>
                </table>
                <div style="margin-top:16px;padding:16px;background:#f5f5f5;border-radius:8px;">
                  <strong style="color:#666;">Message:</strong>
                  <p style="margin:8px 0 0;color:#333;">${leadData.message}</p>
                </div>
                <div style="margin-top:20px;text-align:center;">
                  <a href="https://qoura.ai/admin" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View in Dashboard</a>
                </div>
              </div>
            </div>
          `,
        });
        console.log('[Email] Notification sent:', emailResult);
      } catch (emailErr) {
        console.error('[Email] Failed to send notification:', emailErr);
      }
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
