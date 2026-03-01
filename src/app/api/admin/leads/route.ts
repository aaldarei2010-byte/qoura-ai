import { NextRequest, NextResponse } from 'next/server';
import { listLeads, updateLeadStatus } from '@/lib/baserow';
import { localListLeads, localUpdateLeadStatus } from '@/lib/local-store';
import { LeadStatus } from '@/types';

const isBaserowConfigured = () =>
  !!process.env.BASEROW_API_TOKEN && !!process.env.BASEROW_TABLE_ID;

// Simple authentication check
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  // Basic auth: "Basic base64(admin:password)"
  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) return false;

  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  return username === 'admin' && password === adminPassword;
}

export async function GET(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as LeadStatus | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');

    let result;

    if (isBaserowConfigured()) {
      result = await listLeads({
        search,
        status: status || undefined,
        page,
        size,
      });
    } else {
      result = localListLeads({
        search,
        status: status || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      leads: result.leads,
      count: result.count,
      page,
      size,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const validStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      );
    }

    let updatedLead;

    if (isBaserowConfigured()) {
      updatedLead = await updateLeadStatus(id, status, notes);
    } else {
      updatedLead = localUpdateLeadStatus(id, status, notes);
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
