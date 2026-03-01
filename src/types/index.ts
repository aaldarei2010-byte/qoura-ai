// Language types
export type Language = 'ar' | 'en';

// Lead types
export type AudienceType = 'student' | 'employee' | 'government' | 'private';
export type InterestType = 'training' | 'consulting' | 'solutions';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Lead {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  audience_type: AudienceType;
  interest: InterestType;
  message: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
}

export interface LeadFormData {
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  audience_type: AudienceType;
  interest: InterestType;
  message: string;
}

// Baserow types
export interface BaserowRow {
  id: number;
  order: string;
  [key: string]: unknown;
}

export interface BaserowListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BaserowRow[];
}

// Dictionary types
export interface Dictionary {
  nav: {
    home: string;
    programs: string;
    consulting: string;
    success: string;
    contact: string;
    admin: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  stats: {
    title: string;
    trainees: string;
    organizations: string;
    workshops: string;
    satisfaction: string;
  };
  services: {
    title: string;
    subtitle: string;
    training: {
      title: string;
      description: string;
    };
    consulting: {
      title: string;
      description: string;
    };
    solutions: {
      title: string;
      description: string;
    };
  };
  culture: {
    title: string;
    subtitle: string;
    points: string[];
  };
  credibility: {
    title: string;
    subtitle: string;
  };
  cta: {
    workshop: string;
    call: string;
    inquiry: string;
    learnMore: string;
  };
  contact: {
    title: string;
    subtitle: string;
    form: {
      fullName: string;
      email: string;
      phone: string;
      organization: string;
      audienceType: string;
      interest: string;
      message: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
    };
    audienceTypes: {
      student: string;
      employee: string;
      government: string;
      private: string;
    };
    interests: {
      training: string;
      consulting: string;
      solutions: string;
    };
  };
  programs: {
    title: string;
    subtitle: string;
    categories: {
      students: string;
      employees: string;
      leaders: string;
    };
  };
  consultingPage: {
    title: string;
    subtitle: string;
  };
  successPage: {
    title: string;
    subtitle: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    contactUs: string;
    followUs: string;
    rights: string;
  };
  admin: {
    title: string;
    search: string;
    filter: string;
    allStatuses: string;
    noLeads: string;
    status: {
      new: string;
      contacted: string;
      qualified: string;
      won: string;
      lost: string;
    };
    columns: {
      name: string;
      organization: string;
      contact: string;
      interest: string;
      status: string;
      date: string;
      actions: string;
    };
    notes: string;
    save: string;
    saving: string;
    saved: string;
  };
}
