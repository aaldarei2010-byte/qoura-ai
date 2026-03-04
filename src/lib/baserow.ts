import { Lead, LeadFormData, LeadStatus } from '@/types';

const BASEROW_BASE_URL = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const BASEROW_API_TOKEN = process.env.BASEROW_API_TOKEN || '';
const BASEROW_TABLE_ID = process.env.BASEROW_TABLE_ID || '';

interface BaserowLeadRow {
  id: number;
  order: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  audience_type: string;
  interest: string;
  message: string;
  status: string;
  notes: string;
  created_at: string;
}

interface BaserowListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BaserowLeadRow[];
}

async function baserowFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASEROW_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${BASEROW_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Baserow API error: ${response.status} - ${error}`);
  }

  return response.json();
}

function mapBaserowRowToLead(row: BaserowLeadRow): Lead {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    organization: row.organization,
    audience_type: row.audience_type as Lead['audience_type'],
    interest: row.interest as Lead['interest'],
    message: row.message,
    status: (row.status || 'new') as LeadStatus,
    notes: row.notes || '',
    created_at: '',
  };
}

export async function createLead(data: LeadFormData): Promise<Lead> {
  const payload = {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    audience_type: data.audience_type,
    interest: data.interest,
    message: data.message,
    status: 'new',
    notes: '',
  };

  const result = await baserowFetch<BaserowLeadRow>(
    `/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return mapBaserowRowToLead(result);
}

export async function listLeads(params?: {
  search?: string;
  status?: LeadStatus;
  page?: number;
  size?: number;
}): Promise<{ leads: Lead[]; count: number }> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.set('page', params.page.toString());
  }

  if (params?.size) {
    queryParams.set('size', params.size.toString());
  }

  // Build filter for status if provided
  if (params?.status) {
    queryParams.set('filter__status__equal', params.status);
  }

  // Build search filter if provided
  if (params?.search) {
    queryParams.set('search', params.search);
  }

  queryParams.set('user_field_names', 'true');
  const queryString = queryParams.toString();
  const endpoint = `/api/database/rows/table/${BASEROW_TABLE_ID}/?${queryString}`;

  const result = await baserowFetch<BaserowListResponse>(endpoint);

  return {
    leads: result.results.map(mapBaserowRowToLead),
    count: result.count,
  };
}

export async function updateLeadStatus(
  leadId: number,
  status: LeadStatus,
  notes?: string
): Promise<Lead> {
  const payload: Record<string, string> = { status };

  if (notes !== undefined) {
    payload.notes = notes;
  }

  const result = await baserowFetch<BaserowLeadRow>(
    `/api/database/rows/table/${BASEROW_TABLE_ID}/${leadId}/?user_field_names=true`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );

  return mapBaserowRowToLead(result);
}

export async function getLead(leadId: number): Promise<Lead> {
  const result = await baserowFetch<BaserowLeadRow>(
    `/api/database/rows/table/${BASEROW_TABLE_ID}/${leadId}/?user_field_names=true`
  );

  return mapBaserowRowToLead(result);
}
