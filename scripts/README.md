# Scripts Directory

Direktori ini berisi berbagai script untuk setup, testing, debugging, dan migration database.

## 📁 Struktur

```
scripts/
├── setup/          # Script untuk setup dan konfigurasi
├── test/           # Script untuk testing
├── debug/          # Script untuk debugging
└── migration/      # Script untuk database migration
```

## 🔧 Setup Scripts

Script untuk setup aplikasi dan konfigurasi awal:

- `create-superadmin.ts` - Membuat akun superadmin
- `check-superadmin.ts` - Mengecek status superadmin
- `reset-superadmin.ts` - Reset akun superadmin
- `reset-superadmin-password.ts` - Reset password superadmin
- `setup-production-db.ts` - Setup database production

### Cara Penggunaan
```bash
# Membuat superadmin
npx ts-node scripts/setup/create-superadmin.ts

# Check superadmin
npx ts-node scripts/setup/check-superadmin.ts
```

## 🧪 Test Scripts

Script untuk testing berbagai fitur:

- `test-*.ts` - Testing TypeScript
- `test-*.mjs` - Testing JavaScript/ESM
- `verify-*.ts` - Verifikasi konfigurasi

### Cara Penggunaan
```bash
# Test login endpoint
node scripts/test/test-login-endpoint.mjs

# Test superadmin
npx ts-node scripts/test/test-superadmin-login.ts

# Verify seed data
npx ts-node scripts/test/verify-seed.ts
```

## 🐛 Debug Scripts

Script untuk debugging dan diagnosis:

- `debug-*.ts` - Script debugging
- `diagnose-*.ts` - Script diagnosis masalah

### Cara Penggunaan
```bash
# Debug login
npx ts-node scripts/debug/debug-login-detailed.ts

# Diagnose online login
npx ts-node scripts/debug/diagnose-online-login.ts
```

## 🗄️ Migration Scripts

Script untuk database migration:

- `execute-migration.ts` - Execute migration manual
- `run-migration-alter.ts` - Run ALTER migration
- `drop-old-column.ts` - Drop kolom lama

### Cara Penggunaan
```bash
# Execute migration
npx ts-node scripts/migration/execute-migration.ts

# Run alter migration
npx ts-node scripts/migration/run-migration-alter.ts
```

## ⚠️ Catatan Penting

1. **Backup Database**: Selalu backup database sebelum menjalankan migration scripts
2. **Environment**: Pastikan environment variables sudah di-set dengan benar
3. **Production**: Hati-hati saat menjalankan script di production
4. **Testing**: Test script di development environment terlebih dahulu

## 🔐 Security

- Jangan commit credentials ke git
- Gunakan `.env` file untuk sensitive data
- Script superadmin hanya untuk admin

## 📝 Naming Convention

- `create-*` - Script untuk membuat resource
- `setup-*` - Script untuk setup/konfigurasi
- `test-*` - Script untuk testing
- `verify-*` - Script untuk verifikasi
- `debug-*` - Script untuk debugging
- `diagnose-*` - Script untuk diagnosis
- `execute-*` - Script untuk eksekusi
- `run-*` - Script untuk menjalankan proses
- `drop-*` - Script untuk menghapus (DANGEROUS!)
- `reset-*` - Script untuk reset (DANGEROUS!)

## 🚨 Dangerous Scripts

Script berikut dapat mengubah atau menghapus data. Gunakan dengan hati-hati:

- `reset-*.ts` - Reset data
- `drop-*.ts` - Drop/hapus data
- `execute-migration.ts` - Execute migration (dapat mengubah schema)

Selalu backup database sebelum menjalankan script berbahaya!
