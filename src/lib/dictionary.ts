import { Dictionary, Language } from '@/types';

const dictionaries: Record<Language, Dictionary> = {
  ar: {
    nav: {
      home: 'الرئيسية',
      programs: 'البرامج التدريبية',
      consulting: 'الاستشارات',
      success: 'قصص النجاح',
      contact: 'تواصل معنا',
      admin: 'لوحة التحكم',
    },
    hero: {
      title: 'نمكّن المؤسسات بقوة الذكاء الاصطناعي',
      subtitle: 'فريق إماراتي متخصص يقدم تدريباً واستشارات وحلول الذكاء الاصطناعي مصممة خصيصاً للثقافة والاحتياجات المحلية',
      cta1: 'اطلب ورشة',
      cta2: 'احجز مكالمة',
    },
    stats: {
      title: 'أرقام تتحدث',
      trainees: 'متدرب',
      organizations: 'جهة حكومية وخاصة',
      workshops: 'ورشة عمل',
      satisfaction: 'نسبة الرضا',
    },
    services: {
      title: 'خدماتنا',
      subtitle: 'حلول متكاملة لرحلتكم نحو الذكاء الاصطناعي',
      training: {
        title: 'التدريب',
        description: 'برامج تدريبية مخصصة للطلاب والموظفين والقيادات، مصممة لتحويل المعرفة النظرية إلى تطبيق عملي فعّال',
      },
      consulting: {
        title: 'الاستشارات',
        description: 'استشارات استراتيجية لتحديد فرص الذكاء الاصطناعي في مؤسستكم وبناء خارطة طريق للتحول الرقمي',
      },
      solutions: {
        title: 'الحلول',
        description: 'تصميم وتنفيذ حلول ذكاء اصطناعي مخصصة تناسب احتياجاتكم وتتكامل مع أنظمتكم الحالية',
      },
    },
    culture: {
      title: 'من نحن - قرى AI',
      subtitle: 'قرى AI هي شركة إماراتية متخصصة في تدريب واستشارات وحلول الذكاء الاصطناعي. نؤمن بأن التحول الرقمي يبدأ من الإنسان، ولذلك نقدم برامج تدريبية وحلول مبتكرة مصممة خصيصاً للسوق الإماراتي والعربي.',
      points: [
        'درّبنا أكثر من 5,000 رائد أعمال في مجال الذكاء الاصطناعي',
        'تعاونّا مع ديوان ولي العهد وأدنوك وصندوق خليفة',
        'فريق إماراتي متخصص يفهم السياق والثقافة المحلية',
        'نقدم محتوى مخصص بهوية إماراتية لكل مؤسسة',
      ],
    },
    credibility: {
      title: 'موثوقون من كبرى المؤسسات',
      subtitle: 'شركاء النجاح في رحلة التحول الرقمي',
    },
    cta: {
      workshop: 'اطلب ورشة',
      call: 'احجز مكالمة',
      inquiry: 'أرسل استفسار',
      learnMore: 'اعرف المزيد',
    },
    contact: {
      title: 'تواصل معنا',
      subtitle: 'نسعد بالإجابة على استفساراتكم ومساعدتكم في رحلة الذكاء الاصطناعي',
      form: {
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        organization: 'اسم الجهة',
        audienceType: 'نوع الجهة',
        interest: 'الخدمة المطلوبة',
        message: 'رسالتكم',
        submit: 'أرسل الاستفسار',
        sending: 'جارٍ الإرسال...',
        success: 'تم إرسال استفساركم بنجاح! سنتواصل معكم قريباً.',
        error: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.',
      },
      audienceTypes: {
        student: 'طالب',
        employee: 'موظف',
        government: 'جهة حكومية',
        private: 'قطاع خاص',
      },
      interests: {
        training: 'التدريب',
        consulting: 'الاستشارات',
        solutions: 'الحلول التقنية',
      },
    },
    programs: {
      title: 'برامجنا التدريبية',
      subtitle: 'برامج مصممة لكل شريحة لتحقيق أقصى استفادة',
      categories: {
        students: 'برامج الطلاب',
        employees: 'برامج الموظفين',
        leaders: 'برامج القيادات',
      },
    },
    consultingPage: {
      title: 'الاستشارات وحلول الذكاء الاصطناعي',
      subtitle: 'نساعدكم في تحديد الفرص وتنفيذ الحلول المناسبة',
    },
    successPage: {
      title: 'قصص النجاح',
      subtitle: 'شراكات أثمرت نتائج ملموسة',
    },
    footer: {
      description: 'قرى AI - فريق إماراتي متخصص في تدريب واستشارات وحلول الذكاء الاصطناعي',
      quickLinks: 'روابط سريعة',
      contactUs: 'تواصل معنا',
      followUs: 'تابعنا',
      rights: 'جميع الحقوق محفوظة',
    },
    admin: {
      title: 'لوحة التحكم - إدارة العملاء المحتملين',
      search: 'بحث بالاسم أو الجهة...',
      filter: 'تصفية حسب الحالة',
      allStatuses: 'جميع الحالات',
      noLeads: 'لا توجد بيانات',
      status: {
        new: 'جديد',
        contacted: 'تم التواصل',
        qualified: 'مؤهل',
        won: 'تم الإغلاق',
        lost: 'مفقود',
      },
      columns: {
        name: 'الاسم',
        organization: 'الجهة',
        contact: 'التواصل',
        interest: 'الاهتمام',
        status: 'الحالة',
        date: 'التاريخ',
        actions: 'الإجراءات',
      },
      notes: 'ملاحظات',
      save: 'حفظ',
      saving: 'جارٍ الحفظ...',
      saved: 'تم الحفظ',
    },
  },
  en: {
    nav: {
      home: 'Home',
      programs: 'Training Programs',
      consulting: 'Consulting',
      success: 'Success Stories',
      contact: 'Contact Us',
      admin: 'Dashboard',
    },
    hero: {
      title: 'Empowering Organizations with AI',
      subtitle: 'An Emirati specialized team delivering AI training, consulting, and solutions tailored to local culture and needs',
      cta1: 'Request Workshop',
      cta2: 'Book a Call',
    },
    stats: {
      title: 'Numbers That Speak',
      trainees: 'Trainees',
      organizations: 'Organizations',
      workshops: 'Workshops',
      satisfaction: 'Satisfaction Rate',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Comprehensive solutions for your AI journey',
      training: {
        title: 'Training',
        description: 'Customized training programs for students, employees, and leaders, designed to transform theoretical knowledge into effective practical application',
      },
      consulting: {
        title: 'Consulting',
        description: 'Strategic consulting to identify AI opportunities in your organization and build a roadmap for digital transformation',
      },
      solutions: {
        title: 'Solutions',
        description: 'Design and implementation of custom AI solutions that fit your needs and integrate with your existing systems',
      },
    },
    culture: {
      title: 'About Us - Qoura AI',
      subtitle: 'Qoura AI is an Emirati company specialized in AI training, consulting, and solutions. We believe digital transformation starts with people, which is why we deliver innovative training programs and solutions designed specifically for the UAE and Arab market.',
      points: [
        'Trained over 5,000 entrepreneurs in artificial intelligence',
        'Partnered with Crown Prince Court, ADNOC, and Khalifa Fund',
        'Emirati specialized team that understands local context and culture',
        'Customized content with Emirati identity for every organization',
      ],
    },
    credibility: {
      title: 'Trusted by Leading Organizations',
      subtitle: 'Success partners in the digital transformation journey',
    },
    cta: {
      workshop: 'Request Workshop',
      call: 'Book a Call',
      inquiry: 'Send Inquiry',
      learnMore: 'Learn More',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We\'re happy to answer your questions and assist you in your AI journey',
      form: {
        fullName: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        organization: 'Organization Name',
        audienceType: 'Organization Type',
        interest: 'Service Required',
        message: 'Your Message',
        submit: 'Send Inquiry',
        sending: 'Sending...',
        success: 'Your inquiry has been sent successfully! We\'ll contact you soon.',
        error: 'An error occurred while sending. Please try again.',
      },
      audienceTypes: {
        student: 'Student',
        employee: 'Employee',
        government: 'Government Entity',
        private: 'Private Sector',
      },
      interests: {
        training: 'Training',
        consulting: 'Consulting',
        solutions: 'Technical Solutions',
      },
    },
    programs: {
      title: 'Our Training Programs',
      subtitle: 'Programs designed for each segment to maximize benefit',
      categories: {
        students: 'Student Programs',
        employees: 'Employee Programs',
        leaders: 'Leadership Programs',
      },
    },
    consultingPage: {
      title: 'Consulting & AI Solutions',
      subtitle: 'We help you identify opportunities and implement suitable solutions',
    },
    successPage: {
      title: 'Success Stories',
      subtitle: 'Partnerships that yielded tangible results',
    },
    footer: {
      description: 'Qoura AI - An Emirati team specialized in AI training, consulting, and solutions',
      quickLinks: 'Quick Links',
      contactUs: 'Contact Us',
      followUs: 'Follow Us',
      rights: 'All Rights Reserved',
    },
    admin: {
      title: 'Dashboard - Lead Management',
      search: 'Search by name or organization...',
      filter: 'Filter by status',
      allStatuses: 'All Statuses',
      noLeads: 'No data found',
      status: {
        new: 'New',
        contacted: 'Contacted',
        qualified: 'Qualified',
        won: 'Won',
        lost: 'Lost',
      },
      columns: {
        name: 'Name',
        organization: 'Organization',
        contact: 'Contact',
        interest: 'Interest',
        status: 'Status',
        date: 'Date',
        actions: 'Actions',
      },
      notes: 'Notes',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved',
    },
  },
};

export function getDictionary(lang: Language): Dictionary {
  return dictionaries[lang];
}

export function getDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
