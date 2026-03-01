# Qoura AI - قرى للذكاء الاصطناعي

موقع إلكتروني احترافي لشركة قرى AI المتخصصة في التدريب والاستشارات وحلول الذكاء الاصطناعي.

A professional website for Qoura AI, specializing in AI training, consulting, and solutions.

## Features | المميزات

- **Bilingual Support**: Arabic (RTL) first with English toggle
- **Modern Design**: Clean, premium, governmental-friendly design
- **Smooth Animations**: Professional transitions and scroll animations
- **Lead Management**: Contact form with Baserow integration
- **Admin Dashboard**: Protected dashboard for managing leads
- **Responsive**: Fully responsive design for all devices
- **SEO Ready**: Meta tags and semantic HTML

## Tech Stack | التقنيات

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Baserow (API)
- **Deployment**: Docker

## Pages | الصفحات

- `/` - Home Page (الرئيسية)
- `/programs` - Training Programs (البرامج التدريبية)
- `/consulting` - Consulting & AI Solutions (الاستشارات)
- `/success` - Success Stories (قصص النجاح)
- `/contact` - Contact Form (تواصل معنا)
- `/admin` - Admin Dashboard (لوحة التحكم)

## Getting Started | البدء

### Prerequisites | المتطلبات

- Node.js 18+
- npm or yarn
- Baserow account (cloud or self-hosted)

### 1. Clone and Install | التثبيت

```bash
git clone <repository-url>
cd qoura-ai
npm install
```

### 2. Setup Baserow | إعداد Baserow

1. Create a Baserow account at [baserow.io](https://baserow.io) or use self-hosted
2. Create a new database and table named "Leads"
3. Add the following fields to the table:

| Field Name | Type | Notes |
|------------|------|-------|
| full_name | Text | Required |
| email | Email | Required |
| phone | Text | Required |
| organization | Text | Required |
| audience_type | Single Select | Options: student, employee, government, private |
| interest | Single Select | Options: training, consulting, solutions |
| message | Long Text | Required |
| status | Single Select | Options: new, contacted, qualified, won, lost |
| notes | Long Text | Optional |
| created_at | Date | Auto-filled |

4. Get your API Token:
   - Go to Settings → API Tokens
   - Create a new token with read/write access to your table

5. Get your Table ID:
   - Open your table in Baserow
   - The URL will be like: `https://baserow.io/database/XXX/table/YYY`
   - Your Table ID is `YYY`

### 3. Configure Environment | تكوين البيئة

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
BASEROW_BASE_URL=https://api.baserow.io
BASEROW_API_TOKEN=your_api_token_here
BASEROW_TABLE_ID=your_table_id_here
ADMIN_PASSWORD=your_secure_admin_password
```

### 4. Run Development Server | تشغيل السيرفر

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment | النشر

### Option 1: Docker (Recommended)

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build -t qoura-ai .
docker run -p 3000:3000 --env-file .env.local qoura-ai
```

### Option 2: Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 3: Traditional Hosting

```bash
npm run build
npm start
```

## Admin Dashboard | لوحة التحكم

Access the admin dashboard at `/admin`

**Login credentials:**
- Username: `admin`
- Password: Your `ADMIN_PASSWORD` from environment variables

**Features:**
- View all leads (newest first)
- Search by name or organization
- Filter by status
- Update lead status
- Add notes to leads

## Project Structure | هيكل المشروع

```
qoura-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   │   ├── leads/         # Public lead submission
│   │   │   └── admin/         # Protected admin API
│   │   ├── consulting/        # Consulting page
│   │   ├── contact/           # Contact page
│   │   ├── programs/          # Programs page
│   │   ├── success/           # Success stories
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── layout/            # Header, Footer
│   │   ├── sections/          # Page sections
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── baserow.ts         # Baserow API client
│   │   ├── dictionary.ts      # i18n dictionary
│   │   ├── language-context.tsx # Language provider
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── middleware.ts          # Auth middleware
├── public/                    # Static assets
├── docker-compose.yml         # Docker compose config
├── Dockerfile                 # Docker build config
├── .env.example              # Environment template
└── README.md                 # This file
```

## API Endpoints | نقاط الـ API

### Public

- `POST /api/leads` - Submit a new lead

### Protected (requires Basic Auth)

- `GET /api/admin/leads` - List all leads
- `PATCH /api/admin/leads` - Update lead status/notes

## Customization | التخصيص

### Colors

Edit `tailwind.config.ts` to change brand colors:

```ts
colors: {
  navy: '#1E3A5F',      // Primary dark blue
  lightBlue: '#6CA3D1', // Accent light blue
}
```

### Content

Edit `src/lib/dictionary.ts` to change all text content in both Arabic and English.

### Animations

Edit `src/app/globals.css` to modify or add new animations.

## Support | الدعم

For issues and feature requests, please open an issue in the repository.

## License | الترخيص

Private - All rights reserved © Qoura AI
