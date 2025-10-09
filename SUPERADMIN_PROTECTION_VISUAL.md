# 🔒 Visualisasi Alur Proteksi Akun Super Admin

## 📊 Flow Diagram: Render Tombol Aksi

```
┌─────────────────────────────────────────────────────────────────┐
│                   HALAMAN MANAJEMEN PENGGUNA                    │
│                    (UserTableClient Component)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │   Loop setiap user dalam tabel         │
         │   users.map((user) => ...)             │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │  Cek: Apakah akun ini dilindungi?      │
         │                                        │
         │  const isProtectedSuperAdmin =         │
         │    user.username === 'superadmin' ||   │
         │    user.role === 'SUPER_ADMIN'         │
         └────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
         ┌──────────┐              ┌─────────────┐
         │   TRUE   │              │    FALSE    │
         └──────────┘              └─────────────┘
                │                           │
                │                           ▼
                │              ┌─────────────────────────────┐
                │              │  Cek: Role current user?    │
                │              └─────────────────────────────┘
                │                           │
                │              ┌─────────────┴─────────────┐
                │              │                           │
                │              ▼                           ▼
                │       ┌─────────┐              ┌──────────────┐
                │       │  ADMIN  │              │ SUPER_ADMIN  │
                │       └─────────┘              └──────────────┘
                │              │                           │
                │              │                           │
                │              ▼                           ▼
                │    ┌─────────────────┐      ┌──────────────────┐
                │    │ Cek: Diri       │      │ Tampilkan:       │
                │    │ sendiri?        │      │ • Tombol "Ubah"  │
                │    └─────────────────┘      │ • Tombol "Hapus" │
                │         │                   └──────────────────┘
                │    ┌────┴────┐
                │    │         │
                │    ▼         ▼
                │  ┌───┐    ┌───┐
                │  │YES│    │NO │
                │  └───┘    └───┘
                │    │         │
                │    ▼         ▼
                │  ┌─────┐  ┌──────────────┐
                │  │Hapus│  │Akses Terbatas│
                │  └─────┘  └──────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │   🔒 AKUN DILINDUNGI        │
    │                             │
    │   Badge amber:              │
    │   "Akun Dilindungi"         │
    │                             │
    │   ❌ TIDAK ada tombol       │
    │      "Ubah" atau "Hapus"    │
    └─────────────────────────────┘
```

---

## 🛡️ Flow Diagram: Server-Side Protection

### A. Update User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CLIENT: Klik tombol "Ubah"                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           SERVER: updateUser(userId, formData)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │  1. Role Guard                       │
         │  Cek: User punya akses?              │
         │  (SUPER_ADMIN atau ADMIN)            │
         └──────────────────────────────────────┘
                            │
                     ┌──────┴──────┐
                     │             │
                     ▼             ▼
                  ┌─────┐      ┌──────┐
                  │ YES │      │  NO  │
                  └─────┘      └──────┘
                     │             │
                     │             ▼
                     │    ┌─────────────────┐
                     │    │ ❌ ERROR:       │
                     │    │ Tidak ada akses │
                     │    └─────────────────┘
                     │
                     ▼
         ┌──────────────────────────────────────┐
         │  2. Ambil data target user           │
         │  SELECT role, username               │
         └──────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────────────────┐
         │  3. 🔒 PROTEKSI SUPER_ADMIN          │
         │                                      │
         │  if (username === 'superadmin' ||    │
         │      role === 'SUPER_ADMIN')         │
         └──────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          ┌─────┐       ┌─────┐
          │TRUE │       │FALSE│
          └─────┘       └─────┘
              │             │
              ▼             ▼
     ┌─────────────┐  ┌──────────────────┐
     │ ❌ ERROR:   │  │ ✅ Lanjut update │
     │ Akun        │  │ • Validasi data  │
     │ Dilindungi  │  │ • Hash password  │
     └─────────────┘  │ • Update DB      │
                      │ • Log activity   │
                      └──────────────────┘
```

### B. Delete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CLIENT: Klik tombol "Hapus"                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER: deleteUser(userId)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │  1. Role Guard                       │
         │  Cek: User punya akses?              │
         └──────────────────────────────────────┘
                            │
                     ┌──────┴──────┐
                     │             │
                     ▼             ▼
                  ┌─────┐      ┌──────┐
                  │ YES │      │  NO  │
                  └─────┘      └──────┘
                     │             │
                     │             ▼
                     │    ┌─────────────────┐
                     │    │ ❌ ERROR:       │
                     │    │ Tidak ada akses │
                     │    └─────────────────┘
                     │
                     ▼
         ┌──────────────────────────────────────┐
         │  2. Self-Deletion Guard              │
         │  Cek: Hapus diri sendiri?            │
         └──────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          ┌─────┐       ┌─────┐
          │ YES │       │ NO  │
          └─────┘       └─────┘
              │             │
              ▼             │
     ┌─────────────┐        │
     │ ❌ ERROR:   │        │
     │ Tidak bisa  │        │
     │ hapus diri  │        │
     └─────────────┘        │
                            ▼
         ┌──────────────────────────────────────┐
         │  3. Ambil data target user           │
         │  SELECT role, username, nama         │
         └──────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │  4. 🔒 PROTEKSI SUPER_ADMIN          │
         │                                      │
         │  if (username === 'superadmin' ||    │
         │      role === 'SUPER_ADMIN')         │
         └──────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          ┌─────┐       ┌─────┐
          │TRUE │       │FALSE│
          └─────┘       └─────┘
              │             │
              ▼             ▼
     ┌─────────────┐  ┌──────────────────┐
     │ ❌ ERROR:   │  │ ✅ Soft delete   │
     │ Akun        │  │ • Set deletedAt  │
     │ Dilindungi  │  │ • Log activity   │
     └─────────────┘  └──────────────────┘
```

---

## 🎨 Visual Badge Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                    BADGE STYLING                            │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Role Badge: SUPER_ADMIN                                   │
│  ┌──────────────────┐                                      │
│  │ Super Admin      │  🟡 bg-amber-50                      │
│  │                  │  🟠 text-amber-600                   │
│  └──────────────────┘  🟡 border-amber-200                 │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Action Badge: Akun Dilindungi                             │
│  ┌──────────────────┐                                      │
│  │ Akun Dilindungi  │  🟡 bg-amber-50                      │
│  │                  │  🟠 text-amber-600                   │
│  └──────────────────┘  🟡 border-amber-200                 │
│                                                            │
│  ✅ Konsisten dengan badge role SUPER_ADMIN               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Role Badge: ADMIN                                         │
│  ┌──────────────────┐                                      │
│  │ Admin            │  🟣 bg-purple-50                     │
│  │                  │  🟪 text-purple-600                  │
│  └──────────────────┘  🟣 border-purple-200                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Action Badge: Akses Terbatas (untuk ADMIN)                │
│  ┌──────────────────┐                                      │
│  │ Akses Terbatas   │  ⚪ bg-gray-50                       │
│  │                  │  ⚫ text-gray-500                    │
│  └──────────────────┘  ⚪ border-gray-200                  │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 Truth Table: Tampilan Tombol

### Scenario: SUPER_ADMIN Login

| Target User | username | role | isProtected | Tampilan |
|------------|----------|------|-------------|----------|
| Akun A | `superadmin` | `SUPER_ADMIN` | ✅ TRUE | 🔒 Akun Dilindungi |
| Akun B | `admin1` | `ADMIN` | ❌ FALSE | ✏️ Ubah + 🗑️ Hapus |
| Akun C | `admin2` | `ADMIN` | ❌ FALSE | ✏️ Ubah + 🗑️ Hapus |

### Scenario: ADMIN Login

| Target User | isSelf | Tampilan |
|------------|--------|----------|
| Diri sendiri | ✅ TRUE | 🗑️ Hapus |
| Admin lain | ❌ FALSE | ⚠️ Akses Terbatas |
| Super Admin | ❌ FALSE | ⚠️ Akses Terbatas |

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    DEFENSE IN DEPTH                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: 🎨 UI Protection
    │
    ├─ UserTableClient.tsx
    ├─ Conditional rendering
    ├─ Badge "Akun Dilindungi"
    └─ Hide "Ubah" & "Hapus" buttons
              │
              ▼
Layer 2: 🔒 Server-Side Validation
    │
    ├─ updateUser() function
    │   ├─ Role guard
    │   ├─ Username check
    │   └─ Role check
    │
    └─ deleteUser() function
        ├─ Role guard
        ├─ Self-deletion guard
        ├─ Username check
        └─ Role check
              │
              ▼
Layer 3: 💾 Database Constraints
    │
    ├─ Unique constraint on username
    ├─ Enum constraint on role
    └─ Soft delete with deletedAt
```

---

**Prinsip Keamanan:**
> "Never trust the client. Always validate on the server."

**Status**: ✅ Implemented & Tested
