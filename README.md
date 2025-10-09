# SIAD TIK POLDA

**Sistem Informasi Arsip Digital TIK POLDA** - Aplikasi manajemen arsip surat masuk dan keluar berbasis web.

## 🚀 Fitur Utama

- ✉️ **Manajemen Surat**: Kelola surat masuk dan keluar dengan mudah
- 📊 **Dashboard Analytics**: Visualisasi data surat dengan chart dan statistik
- 🔍 **Filter & Search**: Pencarian dan filter advanced untuk surat
- 📋 **Log Activity**: Tracking semua aktivitas pengguna
- 👥 **User Management**: Manajemen pengguna dengan role-based access
- 🗑️ **Soft Delete**: Trash system dengan restore capability
- 📤 **Export**: Export data ke Excel
- 🎨 **Dark Mode**: Theme switching light/dark mode
- 📱 **Responsive**: Mobile-friendly design

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Headless UI, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Jose
- **Charts**: Recharts
- **State Management**: React Hooks
- **File Handling**: XLSX for Excel export

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL 14+
- npm atau yarn

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd siad-tik-polda
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Copy `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/siad_db"
JWT_SECRET="your-secret-key-here"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### 5. Create Superadmin

```bash
npx ts-node scripts/setup/create-superadmin.ts
```

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
siad-tik-polda/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Protected routes
│   │   ├── api/               # API routes
│   │   ├── components/        # React components
│   │   └── login/             # Login page
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities & helpers
│   └── middleware.ts          # Auth middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Database seeder
├── scripts/                   # Utility scripts
│   ├── setup/                # Setup scripts
│   ├── test/                 # Test scripts
│   ├── debug/                # Debug scripts
│   └── migration/            # Migration scripts
├── docs/                      # Documentation
│   ├── features/             # Feature docs
│   ├── fixes/                # Fix docs
│   ├── guides/               # Guides
│   ├── changelog/            # Changelogs
│   └── analysis/             # Analysis docs
├── backups/                   # Database backups
└── public/                    # Static files
```

## 📚 Documentation

Dokumentasi lengkap tersedia di folder [`docs/`](./docs/):

- 📖 [Features Documentation](./docs/features/) - Dokumentasi fitur
- 🔧 [Fixes Documentation](./docs/fixes/) - Dokumentasi perbaikan
- 📝 [Guides](./docs/guides/) - Panduan penggunaan
- 📊 [Analysis](./docs/analysis/) - Analisis & diagnosis
- 📋 [Changelog](./docs/changelog/) - Catatan perubahan

### Quick Links
- [Deployment Guide](./docs/guides/DEPLOYMENT_GUIDE.md)
- [Testing Guide](./docs/guides/TESTING_GUIDE.md)
- [Log Activity Documentation](./docs/features/LOG_ACTIVITY_DOCUMENTATION.md)

## 🧪 Scripts

### Development
```bash
npm run dev          # Run development server
npm run build        # Build for production
npm start            # Start production server
```

### Database
```bash
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations
npx prisma studio    # Open Prisma Studio
npm run seed         # Seed database
```

### Utilities
Lihat [Scripts Documentation](./scripts/README.md) untuk detail lengkap.

```bash
# Setup
npx ts-node scripts/setup/create-superadmin.ts
npx ts-node scripts/setup/check-superadmin.ts

# Testing
node scripts/test/test-login-endpoint.mjs
npx ts-node scripts/test/verify-seed.ts

# Debug
npx ts-node scripts/debug/debug-login-detailed.ts
```

## 🔐 Default Credentials

Setelah setup, gunakan credentials berikut untuk login:

**Superadmin**
- Username: `superadmin`
- Password: (set saat menjalankan create-superadmin script)

## 🌐 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy

Lihat [Deployment Guide](./docs/guides/DEPLOYMENT_GUIDE.md) untuk detail.

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is private and proprietary.

## 👥 Team

Developed by TIK POLDA Development Team

## 📞 Support

Untuk pertanyaan atau issue, silakan hubungi tim development.

---

Built with ❤️ using Next.js and TypeScript
