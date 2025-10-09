# 🎨 LOG ACTIVITY - VISUAL GUIDE & UI/UX

Panduan visual untuk memahami UI dan flow dari fitur Log Activity.

---

## 🗺️ Navigation Flow

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                     👤 [User]  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          ▼       │
│  │Dashbd││Arsip ││Users ││Trash │      ┌──────────┐   │
│  └──────┘ └──────┘ └──────┘ └──────┘      │Dropdown  │   │
│                                           │          │   │
│                                           │ Profile  │   │
│                                           │ Log ✨   │◄──┐
│                                           │ About    │   │
│                                           │ Settings │   │
│                                           │ ───────  │   │
│                                           │ Logout   │   │
│                                           └──────────┘   │
└─────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────┐
│                   LOG AKTIVITAS PAGE                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard Stats Section

```
┌───────────────────────────────────────────────────────────────┐
│  LOG AKTIVITAS                                                │
│  Riwayat aktivitas pengguna dalam sistem                      │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────┐│
│  │ 📊 Total Log │ │ 📅 Hari Ini  │ │ 📁 Kategori  │ │👤 User││
│  │              │ │              │ │              │ │       ││
│  │    1,234     │ │      45      │ │      6       │ │  12   ││
│  │              │ │              │ │              │ │       ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────┘│
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Stats Cards Features:**
- 📊 **Total Log** - Jumlah total semua aktivitas
- 📅 **Hari Ini** - Aktivitas yang terjadi hari ini
- 📁 **Kategori** - Jumlah kategori yang memiliki log
- 👤 **User Aktif** - Jumlah user yang memiliki aktivitas

**Visual Details:**
- White background dengan shadow
- Blue icons untuk visual appeal
- Large numbers untuk easy reading
- Responsive: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)

---

## 🔍 Filter & Search Section

```
┌────────────────────────────────────────────────────────────────┐
│  🔍 Filter & Pencarian                          🔄 Reset       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │🔍 Pencarian  │ │📁 Kategori   │ │🏷️ Tipe       │   │ │
│  │  │[Search...]   │ │[Semua ▼]     │ │[Semua ▼]     │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  │                                                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │👤 Pengguna*  │ │📅 Dari       │ │📅 Sampai     │   │ │
│  │  │[Pilih ▼]     │ │[YYYY-MM-DD]  │ │[YYYY-MM-DD]  │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  │                                                          │ │
│  │                                      [📥 Export CSV]    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

* Super Admin only
```

**Filter Options:**

1. **🔍 Search Bar**
   - Real-time filtering
   - Search across: description, nama, username, category, type

2. **📁 Category Dropdown**
   - Semua Kategori
   - Autentikasi
   - Surat
   - Pengguna
   - Profil
   - Trash
   - Sistem

3. **🏷️ Type Dropdown**
   - Semua Tipe
   - Login
   - Logout
   - Buat
   - Update
   - Hapus
   - Pulihkan
   - Hapus Permanen
   - Lihat
   - Unduh

4. **👤 User Filter** (Super Admin only)
   - Dropdown dengan nama user
   - Format: "Nama (username)"

5. **📅 Date Range**
   - Start date
   - End date
   - ISO format: YYYY-MM-DD

6. **Buttons**
   - 🔄 Reset - Clear all filters
   - 📥 Export CSV - Download filtered data

---

## 📋 Activity Table

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Riwayat Aktivitas (1,234 total)                                              │
├─────────────┬────────────┬────────┬────────┬─────────────┬────────┬──────────┤
│ Waktu       │ Pengguna   │ Kateg  │ Tipe   │ Deskripsi   │ Status │ IP Addr  │
├─────────────┼────────────┼────────┼────────┼─────────────┼────────┼──────────┤
│ 09/10 10:30 │ John Doe   │🔵 AUTH │ LOGIN  │ User login  │   ✓    │127.0.0.1 │
│             │ @johndoe   │        │        │ success     │        │          │
├─────────────┼────────────┼────────┼────────┼─────────────┼────────┼──────────┤
│ 09/10 10:25 │ Jane Smith │🟣 SURAT│ CREATE │ Membuat     │   ✓    │192.168.. │
│             │ @janesmith │        │        │ surat baru  │        │          │
├─────────────┼────────────┼────────┼────────┼─────────────┼────────┼──────────┤
│ 09/10 10:20 │ Bob Wilson │🟢 USER │ UPDATE │ Update user │   ✓    │10.0.0.1  │
│             │ @bobwilson │        │        │ profile     │        │          │
├─────────────┼────────────┼────────┼────────┼─────────────┼────────┼──────────┤
│ 09/10 10:15 │ Alice Lee  │🟡PROFILE│PASSWORD│ Ganti       │   ✓    │172.16..  │
│             │ @alicelee  │        │_CHANGE │ password    │        │          │
├─────────────┼────────────┼────────┼────────┼─────────────┼────────┼──────────┤
│ 09/10 10:10 │ John Doe   │🔴 TRASH│ RESTORE│ Pulihkan    │   ✓    │127.0.0.1 │
│             │ @johndoe   │        │        │ surat       │        │          │
├─────────────┼────────────┼────────┼────────┼─────────────┼────────┼──────────┤
│                         ...more rows...                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│  Halaman 1 dari 25                    [◄ Sebelumnya]  [Selanjutnya ►]       │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Table Features:**

### Columns:
1. **Waktu** - Format: DD/MM HH:mm
2. **Pengguna** - Nama + @username (2 lines)
3. **Kategori** - Colored badge
4. **Tipe** - Badge with background color
5. **Deskripsi** - Activity description (truncated)
6. **Status** - Icon (✓ ✗ ⚠)
7. **IP Address** - Truncated if too long

### Responsive Behavior:
- **Desktop:** All columns visible
- **Tablet:** Hide IP Address
- **Mobile:** Stack columns, show minimal info

### Hover Effects:
- Row hover: Light gray background
- Smooth transition
- Cursor pointer

---

## 🎨 Color Coding System

### Category Badges

```
┌──────────────────────────────────────────────────────────┐
│  🔵 AUTH          Blue    #3B82F6  Light: #DBEAFE       │
│  🟣 SURAT         Purple  #A855F7  Light: #F3E8FF       │
│  🟢 USER          Green   #10B981  Light: #D1FAE5       │
│  🟡 PROFILE       Yellow  #F59E0B  Light: #FEF3C7       │
│  🔴 TRASH         Red     #EF4444  Light: #FEE2E2       │
│  ⚫ SYSTEM        Gray    #6B7280  Light: #F3F4F6       │
└──────────────────────────────────────────────────────────┘
```

### Type Badges

```
┌──────────────────────────────────────────────────────────┐
│  CREATE           Green    #10B981  Light: #ECFDF5      │
│  UPDATE           Blue     #3B82F6  Light: #EFF6FF      │
│  DELETE           Red      #EF4444  Light: #FEF2F2      │
│  LOGIN            Indigo   #6366F1  Light: #EEF2FF      │
│  LOGOUT           Gray     #6B7280  Light: #F9FAFB      │
│  Others           Gray     #6B7280  Light: #F9FAFB      │
└──────────────────────────────────────────────────────────┘
```

### Status Icons

```
┌──────────────────────────────────────────────────────────┐
│  ✓ SUCCESS        Green checkmark   #10B981             │
│  ✗ FAILED         Red X mark        #EF4444             │
│  ⚠ WARNING        Yellow alert      #F59E0B             │
└──────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────┐
│ NAVBAR                                           │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  ◄── Stats (4 cols)│
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                  │
│  ┌──────────────────────────────┐  ◄── Filters  │
│  └──────────────────────────────┘               │
│                                                  │
│  ┌──────────────────────────────┐  ◄── Table    │
│  │  Full width table            │               │
│  │  All columns visible         │               │
│  └──────────────────────────────┘               │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌─────────────────────────────────┐
│ NAVBAR                          │
├─────────────────────────────────┤
│                                 │
│  ┌────┐ ┌────┐  ◄── Stats (2 cols)
│  ┌────┐ ┌────┐                 │
│                                 │
│  ┌───────────────────┐  ◄── Filters
│  └───────────────────┘         │
│                                 │
│  ┌───────────────────┐  ◄── Table
│  │ Hide IP column    │         │
│  └───────────────────┘         │
│                                 │
└─────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│ NAVBAR [≡]       │
├──────────────────┤
│                  │
│  ┌────┐  ◄── Stats
│  ┌────┐  (1 col) │
│  ┌────┐          │
│  ┌────┐          │
│                  │
│  ┌──────┐ ◄── Filters
│  └──────┘ (stacked)
│                  │
│  ┌──────┐ ◄── Table
│  │Cards │ (card layout)
│  │view  │       │
│  └──────┘       │
│                  │
└──────────────────┘
```

---

## 🎭 Dark Mode Support

### Light Mode
```
┌────────────────────────────────────────┐
│ Background:   #F9FAFB (gray-50)       │
│ Cards:        #FFFFFF (white)          │
│ Text:         #111827 (gray-900)       │
│ Border:       #E5E7EB (gray-200)       │
│ Hover:        #F3F4F6 (gray-100)       │
└────────────────────────────────────────┘
```

### Dark Mode
```
┌────────────────────────────────────────┐
│ Background:   #111827 (gray-900)       │
│ Cards:        #1F2937 (gray-800)       │
│ Text:         #F9FAFB (gray-50)        │
│ Border:       #374151 (gray-700)       │
│ Hover:        #374151 (gray-700)       │
└────────────────────────────────────────┘
```

**Smooth Transitions:**
- Duration: 200ms
- Easing: ease-in-out
- Properties: background, color, border-color

---

## 🎬 User Interactions

### 1. Filter Change
```
User selects filter
      ↓
State updates
      ↓
Loading spinner shows
      ↓
Fetch filtered data
      ↓
Update table
      ↓
Hide spinner
```

### 2. Search
```
User types in search box
      ↓
Debounce 300ms
      ↓
Filter local data
      ↓
Update table immediately
```

### 3. Export CSV
```
User clicks Export button
      ↓
Button shows "Mengekspor..."
      ↓
Server generates CSV
      ↓
Browser downloads file
      ↓
Button back to "Export CSV"
```

### 4. Pagination
```
User clicks Next/Previous
      ↓
Update page state
      ↓
Scroll to top
      ↓
Fetch new page data
      ↓
Update table
```

---

## 🎯 Empty States

### No Logs Found
```
┌────────────────────────────────────────┐
│                                        │
│          📊                            │
│     (Activity Icon)                    │
│                                        │
│   Tidak ada log aktivitas              │
│                                        │
│   Belum ada aktivitas yang tercatat   │
│   atau filter terlalu spesifik         │
│                                        │
└────────────────────────────────────────┘
```

### Loading State
```
┌────────────────────────────────────────┐
│                                        │
│          ⟳                             │
│    (Spinning Icon)                     │
│                                        │
│   Memuat data...                       │
│                                        │
└────────────────────────────────────────┘
```

### Error State
```
┌────────────────────────────────────────┐
│                                        │
│          ⚠                             │
│    (Warning Icon)                      │
│                                        │
│   Gagal memuat data                    │
│                                        │
│   [Coba Lagi]                          │
│                                        │
└────────────────────────────────────────┘
```

---

## 💡 UX Best Practices Implemented

### ✅ Performance
- **Pagination:** Max 50 items per page
- **Debounced Search:** 300ms delay
- **Indexed Database:** Fast queries
- **Lazy Loading:** Only load visible data

### ✅ Accessibility
- **Keyboard Navigation:** Tab through filters
- **ARIA Labels:** Screen reader friendly
- **Color Contrast:** WCAG AA compliant
- **Focus Indicators:** Clear focus states

### ✅ Feedback
- **Loading States:** Spinner while loading
- **Success Messages:** Green toast notifications
- **Error Messages:** Red toast with retry option
- **Empty States:** Helpful messages

### ✅ Responsiveness
- **Mobile First:** Works on all screen sizes
- **Touch Friendly:** Large tap targets (44px min)
- **Responsive Tables:** Stack on mobile
- **Adaptive Layout:** Columns adjust by screen size

---

## 🎨 Component Hierarchy

```
LogActivityPage (Server Component)
  └─ ActivityLogClient (Client Component)
      ├─ Stats Cards (4 cards)
      │   ├─ Total Log
      │   ├─ Hari Ini
      │   ├─ Kategori
      │   └─ User Aktif
      │
      ├─ Filter Section
      │   ├─ Search Input
      │   ├─ Category Dropdown
      │   ├─ Type Dropdown
      │   ├─ User Dropdown (conditional)
      │   ├─ Start Date Input
      │   ├─ End Date Input
      │   ├─ Reset Button
      │   └─ Export Button
      │
      └─ Table Section
          ├─ Table Header
          ├─ Table Body
          │   └─ Activity Rows
          │       ├─ Time Cell
          │       ├─ User Cell
          │       ├─ Category Badge
          │       ├─ Type Badge
          │       ├─ Description Cell
          │       ├─ Status Icon
          │       └─ IP Cell
          │
          └─ Pagination
              ├─ Page Info
              ├─ Previous Button
              └─ Next Button
```

---

## 📐 Spacing & Sizing

```
┌─────────────────────────────────────────┐
│  Page Padding:      32px (lg), 24px (md), 16px (sm)
│  Card Padding:      24px
│  Card Gap:          24px
│  Table Padding:     16px cells, 12px compact
│  Button Height:     40px
│  Input Height:      40px
│  Border Radius:     12px (cards), 8px (inputs/buttons)
│  Shadow:            sm (default), md (hover), lg (active)
└─────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

### Visual Quality
- [x] Consistent with existing design system
- [x] Professional appearance
- [x] Clear visual hierarchy
- [x] Appropriate use of color
- [x] Good contrast ratios

### Usability
- [x] Intuitive navigation
- [x] Clear call-to-actions
- [x] Helpful empty states
- [x] Fast and responsive
- [x] Works on all devices

### Functionality
- [x] All filters work correctly
- [x] Search is fast and accurate
- [x] Export produces valid CSV
- [x] Pagination works smoothly
- [x] Role-based access enforced

---

**Design Status:** ✅ Complete & Production Ready

Semua aspek visual dan UX telah diimplementasikan dengan best practices.
