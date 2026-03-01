'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  qualified: 'bg-purple-100 text-purple-700 border-purple-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminPage() {
  const { dict, lang } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const auth = sessionStorage.getItem('admin_auth');
      if (!auth) return;

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        setCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId: number, newStatus: LeadStatus) => {
    setSavingId(leadId);
    try {
      const auth = sessionStorage.getItem('admin_auth');
      if (!auth) return;

      const lead = leads.find((l) => l.id === leadId);
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          id: leadId,
          status: newStatus,
          notes: lead?.notes || '',
        }),
      });

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNotes = async (leadId: number) => {
    setSavingId(leadId);
    try {
      const auth = sessionStorage.getItem('admin_auth');
      if (!auth) return;

      const lead = leads.find((l) => l.id === leadId);
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          id: leadId,
          status: lead?.status || 'new',
          notes: notesValue,
        }),
      });

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, notes: notesValue } : lead
          )
        );
        setEditingNotes(null);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSavingId(null);
    }
  };

  const startEditingNotes = (lead: Lead) => {
    setEditingNotes(lead.id || null);
    setNotesValue(lead.notes || '');
  };

  const statusOptions = [
    { value: '', label: dict.admin.allStatuses },
    { value: 'new', label: dict.admin.status.new },
    { value: 'contacted', label: dict.admin.status.contacted },
    { value: 'qualified', label: dict.admin.status.qualified },
    { value: 'won', label: dict.admin.status.won },
    { value: 'lost', label: dict.admin.status.lost },
  ];

  const allStatusOptions = [
    { value: 'new', label: dict.admin.status.new },
    { value: 'contacted', label: dict.admin.status.contacted },
    { value: 'qualified', label: dict.admin.status.qualified },
    { value: 'won', label: dict.admin.status.won },
    { value: 'lost', label: dict.admin.status.lost },
  ];

  const interestLabels: Record<string, string> = {
    training: dict.contact.interests.training,
    consulting: dict.contact.interests.consulting,
    solutions: dict.contact.interests.solutions,
  };

  const audienceLabels: Record<string, string> = {
    student: dict.contact.audienceTypes.student,
    employee: dict.contact.audienceTypes.employee,
    government: dict.contact.audienceTypes.government,
    private: dict.contact.audienceTypes.private,
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">{dict.admin.title}</h1>
        <p className="text-gray-600">
          {lang === 'ar'
            ? `إجمالي العملاء المحتملين: ${count}`
            : `Total leads: ${count}`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              {dict.admin.search}
            </label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.admin.search}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              {dict.admin.filter}
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
              options={statusOptions}
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchLeads}
            className="h-[46px]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Leads Table/Cards */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          {dict.admin.noLeads}
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300"
            >
              {/* Main Row */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedLead(expandedLead === lead.id ? null : lead.id || null)
                }
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Name & Organization */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">{lead.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Building2 className="w-3 h-3" />
                      <span>{lead.organization}</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1 hover:text-black"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden lg:inline">{lead.email}</span>
                    </a>
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1 hover:text-black"
                      onClick={(e) => e.stopPropagation()}
                      dir="ltr"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="hidden lg:inline">{lead.phone}</span>
                    </a>
                  </div>

                  {/* Interest */}
                  <div className="hidden md:block">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {interestLabels[lead.interest] || lead.interest}
                    </span>
                  </div>

                  {/* Status */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead.id!, e.target.value as LeadStatus)
                      }
                      disabled={savingId === lead.id}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer
                                ${statusColors[lead.status]}
                                ${savingId === lead.id ? 'opacity-50' : ''}`}
                    >
                      {allStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(lead.created_at, lang)}</span>
                  </div>

                  {/* Expand Icon */}
                  <div>
                    {expandedLead === lead.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLead === lead.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Message */}
                    <div>
                      <h4 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {lang === 'ar' ? 'الرسالة' : 'Message'}
                      </h4>
                      <p className="text-gray-600 bg-white p-3 rounded-lg text-sm leading-relaxed">
                        {lead.message}
                      </p>
                      <div className="mt-2 flex gap-2 text-sm">
                        <span className="text-gray-500">
                          {lang === 'ar' ? 'نوع الجهة:' : 'Type:'}
                        </span>
                        <span className="text-black font-medium">
                          {audienceLabels[lead.audience_type] || lead.audience_type}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h4 className="text-sm font-semibold text-black mb-2 flex items-center justify-between">
                        <span>{dict.admin.notes}</span>
                        {editingNotes !== lead.id && (
                          <button
                            onClick={() => startEditingNotes(lead)}
                            className="text-xs text-primary-500 hover:underline"
                          >
                            {lang === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                        )}
                      </h4>
                      {editingNotes === lead.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            rows={4}
                            className="bg-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveNotes(lead.id!)}
                              isLoading={savingId === lead.id}
                            >
                              <Save className="w-4 h-4 ml-1" />
                              {dict.admin.save}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNotes(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 bg-white p-3 rounded-lg text-sm min-h-[100px]">
                          {lead.notes || (lang === 'ar' ? 'لا توجد ملاحظات' : 'No notes')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
