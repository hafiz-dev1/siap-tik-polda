# Visual Guide: Fitur Sorting Tabel Arsip Surat

## 📊 Visualisasi Header Table

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TABEL ARSIP SURAT                                  │
├──────┬─────────────┬─────────────┬─────────────┬────────────┬───────────────┤
│ No.↑ │ Perihal     │ Dari        │ Kepada      │ Diterima   │ Isi Disposisi │
│      │ (sortable)  │ (sortable)  │ (sortable)  │ (sortable) │ (sortable)    │
├──────┼─────────────┼─────────────┼─────────────┼────────────┼───────────────┤
│  1   │ Undangan... │ Polda Metro │ TIK Polda   │ 2025-01-15 │ Harap diproses│
│  2   │ Surat Edar..│ TIK Polda   │ Kabid...    │ 2025-01-14 │ Untuk diketa..│
│  3   │ Nota Dinas..│ Kasubbid    │ Staff TIK   │ 2025-01-16 │ Segera ditind.│
└──────┴─────────────┴─────────────┴─────────────┴────────────┴───────────────┘

🖱️ Klik header untuk sort
↑  = Ascending (naik)
↓  = Descending (turun)
```

---

## 🔄 State Transition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SORTING STATE FLOW                       │
└─────────────────────────────────────────────────────────────┘

Initial State:
  sortField: 'none'
  sortOrder: 'asc'
  icon: ''

         │
         │ User clicks "Perihal"
         ↓

First Click (Perihal ASC):
  sortField: 'perihal'
  sortOrder: 'asc'
  icon: '↑'
  Result: A → Z

         │
         │ User clicks "Perihal" again
         ↓

Second Click (Perihal DESC):
  sortField: 'perihal'
  sortOrder: 'desc'
  icon: '↓'
  Result: Z → A

         │
         │ User clicks "Dari"
         ↓

Click Different Column:
  sortField: 'dari'      ← Changed
  sortOrder: 'asc'       ← Reset to ASC
  icon on Perihal: ''    ← Previous icon removed
  icon on Dari: '↑'      ← New icon appears
  Result: Sort by "Dari" A → Z
```

---

## 🎯 User Interaction Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                   USER INTERACTION FLOW                          │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  User arrives   │
│   at Arsip      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Table shows    │
│  default order  │
│  (by createdAt) │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  User hovers over "Perihal" header │
│  → Cursor changes to pointer       │
│  → Background changes (hover)      │
│  → Tooltip: "Klik untuk..."        │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────┐
│  User clicks    │
│   "Perihal"     │
└────────┬────────┘
         │
         ↓
┌──────────────────────────┐
│  handleSort('perihal')   │
│  → sortField = 'perihal' │
│  → sortOrder = 'asc'     │
│  → Icon appears: ↑       │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  useMemo recomputes      │
│  → Sorts data A-Z        │
│  → Returns sortedData    │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Animation triggers      │
│  → opacity: 0 → 1        │
│  → translateY: 2px → 0   │
│  → Duration: 220ms       │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Table re-renders with   │
│  sorted data displayed   │
│  → User sees result      │
└──────────────────────────┘
```

---

## 📋 Sort Algorithm Visualization

### String Sorting (Perihal, Dari, Kepada, Isi Disposisi)

```
Before Sort (unsorted):
┌─────────────────────┐
│ Undangan Rapat      │
│ Nota Dinas          │
│ Surat Edaran        │
│ Agenda Kegiatan     │
└─────────────────────┘

After Sort ASC (↑):
┌─────────────────────┐
│ Agenda Kegiatan     │  ← A comes first
│ Nota Dinas          │  ← N
│ Surat Edaran        │  ← S
│ Undangan Rapat      │  ← U comes last
└─────────────────────┘

After Sort DESC (↓):
┌─────────────────────┐
│ Undangan Rapat      │  ← U comes first
│ Surat Edaran        │  ← S
│ Nota Dinas          │  ← N
│ Agenda Kegiatan     │  ← A comes last
└─────────────────────┘
```

### Date Sorting (Diterima)

```
Before Sort (unsorted):
┌─────────────────────┐
│ 2025-01-15 08:00    │
│ 2025-01-14 10:30    │
│ 2025-01-16 14:20    │
│ 2025-01-13 09:15    │
└─────────────────────┘

After Sort ASC (↑):
┌─────────────────────┐
│ 2025-01-13 09:15    │  ← Oldest
│ 2025-01-14 10:30    │
│ 2025-01-15 08:00    │
│ 2025-01-16 14:20    │  ← Newest
└─────────────────────┘

After Sort DESC (↓):
┌─────────────────────┐
│ 2025-01-16 14:20    │  ← Newest
│ 2025-01-15 08:00    │
│ 2025-01-14 10:30    │
│ 2025-01-13 09:15    │  ← Oldest
└─────────────────────┘
```

---

## 🎨 UI Component Breakdown

### Header Cell Structure

```tsx
┌─────────────────────────────────────────────────┐
│  <th className="sortable">                      │
│    ┌─────────────────────────────────────────┐ │
│    │ <div class="flex justify-between">      │ │
│    │   ┌──────────────┐  ┌─────────────┐    │ │
│    │   │ <span>       │  │ <span>      │    │ │
│    │   │  Perihal     │  │  ↑          │    │ │
│    │   │ </span>      │  │ </span>     │    │ │
│    │   └──────────────┘  └─────────────┘    │ │
│    │      Label             Icon             │ │
│    │ </div>                                  │ │
│    └─────────────────────────────────────────┘ │
│  </th>                                          │
└─────────────────────────────────────────────────┘

States:
┌─────────────────────────────────────────┐
│ DEFAULT (no hover, no active)           │
│ bg: gray-100                            │
│ cursor: default                         │
│ icon: hidden                            │
├─────────────────────────────────────────┤
│ HOVER (mouse over, not active)          │
│ bg: gray-200 ← changes                  │
│ cursor: pointer ← changes               │
│ icon: hidden                            │
├─────────────────────────────────────────┤
│ ACTIVE ASC (clicked, ascending)         │
│ bg: gray-100                            │
│ cursor: pointer                         │
│ icon: ↑ (visible in indigo-600)        │
├─────────────────────────────────────────┤
│ ACTIVE DESC (clicked again, descending) │
│ bg: gray-100                            │
│ cursor: pointer                         │
│ icon: ↓ (visible in indigo-600)        │
└─────────────────────────────────────────┘
```

---

## 🔢 Performance Metrics

### Without Memoization (BAD ❌)

```
User action: Click sort
  ↓
Component re-renders
  ↓
sortData() runs ← ⚠️ EVERY RENDER
  ↓ (100 items)
Time: ~50ms ← SLOW
  ↓
Sort again on unrelated state change
  ↓ (100 items)
Time: ~50ms ← WASTED
  ↓
Total: 100ms+ for 2 renders
```

### With Memoization (GOOD ✅)

```
User action: Click sort
  ↓
Component re-renders
  ↓
useMemo checks dependencies
  ↓
[data, sortField, sortOrder] changed? → YES
  ↓
sortData() runs
  ↓ (100 items)
Time: ~50ms
  ↓
Unrelated state change (e.g., modal open)
  ↓
useMemo checks dependencies
  ↓
[data, sortField, sortOrder] changed? → NO
  ↓
Return cached result ← 🚀 INSTANT
  ↓
Time: <1ms
  ↓
Total: ~51ms for 2 renders (49ms saved!)
```

---

## 🧩 Component Hierarchy

```
┌───────────────────────────────────────────────────────────┐
│ page.tsx (Server Component)                               │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ SuratDashboardClient                                  │ │
│ │ ┌───────────────────────────────────────────────────┐ │ │
│ │ │ OptimizedSuratDashboardClientV2                   │ │ │
│ │ │                                                     │ │ │
│ │ │ Hooks:                                             │ │ │
│ │ │ ├─ useSuratFilters()                              │ │ │
│ │ │ │    └─ filteredSurat                             │ │ │
│ │ │ │                                                   │ │ │
│ │ │ ├─ useSuratSorting(filteredSurat) ← **NEW**       │ │ │
│ │ │ │    ├─ sortedData                                │ │ │
│ │ │ │    ├─ handleSort                                │ │ │
│ │ │ │    └─ getSortIcon                               │ │ │
│ │ │ │                                                   │ │ │
│ │ │ └─ usePagination(sortedData)                      │ │ │
│ │ │      └─ currentPageData                           │ │ │
│ │ │                                                     │ │ │
│ │ │ ┌─────────────────────────────────────────────┐   │ │ │
│ │ │ │ SuratTable                                  │   │ │ │
│ │ │ │  Props:                                     │   │ │ │
│ │ │ │  - suratData={currentPageData}              │   │ │ │
│ │ │ │  - onSort={handleSort}        ← **NEW**    │   │ │ │
│ │ │ │  - getSortIcon={getSortIcon}  ← **NEW**    │   │ │ │
│ │ │ │                                              │   │ │ │
│ │ │ │  Renders:                                    │   │ │ │
│ │ │ │  - Table Header (with sorting icons)        │   │ │ │
│ │ │ │  - Table Body (sorted data)                 │   │ │ │
│ │ │ └─────────────────────────────────────────────┘   │ │ │
│ │ └───────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## 🎭 Before vs After Comparison

### BEFORE (No Sorting)

```
Header:
┌──────┬─────────┬──────┬────────┬──────────┬─────────┐
│ No.  │ Perihal │ Dari │ Kepada │ Diterima │ Isi... │
└──────┴─────────┴──────┴────────┴──────────┴─────────┘
       ↑ Static, tidak bisa di-klik

User Experience:
❌ Tidak bisa sort data
❌ Harus scroll untuk cari data
❌ Tidak efisien untuk banyak data
```

### AFTER (With Sorting)

```
Header:
┌──────┬─────────┬──────┬────────┬──────────┬─────────┐
│ No.↑ │ Perihal │ Dari │ Kepada │ Diterima │ Isi...  │
└──────┴─────────┴──────┴────────┴──────────┴─────────┘
       ↑ Interactive, hover effect, icon indicator

User Experience:
✅ Klik untuk sort
✅ Visual feedback (↑/↓)
✅ Cepat temukan data
✅ Intuitive UX
```

---

## 💾 Memory & State Management

```
┌────────────────────────────────────────────────────┐
│           STATE MANAGEMENT DIAGRAM                 │
└────────────────────────────────────────────────────┘

Component State:
┌─────────────────────────────────────────────────┐
│ useSuratSorting                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ sortField: SortField                        │ │
│ │   - Type: 'none' | 'perihal' | 'dari' | ... │ │
│ │   - Default: 'none'                         │ │
│ │   - When changes: ← user clicks header      │ │
│ ├─────────────────────────────────────────────┤ │
│ │ sortOrder: SortOrder                        │ │
│ │   - Type: 'asc' | 'desc'                    │ │
│ │   - Default: 'asc'                          │ │
│ │   - When changes: ← user clicks same header │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Derived State (Memoized):
┌─────────────────────────────────────────────────┐
│ sortedData = useMemo(() => {                    │
│   if (sortField === 'none') return data;        │
│   return [...data].sort(compareFn);             │
│ }, [data, sortField, sortOrder]);               │
│                                                  │
│ Dependencies:                                    │
│ - data: when filter/search changes              │
│ - sortField: when user clicks header            │
│ - sortOrder: when user toggles ASC/DESC         │
│                                                  │
│ Re-computation ONLY when dependencies change!   │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Code Deep Dive

### localeCompare Explanation

```typescript
// WITHOUT locale (wrong for Indonesian):
"Äpfel".localeCompare("Banane")  // May not work correctly

// WITH locale (correct for Indonesian):
a.perihal.localeCompare(b.perihal, 'id', { 
  sensitivity: 'base'  // Case-insensitive
})

Examples:
"agenda".localeCompare("Agenda", 'id', { sensitivity: 'base' })
// → 0 (equal, case-insensitive)

"Nota".localeCompare("Surat", 'id', { sensitivity: 'base' })
// → -1 (Nota < Surat)

"Zulu".localeCompare("Alpha", 'id', { sensitivity: 'base' })
// → 1 (Zulu > Alpha)
```

### Date Comparison

```typescript
// Convert to timestamp for comparison
new Date("2025-01-15").getTime()  // → 1736899200000
new Date("2025-01-16").getTime()  // → 1736985600000

// Comparison
1736899200000 - 1736985600000  // → -86400000 (negative, so 15 < 16)
```

---

## 📱 Responsive Behavior

```
Desktop (≥1024px):
┌─────────────────────────────────────────────────────┐
│ No. │ Perihal       │ Dari    │ Kepada  │ Diterima │
│  ↑  │ (full width)  │ (full)  │ (full)  │ (full)   │
└─────────────────────────────────────────────────────┘
All columns visible, full sort functionality

Tablet (768px - 1023px):
┌──────────────────────────────────────────────────┐
│ No. │ Perihal   │ Dari  │ Kepada │ Diterima    │
│  ↑  │ (wrapped) │ (sm)  │ (sm)   │ (sm)        │
└──────────────────────────────────────────────────┘
Horizontal scroll enabled, all features work

Mobile (< 768px):
┌────────────────────────────────┐
│ No. │ Perihal       │ Actions │
│  ↑  │ (most info)   │ [...]   │
└────────────────────────────────┘
Horizontal scroll required, sorting still works
```

---

**END OF VISUAL GUIDE**

Happy Sorting! 🎉
