# 📊 Visual Guide: Pagination & Search Tabel Pengguna

## 🎯 Overview Komponen

```
┌───────────────────────────────────────────────────────────────┐
│                    HALAMAN MANAJEMEN PENGGUNA                 │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────┬─────────────────────┐
│   STATS CARD 1      │   STATS CARD 2      │   STATS CARD 3      │
│   Total Pengguna    │   Super Admin       │   Admin             │
│       50            │        1            │       49            │
└─────────────────────┴─────────────────────┴─────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  HEADER                                       [+ Tambah User]  │
│  Daftar Pengguna Aktif                                        │
├───────────────────────────────────────────────────────────────┤
│  🔍 SEARCH BAR                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔍 Cari nama, username, atau role...              [X] │  │
│  └────────────────────────────────────────────────────────┘  │
│  Menampilkan 5 dari 50 pengguna                              │
├───────────────────────────────────────────────────────────────┤
│  TABLE (Max Height: 600px)                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Profil  │ Username  │ Peran      │ Aksi               │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ [JD] J  │ @john     │ Admin      │ Ubah | Hapus       │ │
│  │ [MS] M  │ @mary     │ Admin      │ Ubah | Hapus       │ │
│  │ [BW] B  │ @bob      │ Admin      │ Ubah | Hapus       │ │
│  │ [LG] L  │ @lisa     │ Admin      │ Ubah | Hapus       │ │
│  │ [TH] T  │ @tom      │ Admin      │ Ubah | Hapus       │ │
│  │ [SK] S  │ @sara     │ Admin      │ Ubah | Hapus       │ │
│  │ [DM] D  │ @dave     │ Admin      │ Ubah | Hapus       │ │
│  │ [ER] E  │ @emma     │ Admin      │ Ubah | Hapus       │ │
│  │ [PJ] P  │ @paul     │ Admin      │ Ubah | Hapus       │ │
│  │ [NK] N  │ @nina     │ Admin      │ Ubah | Hapus       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                       ↕ Scroll │
├───────────────────────────────────────────────────────────────┤
│  PAGINATION                                                   │
│  Menampilkan 1 sampai 10 dari 50 pengguna                    │
│                                                               │
│  [◄]  [1]  [2]  [3]  ...  [5]  [►]                          │
│        ^^^                                                    │
│     Active page                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔍 Flow Diagram: Search Functionality

```
User Input
    │
    ▼
┌────────────────────────────┐
│  Ketik di Search Box       │
│  e.g., "john"              │
└────────────────────────────┘
    │
    ▼
┌────────────────────────────┐
│  useMemo() Triggered       │
│  Filter array users        │
└────────────────────────────┘
    │
    ▼
┌────────────────────────────┐
│  Check each user:          │
│  - nama includes "john"?   │
│  - username includes?      │
│  - role includes?          │
└────────────────────────────┘
    │
    ├─── Match Found ────┐
    │                    ▼
    │         ┌────────────────────┐
    │         │ Add to filtered    │
    │         │ array              │
    │         └────────────────────┘
    │                    │
    └─── No Match ───────┤
                         ▼
            ┌────────────────────────┐
            │  filteredUsers array   │
            │  e.g., [John Doe]      │
            └────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Reset to page 1       │
            │  setCurrentPage(1)     │
            └────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Re-render table       │
            │  Show filtered results │
            └────────────────────────┘
```

---

## 📄 Flow Diagram: Pagination

```
Initial Load
    │
    ▼
┌──────────────────────────────────┐
│  Calculate pagination            │
│  - totalPages = ⌈users/10⌉      │
│  - currentPage = 1               │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  Slice array for page 1          │
│  users.slice(0, 10)              │
│  → Show first 10 users           │
└──────────────────────────────────┘

User clicks "Next" or page number
    │
    ▼
┌──────────────────────────────────┐
│  Update currentPage state        │
│  setCurrentPage(2)               │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  Recalculate indices             │
│  - startIndex = (2-1) * 10 = 10  │
│  - endIndex = 10 + 10 = 20       │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  Slice array for page 2          │
│  users.slice(10, 20)             │
│  → Show users 11-20              │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  Re-render table                 │
│  Update pagination UI            │
│  - Highlight page 2              │
│  - Update counter text           │
└──────────────────────────────────┘
```

---

## 🎨 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENT STATE                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐
│  searchQuery     │      │  currentPage     │
│  ""              │      │  1               │
└──────────────────┘      └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────┐
│         useMemo: filteredUsers          │
│  Combines: users + searchQuery          │
│  Returns: filtered array                │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Pagination Calculations            │
│  - totalPages                           │
│  - startIndex                           │
│  - endIndex                             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         currentUsers                    │
│  Final array to render (10 items)      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         TABLE RENDER                    │
│  map(currentUsers)                      │
└─────────────────────────────────────────┘
```

---

## 🖼️ UI States

### State 1: Normal View (Has Data)

```
┌────────────────────────────────────────────────────────┐
│  🔍 Cari nama, username, atau role...            [X]  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Profil    │ Username   │ Peran      │ Aksi           │
├────────────────────────────────────────────────────────┤
│  [JD] John │ @john      │ [Admin]    │ Ubah | Hapus   │
│  [MS] Mary │ @mary      │ [Admin]    │ Ubah | Hapus   │
│  [BW] Bob  │ @bob       │ [Admin]    │ Ubah | Hapus   │
│  ...       │ ...        │ ...        │ ...            │
└────────────────────────────────────────────────────────┘

Menampilkan 1 sampai 10 dari 50 pengguna
[◄]  [1]  [2]  [3]  [4]  [5]  [►]
```

### State 2: Search Active (With Results)

```
┌────────────────────────────────────────────────────────┐
│  🔍 john                                          [X]  │
│  Menampilkan 2 dari 50 pengguna                       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Profil    │ Username   │ Peran      │ Aksi           │
├────────────────────────────────────────────────────────┤
│  [JD] John │ @john      │ [Admin]    │ Ubah | Hapus   │
│  [JJ] John │ @johnny    │ [Admin]    │ Ubah | Hapus   │
└────────────────────────────────────────────────────────┘

(No pagination - only 2 results)
```

### State 3: Search Active (No Results)

```
┌────────────────────────────────────────────────────────┐
│  🔍 xyz123                                        [X]  │
│  Menampilkan 0 dari 50 pengguna                       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                                                        │
│                      [👥 Icon]                        │
│                                                        │
│       Tidak ada pengguna yang cocok                   │
│       dengan pencarian.                               │
│                                                        │
│       Coba kata kunci lain.                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### State 4: Empty State (No Users at All)

```
┌────────────────────────────────────────────────────────┐
│  🔍 Cari nama, username, atau role...            [X]  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                                                        │
│                      [👥 Icon]                        │
│                                                        │
│           Belum ada data pengguna.                    │
│                                                        │
│       Tambahkan pengguna baru untuk memulai.          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Desktop (≥640px)

```
┌─────────────────────────────────────────────────────────┐
│  Menampilkan 1 sampai 10 dari 50 pengguna              │
│                                                         │
│  [◄]  [1]  [2]  [3]  ...  [5]  [►]                    │
│       ^^^                                               │
│    Active (colored)                                     │
└─────────────────────────────────────────────────────────┘
```

### Mobile (<640px)

```
┌───────────────────────────────────────────────────┐
│  [Sebelumnya]              [Selanjutnya]         │
│   (disabled)                 (active)            │
└───────────────────────────────────────────────────┘
```

---

## 🎯 Pagination Logic Table

| Total Users | Items/Page | Total Pages | Pages Shown |
|-------------|------------|-------------|-------------|
| 5           | 10         | 1           | [1] |
| 10          | 10         | 1           | [1] |
| 15          | 10         | 2           | [1] [2] |
| 50          | 10         | 5           | [1] [2] [3] [4] [5] |
| 100         | 10         | 10          | [1] [2] [3] ... [10] |
| 200         | 10         | 20          | [1] [2] [3] ... [20] |

---

## 🎨 Color Coding (Dark Mode Support)

### Search Bar
```css
Light:  bg-white, border-gray-300, text-gray-900
Dark:   bg-gray-800, border-gray-600, text-white
```

### Active Page Number
```css
Light:  bg-indigo-50, border-indigo-500, text-indigo-600
Dark:   bg-indigo-900/30, border-indigo-700, text-indigo-400
```

### Disabled Button
```css
opacity: 0.5
cursor: not-allowed
```

---

## 🔄 Interaction Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                     │
└─────────────────────────────────────────────────────────┘

1. Type in Search
   │
   ├─ Input changes → searchQuery updates
   ├─ useMemo recalculates → filteredUsers
   ├─ currentPage resets to 1
   └─ Table re-renders

2. Click Page Number
   │
   ├─ currentPage updates
   ├─ Slice indices recalculated
   └─ Table re-renders with new slice

3. Click Next/Previous
   │
   ├─ currentPage ± 1
   ├─ Check bounds (min: 1, max: totalPages)
   └─ Table re-renders

4. Click Clear (X)
   │
   ├─ searchQuery = ""
   ├─ filteredUsers = all users
   └─ Back to full list
```

---

## 📊 Performance Comparison

### Before (100 Users)
```
DOM Elements:
├─ Table rows: 100
├─ Cells: 400 (100 × 4)
└─ Total: ~500+ elements

Scroll:
└─ Full page height (~5000px)
```

### After (100 Users)
```
DOM Elements:
├─ Table rows: 10 (per page)
├─ Cells: 40 (10 × 4)
└─ Total: ~50 elements

Container:
├─ Max height: 600px
└─ Internal scroll
```

**Result**: 90% DOM reduction! 🚀

---

## 💡 Implementation Tips

1. **useMemo Dependencies**
   ```tsx
   useMemo(() => {...}, [users, searchQuery])
   // Recalculate only when these change
   ```

2. **Reset Page on Search**
   ```tsx
   useMemo(() => {
     setCurrentPage(1);
   }, [searchQuery]);
   ```

3. **Pagination Bounds**
   ```tsx
   Math.max(prev - 1, 1)           // Prev button
   Math.min(prev + 1, totalPages)  // Next button
   ```

4. **Empty State Handling**
   ```tsx
   {currentUsers.length === 0 ? (
     searchQuery ? "No results" : "No users"
   ) : (...)}
   ```

---

**Visual Guide Complete!** 🎉

Tabel sekarang memiliki:
✅ Batasan tinggi (600px)
✅ Pagination (10 per halaman)
✅ Search real-time
✅ Responsive design
✅ Better performance
