# Al-Kitab Public Elementary School - Jhang
### School Management System

Pre-Nursery se Class 8 tak ka school management system. Yeh project 4 roles support
karta hai: **Admin**, **Teacher**, **Parent**, aur **Student** — har role ka apna
alag dashboard aur sidebar menu hai.

---

## 🧱 Tech Stack

| Layer          | Technology                         |
|----------------|-------------------------------------|
| Framework      | Next.js 14 (App Router) + TypeScript |
| Styling        | Tailwind CSS + shadcn/ui-style components |
| Database       | PostgreSQL                          |
| ORM            | Prisma                              |
| Authentication | NextAuth.js (Credentials + JWT, role-based) |

---

## 📁 Folder Structure

```
al-kitab-school/
├── app/
│   ├── login/                  # Login page (sab roles ke liye ek hi page)
│   ├── dashboard/
│   │   ├── layout.tsx          # Shared layout: sidebar + topbar
│   │   ├── admin/page.tsx      # Admin overview
│   │   ├── teacher/page.tsx    # Teacher overview
│   │   ├── parent/page.tsx     # Parent overview
│   │   └── student/page.tsx    # Student overview
│   ├── api/auth/[...nextauth]/route.ts   # NextAuth API route
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # "/" -> role ke hisaab se redirect karta hai
├── components/
│   ├── ui/                     # Button, Card, Input, Label (shadcn-style)
│   ├── dashboard/               # Sidebar, Topbar
│   └── providers/               # NextAuth SessionProvider wrapper
├── lib/
│   ├── auth.ts                 # NextAuth config (roles, JWT callbacks)
│   ├── prisma.ts               # Prisma client singleton
│   ├── nav-config.ts           # Role ke hisaab se sidebar menu items
│   └── utils.ts                # cn() helper
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Test data (1 user per role)
├── types/
│   └── next-auth.d.ts          # session.user.role type
├── middleware.ts                # Route protection (role-based)
├── .env.example                 # Environment variables template
└── README.md
```

---

## 🚀 Setup Steps (Beginner-Friendly)

### Step 1 — Requirements install karein
Yeh cheezein aapke computer par honi chahiyein:
- **Node.js** (v18.18 ya usse zyada) — [nodejs.org](https://nodejs.org)
- **PostgreSQL** database — locally install karein ya free online service (jaise [Neon](https://neon.tech) ya [Supabase](https://supabase.com)) use karein

### Step 2 — Project dependencies install karein
Project folder mein ja kar terminal mein likhein:

```bash
npm install
```

### Step 3 — Environment file banayein
`.env.example` file ko copy karke `.env` naam se save karein:

```bash
cp .env.example .env
```

Phir `.env` file kholein aur `DATABASE_URL` mein apna PostgreSQL connection
string dalein. Example:

```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/alkitab_school?schema=public"
```

`NEXTAUTH_SECRET` ke liye ek random secret generate karein:

```bash
openssl rand -base64 32
```

Yeh value copy kar ke `.env` mein `NEXTAUTH_SECRET` mein paste kar dein.

### Step 4 — Database schema push karein
Yeh command Prisma schema ko aapke PostgreSQL database mein tables bana degi:

```bash
npx prisma migrate dev --name init
```

Agar sirf schema sync karna ho (bina migration history ke), yeh bhi chal sakta hai:

```bash
npx prisma db push
```

### Step 5 — Prisma Client generate karein
(Ye `migrate dev` ke saath automatically ho jata hai, lekin agar zaroorat ho):

```bash
npx prisma generate
```

### Step 6 — Test data (seed) dalein
Yeh command har role ka ek test login bana degi:

```bash
npm run db:seed
```

Seed hone ke baad yeh logins mil jayenge (password sab ka same hai):

| Role    | Email                              | Password      |
|---------|-------------------------------------|----------------|
| Admin   | admin@alkitabschool.edu.pk          | password123    |
| Teacher | teacher@alkitabschool.edu.pk        | password123    |
| Parent  | parent@alkitabschool.edu.pk         | password123    |
| Student | student@alkitabschool.edu.pk        | password123    |

### Step 7 — Development server chalayein

```bash
npm run dev
```

Browser mein [http://localhost:3000](http://localhost:3000) kholein. Aap
`/login` page par redirect ho jayenge. Upar diye gaye kisi bhi email/password
se login karein — role ke hisaab se apna dashboard khul jayega.

---

## 🔐 Roles & Access Control

- **Admin** → `/dashboard/admin/*` — poore school ka overview, students, staff, classes
- **Teacher** → `/dashboard/teacher/*` — apni classes, attendance
- **Parent** → `/dashboard/parent/*` — apne bachon ki info
- **Student** → `/dashboard/student/*` — apna profile, attendance

`middleware.ts` yeh ensure karta hai ke koi role dusre role ke dashboard
section ko access na kar sake (e.g. teacher `/dashboard/admin` nahi khol
sakta — automatically apne dashboard par wapas bhej diya jayega).

---

## 🗄️ Database Schema Overview

| Table              | Purpose |
|---------------------|---------|
| `users`              | Har login (admin/teacher/parent/student) ka base account, hashed password ke sath |
| `staff`              | Teachers aur non-teaching staff ki details (employee code, designation, salary) |
| `parents`            | Parent/guardian ki details |
| `classes`            | Pre-Nursery se Class 8 tak ki classes |
| `sections`           | Har class ke sections (A, B, C...) apne class-teacher ke sath |
| `subjects`           | Har class ke subjects |
| `teacher_subjects`   | Kaunsa teacher kaunsa subject parhata hai (many-to-many) |
| `students`           | Student record, apne section aur parent se linked |
| `attendance`         | Daily attendance record har student ke liye |

Poora schema `prisma/schema.prisma` file mein hai.

---

## 🛠️ Useful Commands

```bash
npm run dev          # Development server
npm run build         # Production build
npm run start         # Production server chalayein
npm run lint          # ESLint check

npm run db:generate   # Prisma Client generate karein
npm run db:migrate    # Naya migration banayein aur apply karein
npm run db:studio     # Prisma Studio (database ko GUI mein dekhein)
npm run db:seed       # Test data dalein
```

---

## ☁️ Vercel Par Deploy Karna (Zero se Live tak)

**Zaroori baat samajh lein:** Yeh Next.js app hai — iska matlab hai **frontend
aur backend dono ek hi project mein** hain (API routes + Server Actions hi
backend hain). Isliye Vercel par **sirf ek project** banega, do alag
frontend/backend attach nahi karne — Vercel khud dono ko ek sath deploy kar
deta hai.

### Step 1 — GitHub par code upload karein

```bash
cd al-kitab-school
git init
git add .
git commit -m "Initial commit"
```

Phir GitHub par ek naya (empty) repository banayein aur usay push karein:

```bash
git branch -M main
git remote add origin https://github.com/<aapka-username>/al-kitab-school.git
git push -u origin main
```

> **Note:** `.env` file kabhi bhi GitHub par push nahi hogi — yeh
> `.gitignore` mein already exclude hai. Yeh sahi hai, kyunki secrets kabhi
> public repo mein nahi jane chahiye.

### Step 2 — PostgreSQL Database banayein (production ke liye)

Vercel khud database host nahi karta, lekin Marketplace se free Postgres
connect kar sakte hain. Sabse aasan tareeqa **Neon** hai:

1. [neon.tech](https://neon.tech) par free account banayein
2. Naya project banayein (region: koi bhi qareeb wala, e.g. Singapore)
3. **Connection String** copy karein — kuch aisi dikhegi:
   ```
   postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

(Alternative: [Supabase](https://supabase.com) ya Vercel ke apne Marketplace
mein "Postgres" integration bhi use kar sakte hain — connection string ka
tareeqa same hi hai.)

### Step 3 — Vercel par Project Import karein

1. [vercel.com](https://vercel.com) par login karein (GitHub account se login
   karna aasan hai)
2. **"Add New" → "Project"** par click karein
3. Apni GitHub repository (`al-kitab-school`) select karein → **Import**
4. Vercel khud Next.js detect kar lega — Framework Preset "Next.js" already
   selected hoga, kuch badalne ki zaroorat nahi

### Step 4 — Environment Variables set karein

Import screen par (ya baad mein **Project → Settings → Environment
Variables** se) yeh 3 variables add karein:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Step 2 wali Neon/Supabase connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` se generate karein |
| `NEXTAUTH_URL` | `https://<aapka-project-naam>.vercel.app` (pehle deploy ke baad Vercel yeh URL de dega — pehli baar approx daal dein, deploy hone ke baad exact URL se update kar dein) |

Sab environments (Production, Preview, Development) ke liye set kar dein.

### Step 5 — Deploy karein

**"Deploy"** button dabayein. Vercel yeh sab khud karega (kyunki hamne
`package.json` ka `build` script already isi tarah set kiya hai):

```
prisma generate  →  prisma migrate deploy  →  next build
```

Matlab **database tables automatically ban jayenge** deploy ke waqt — alag
se migration command chalane ki zaroorat nahi.

Build complete hone mein 2-3 minute lagenge. Success hone par Vercel aapko
live URL de dega, e.g. `https://al-kitab-school.vercel.app`

### Step 6 — NEXTAUTH_URL update karein (agar zaroorat ho)

Agar Step 4 mein exact URL nahi pata tha, ab **Settings → Environment
Variables** mein ja kar `NEXTAUTH_URL` ko live URL se update kar dein, phir
**Deployments** tab se **Redeploy** kar dein (taake naya env variable apply ho).

### Step 7 — Test data (seed) dalein — sirf ek dafa

Apne computer se, production database mein connect ho kar seed chalayein:

```bash
# .env file mein DATABASE_URL ko temporarily production wali string se badlein
npm run db:seed
```

Ya phir directly login page se admin khud naya staff/student wagaira add kar
sakta hai — seed sirf testing ke liye chaar demo logins deta hai.

### Step 8 — Live site test karein

`https://<aapka-project>.vercel.app` kholein → `/login` par redirect hoga →
seed wale credentials se login test karein.

---

### Baad mein naya code push karna

Jab bhi aap GitHub par naya commit push karenge, Vercel **automatically**
naya deployment bana dega — kuch manually karne ki zaroorat nahi:

```bash
git add .
git commit -m "kuch naya feature"
git push
```

### Database schema mein tabdeeli ke baad

Agar aap `prisma/schema.prisma` mein koi table/field badlein, to local
machine par pehle migration banayein:

```bash
npx prisma migrate dev --name kuch-naya
git add . && git commit -m "schema update" && git push
```

Push hote hi Vercel ka build script (`prisma migrate deploy`) khud production
database ko bhi update kar dega.

---



Yeh foundation hai — isme yeh cheezein already ready hain:
- ✅ Next.js + TypeScript + Tailwind setup
- ✅ Prisma schema (users, students, parents, staff, classes, sections, subjects)
- ✅ Role-based login (NextAuth.js)
- ✅ Role-based dashboard layout + sidebar

Aage yeh banaya ja sakta hai:
- Students, Staff, Parents ke liye Add/Edit/Delete forms
- Attendance marking system (teacher se)
- Fee management
- Result/marks management
- Notices/announcements
- Timetable

Har naya feature isi folder structure ke pattern par banaya ja sakta hai
(`app/dashboard/<role>/<feature>/page.tsx`).
