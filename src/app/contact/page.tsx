'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { LeadFormData, AudienceType, InterestType } from '@/types';
import { validateEmail, validatePhone } from '@/lib/utils';

export default function ContactPage() {
  const { dict, lang } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  const [formData, setFormData] = useState<LeadFormData>({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    audience_type: 'government',
    interest: 'training',
    message: '',
  });

  const audienceOptions = [
    { value: 'student', label: dict.contact.audienceTypes.student },
    { value: 'employee', label: dict.contact.audienceTypes.employee },
    { value: 'government', label: dict.contact.audienceTypes.government },
    { value: 'private', label: dict.contact.audienceTypes.private },
  ];

  const interestOptions = [
    { value: 'training', label: dict.contact.interests.training },
    { value: 'consulting', label: dict.contact.interests.consulting },
    { value: 'solutions', label: dict.contact.interests.solutions },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = lang === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = lang === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = lang === 'ar' ? 'رقم هاتف غير صالح' : 'Invalid phone format';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = lang === 'ar' ? 'اسم الجهة مطلوب' : 'Organization is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = lang === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error('API error:', data);
        throw new Error(data?.error || 'Failed to submit');
      }

      setSubmitStatus('success');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        organization: '',
        audience_type: 'government',
        interest: 'training',
        message: '',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: 'info@qoura.ai',
      href: 'mailto:info@qoura.ai',
    },
    {
      icon: Phone,
      label: lang === 'ar' ? 'الهاتف' : 'Phone',
      value: '+971 50 730 0052',
      href: 'tel:+971507300052',
    },
    {
      icon: MapPin,
      label: lang === 'ar' ? 'الموقع' : 'Location',
      value: lang === 'ar' ? 'أبوظبي، الإمارات العربية المتحدة' : 'Abu Dhabi, UAE',
      href: '#',
    },
    {
      icon: Clock,
      label: lang === 'ar' ? 'ساعات العمل' : 'Working Hours',
      value: lang === 'ar' ? 'الإثنين - الجمعة: 9 ص - 6 م' : 'Mon - Fri: 9 AM - 6 PM',
      href: '#',
    },
  ];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div className="network-pattern" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <MessageSquare className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-white/90">
                {lang === 'ar' ? 'نسعد بخدمتكم' : 'Happy to Serve You'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {dict.contact.title}
            </h1>
            <p className="text-lg text-white/80">
              {dict.contact.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <AnimatedSection animation="fade-right">
                <h2 className="text-2xl font-bold text-black mb-8">
                  {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                </h2>

                <div className="space-y-6 mb-12">
                  {contactInfo.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center
                                    group-hover:bg-black group-hover:scale-110 transition-all duration-300">
                        <item.icon className="w-5 h-5 text-black group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-black font-medium group-hover:text-primary-500 transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {lang === 'ar' ? 'تابعنا' : 'Follow Us'}
                  </h3>
                  <div className="flex gap-3">
                    {['LinkedIn', 'Twitter', 'Instagram'].map((social) => (
                      <a
                        key={social}
                        href="#"
                        className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center
                                  hover:bg-black hover:scale-110 transition-all duration-300 group"
                        aria-label={social}
                      >
                        <span className="text-xs font-medium text-black group-hover:text-white transition-colors">
                          {social[0]}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <AnimatedSection animation="fade-left">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {lang === 'ar' ? 'أرسل استفسارك' : 'Send Your Inquiry'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {lang === 'ar'
                      ? 'املأ النموذج التالي وسنتواصل معك خلال 24 ساعة'
                      : 'Fill out the form below and we\'ll contact you within 24 hours'}
                  </p>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-green-700">{dict.contact.form.success}</p>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-fade-in">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700">{dict.contact.form.error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Name and Email */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        id="full_name"
                        name="full_name"
                        label={dict.contact.form.fullName}
                        value={formData.full_name}
                        onChange={handleChange}
                        error={errors.full_name}
                        placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        label={dict.contact.form.email}
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="example@company.com"
                        dir="ltr"
                      />
                    </div>

                    {/* Row 2: Phone and Organization */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        label={dict.contact.form.phone}
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="+971 50 XXX XXXX"
                        dir="ltr"
                      />
                      <Input
                        id="organization"
                        name="organization"
                        label={dict.contact.form.organization}
                        value={formData.organization}
                        onChange={handleChange}
                        error={errors.organization}
                        placeholder={lang === 'ar' ? 'اسم المؤسسة أو الشركة' : 'Company or organization name'}
                      />
                    </div>

                    {/* Row 3: Audience Type and Interest */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Select
                        id="audience_type"
                        name="audience_type"
                        label={dict.contact.form.audienceType}
                        value={formData.audience_type}
                        onChange={handleChange}
                        options={audienceOptions}
                      />
                      <Select
                        id="interest"
                        name="interest"
                        label={dict.contact.form.interest}
                        value={formData.interest}
                        onChange={handleChange}
                        options={interestOptions}
                      />
                    </div>

                    {/* Message */}
                    <Textarea
                      id="message"
                      name="message"
                      label={dict.contact.form.message}
                      value={formData.message}
                      onChange={handleChange}
                      error={errors.message}
                      rows={5}
                      placeholder={
                        lang === 'ar'
                          ? 'اكتب رسالتك هنا... يمكنك ذكر احتياجاتك وأي تفاصيل تساعدنا في خدمتك بشكل أفضل'
                          : 'Write your message here... You can mention your needs and any details that help us serve you better'
                      }
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? dict.contact.form.sending : dict.contact.form.submit}
                      {!isSubmitting && <Send className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />}
                    </Button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="bg-black/5 rounded-3xl h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-black/30 mx-auto mb-4" />
                <p className="text-gray-500">
                  {lang === 'ar' ? 'دبي، الإمارات العربية المتحدة' : 'Dubai, UAE'}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
