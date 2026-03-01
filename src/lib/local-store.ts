import { Lead, LeadFormData, LeadStatus } from '@/types';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLeads(): Lead[] {
  ensureDataDir();
  const data = fs.readFileSync(LEADS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeLeads(leads: Lead[]) {
  ensureDataDir();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

let nextId = 0;

export function localCreateLead(data: LeadFormData): Lead {
  const leads = readLeads();
  nextId = leads.length > 0 ? Math.max(...leads.map((l) => l.id || 0)) + 1 : 1;

  const lead: Lead = {
    id: nextId,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    audience_type: data.audience_type,
    interest: data.interest,
    message: data.message,
    status: 'new',
    notes: '',
    created_at: new Date().toISOString(),
  };

  leads.push(lead);
  writeLeads(leads);
  return lead;
}

export function localListLeads(params?: {
  search?: string;
  status?: LeadStatus;
}): { leads: Lead[]; count: number } {
  let leads = readLeads();

  // Filter by status
  if (params?.status) {
    leads = leads.filter((l) => l.status === params.status);
  }

  // Filter by search
  if (params?.search) {
    const q = params.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.full_name.toLowerCase().includes(q) ||
        l.organization.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { leads, count: leads.length };
}

export function localUpdateLeadStatus(
  leadId: number,
  status: LeadStatus,
  notes?: string
): Lead | null {
  const leads = readLeads();
  const index = leads.findIndex((l) => l.id === leadId);
  if (index === -1) return null;

  leads[index].status = status;
  if (notes !== undefined) {
    leads[index].notes = notes;
  }

  writeLeads(leads);
  return leads[index];
}
