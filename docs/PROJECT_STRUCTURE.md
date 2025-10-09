# SIAD TIK POLDA - Project Structure

Dokumentasi lengkap struktur project setelah refactoring.

**Last Updated**: Oktober 2025

## 📁 Root Directory Structure

```
siad-tik-polda/
├── 📁 backups/                    # Database backups
│   ├── *.dump                    # PostgreSQL dump files
│   └── *.sql                     # SQL backup files
│
├── 📁 docs/                       # 📚 All documentation
│   ├── README.md                 # Documentation index
│   ├── 📁 analysis/              # Analysis & diagnosis (30+ files)
│   │   └── README.md
│   ├── 📁 changelog/             # Changelogs (10+ files)
│   │   └── README.md
│   ├── 📁 features/              # Feature docs (65+ files)
│   │   └── README.md
│   ├── 📁 fixes/                 # Bug fixes (36+ files)
│   │   └── README.md
│   └── 📁 guides/                # Guides (20+ files)
│       └── README.md
│
├── 📁 prisma/                     # 🗄️ Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Main seeder
│   ├── seed-dummy-surat.ts       # Dummy data seeder
│   └── 📁 migrations/            # Database migrations
│       └── [migration files]
│
├── 📁 public/                     # 🌐 Static files
│   └── [static assets]
│
├── 📁 scripts/                    # 🛠️ Utility scripts
│   ├── README.md                 # Scripts documentation
│   ├── 📁 debug/                 # Debug scripts (3 files)
│   │   ├── debug-login-detailed.ts
│   │   ├── debug-log-activity-production.ts
│   │   └── diagnose-online-login.ts
│   ├── 📁 migration/             # Migration scripts (3 files)
│   │   ├── execute-migration.ts
│   │   ├── run-migration-alter.ts
│   │   └── drop-old-column.ts
│   ├── 📁 setup/                 # Setup scripts (5 files)
│   │   ├── create-superadmin.ts
│   │   ├── check-superadmin.ts
│   │   ├── reset-superadmin.ts
│   │   ├── reset-superadmin-password.ts
│   │   └── setup-production-db.ts
│   └── 📁 test/                  # Test scripts (15+ files)
│       ├── test-*.ts
│       ├── test-*.mjs
│       └── verify-*.ts
│
├── 📁 src/                        # 💻 Source code
│   ├── middleware.ts             # Auth middleware
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── providers.tsx         # Context providers
│   │   ├── globals.css           # Global styles
│   │   ├── chrome-optimizations.css
│   │   ├── favicon.ico
│   │   │
│   │   ├── 📁 (app)/            # Protected routes
│   │   │   ├── layout.tsx
│   │   │   ├── 📁 about/
│   │   │   ├── 📁 admin/
│   │   │   │   ├── actions.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── 📁 trash/
│   │   │   │   └── 📁 users/
│   │   │   ├── 📁 arsip/
│   │   │   ├── 📁 dashboard/
│   │   │   ├── 📁 log-activity/
│   │   │   └── 📁 profile/
│   │   │
│   │   ├── 📁 api/              # API Routes
│   │   │   ├── 📁 auth/
│   │   │   │   └── 📁 login/
│   │   │   ├── 📁 health/
│   │   │   │   └── 📁 activity-log/
│   │   │   ├── 📁 surat/
│   │   │   │   └── 📁 statistik/
│   │   │   └── 📁 test-db-schema/
│   │   │
│   │   ├── 📁 components/       # React Components
│   │   │   ├── SuratDashboardClient.tsx (optimized)
│   │   │   ├── SuratDetailModal.tsx (optimized)
│   │   │   ├── SuratTable.tsx
│   │   │   ├── SuratFormModal.tsx
│   │   │   ├── SuratChart.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── DocumentTypeFilter.tsx
│   │   │   ├── DateRangeFilter.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── ModernNavbar.tsx
│   │   │   ├── UserDropdown.tsx
│   │   │   ├── ThemeSwitcher.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentActivityTable.tsx
│   │   │   ├── LiveDateTime.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ConstellationBackground.tsx
│   │   │   ├── ChromeLoadingSpinner.tsx
│   │   │   ├── BulkActionsToolbar.tsx
│   │   │   ├── BulkTrashActionsToolbar.tsx
│   │   │   ├── DeleteSuratButton.tsx
│   │   │   ├── DeleteUserButton.tsx
│   │   │   ├── TrashActionButtons.tsx
│   │   │   ├── TrashSuratTableClient.tsx
│   │   │   ├── TrashSuratWithPagination.tsx
│   │   │   ├── TrashUsersWithPagination.tsx
│   │   │   ├── UserTableClient.tsx
│   │   │   ├── UserFormModal.tsx
│   │   │   ├── ChangePasswordForm.tsx
│   │   │   └── UpdateProfileForm.tsx
│   │   │
│   │   └── 📁 login/            # Login page
│   │       └── page.tsx
│   │
│   ├── 📁 hooks/                # Custom React Hooks
│   │   ├── useBrowserDetection.ts
│   │   ├── useModalManagement.ts
│   │   ├── usePagination.ts
│   │   ├── useSelection.ts
│   │   ├── useSuratFilters.ts
│   │   ├── useSuratSorting.ts
│   │   └── useSuratUtils.ts
│   │
│   └── 📁 lib/                  # Utilities & Helpers
│       ├── activityLogger.ts    # Activity logging
│       ├── prisma.ts            # Prisma client
│       ├── session.ts           # Session management
│       └── trashRetention.ts    # Trash retention logic
│
├── .env                          # Environment variables
├── .env.connection-pool.example
├── .env.production.example
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs            # ESLint config
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies
├── postcss.config.mjs           # PostCSS config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
├── tsconfig.seed.json           # TypeScript seed config
├── README.md                    # Main documentation
└── REFACTORING_SUMMARY.md       # Refactoring documentation
```

## 📊 Statistics

### Documentation
- **Total MD Files**: 268+
- **Features**: 65+ files
- **Fixes**: 36+ files
- **Guides**: 20+ files
- **Changelog**: 10+ files
- **Analysis**: 30+ files

### Scripts
- **Total Scripts**: 30+
- **Setup**: 5 files
- **Test**: 15+ files
- **Debug**: 3 files
- **Migration**: 3 files

### Components
- **Total Components**: 30+ files
- **Page Components**: 10+ files
- **UI Components**: 20+ files

### Custom Hooks
- **Total Hooks**: 7 files

## 🎯 Key Directories

### `/src/app`
Next.js App Router dengan route structure:
- `(app)/` - Protected routes yang memerlukan authentication
- `api/` - API endpoints
- `components/` - Reusable React components
- `login/` - Public login page

### `/src/hooks`
Custom React hooks untuk business logic:
- `useSuratFilters` - Filter logic
- `useSuratSorting` - Sorting logic
- `usePagination` - Pagination logic
- `useSelection` - Selection management
- `useModalManagement` - Modal state management

### `/src/lib`
Utility functions dan shared logic:
- `activityLogger` - Activity logging system
- `prisma` - Database client
- `session` - Session & JWT management
- `trashRetention` - Soft delete logic

### `/docs`
Semua dokumentasi terorganisir berdasarkan kategori:
- `features/` - Feature documentation
- `fixes/` - Bug fixes documentation
- `guides/` - How-to guides
- `changelog/` - Change logs
- `analysis/` - Analysis reports

### `/scripts`
Utility scripts terorganisir berdasarkan fungsi:
- `setup/` - Initial setup & configuration
- `test/` - Testing scripts
- `debug/` - Debugging utilities
- `migration/` - Database migration scripts

### `/backups`
Database backup files:
- `.dump` files - PostgreSQL dumps
- `.sql` files - SQL backups

## 🔧 Configuration Files

### TypeScript
- `tsconfig.json` - Main TypeScript config
- `tsconfig.seed.json` - Config for seed scripts

### Next.js
- `next.config.ts` - Next.js configuration
- `middleware.ts` - Authentication middleware

### Styling
- `tailwind.config.ts` - Tailwind CSS config
- `postcss.config.mjs` - PostCSS config
- `globals.css` - Global styles
- `chrome-optimizations.css` - Chrome-specific optimizations

### Database
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Migration history

### Linting
- `eslint.config.mjs` - ESLint rules

## 📝 Naming Conventions

### Components
- PascalCase (e.g., `SuratDashboardClient.tsx`)
- Descriptive names indicating purpose
- Group related components (e.g., `Surat*`, `Trash*`, `User*`)

### Hooks
- camelCase with `use` prefix (e.g., `useSuratFilters.ts`)
- Named after functionality

### API Routes
- Folder-based routing in `/api`
- `route.ts` for endpoint implementation

### Scripts
- kebab-case (e.g., `create-superadmin.ts`)
- Prefix indicates action:
  - `create-*` - Creation scripts
  - `test-*` - Testing scripts
  - `debug-*` - Debugging scripts
  - `setup-*` - Setup scripts

### Documentation
- SCREAMING_SNAKE_CASE for MD files
- Prefix indicates category:
  - `FEATURE_*` - Feature docs
  - `FIX_*` - Fix docs
  - `CHANGELOG_*` - Changelogs
  - `GUIDE_*` - Guides

## 🚀 Quick Start Guide

### 1. Setup Development
```bash
npm install
npx prisma generate
npx prisma migrate dev
```

### 2. Create Superadmin
```bash
npx ts-node scripts/setup/create-superadmin.ts
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access Documentation
- Main docs: `docs/README.md`
- Features: `docs/features/README.md`
- Scripts: `scripts/README.md`

## 📚 Related Documentation

- [Main README](../README.md)
- [Refactoring Summary](../REFACTORING_SUMMARY.md)
- [Documentation Index](../docs/README.md)
- [Features Documentation](../docs/features/README.md)
- [Scripts Guide](../scripts/README.md)

## 🎓 For New Developers

Start with these files in order:
1. [README.md](../README.md) - Project overview
2. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - This file
3. [docs/README.md](../docs/README.md) - Documentation index
4. [Deployment Guide](../docs/guides/DEPLOYMENT_GUIDE.md)

---

**Maintained by**: TIK POLDA Development Team
**Last Updated**: Oktober 2025
**Status**: ✅ Current & Accurate
