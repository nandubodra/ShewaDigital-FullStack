# ShewaDigital

AI-powered government service portal for citizens and government offices.

## Features
- Hindi/English bilingual UI
- User login and registration
- Government profile and admin approval panel
- Service form workflow
- Document uploads
- Application tracking
- Pending / In Process / Approved / Rejected statuses
- AI document extraction API

## Tech Stack
- Next.js
- Tailwind CSS
- PostgreSQL + Prisma
- Supabase-ready auth layer
- OpenAI integration
- Local upload support for demo

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:password@host:5432/shewadigital
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run app
```bash
npm run dev
```

Open `http://localhost:3000`

## Demo Accounts
Citizen:
- Email: `user@shewadigital.in`
- Password: `password123`

Government Admin:
- Email: `admin@shewadigital.in`
- Password: `admin123`

## Project Notes
This project is structured as a production-ready starter for a full-stack government services platform. It is designed for easy replacement of the demo upload layer with real cloud storage and production authentication.
