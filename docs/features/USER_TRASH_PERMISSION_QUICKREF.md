# User Trash Permission - Quick Reference

## 🎯 TL;DR
Hanya **SUPER_ADMIN** yang bisa restore dan delete permanent akun pengguna di trash.

## 🔐 Permission Matrix

| Action | SUPER_ADMIN | ADMIN |
|--------|-------------|-------|
| ✅ View deleted users | ✅ | ✅ |
| ✅ Select users (checkbox) | ✅ | ❌ |
| ✅ Restore user | ✅ | ❌ |
| ✅ Delete permanent user | ✅ | ❌ |
| ✅ Bulk restore users | ✅ | ❌ |
| ✅ Bulk delete users | ✅ | ❌ |

## 📦 New Server Actions

```typescript
// Restore multiple users
await restoreBulkUsers(['user-id-1', 'user-id-2']);

// Delete permanent multiple users
await deleteBulkUsersPermanently(['user-id-1', 'user-id-2']);
```

## 🧩 Component Props

### TrashActionButtons
```tsx
<TrashActionButtons 
  entityId={user.id}
  entityType="pengguna"
  entityName={user.nama}
  userRole={userRole} // 👈 NEW
/>
```

### BulkTrashActionsToolbar
```tsx
<BulkTrashActionsToolbar
  selectedCount={selectedCount}
  selectedIds={selectedArray}
  onClearSelection={clearSelection}
  entityType="pengguna"
  userRole={userRole} // 👈 NEW
/>
```

### TrashUsersWithPagination
```tsx
<TrashUsersWithPagination
  deletedUsers={deletedUsers}
  userRole={userRole} // 👈 NEW
/>
```

## 🎨 UI Behavior

### SUPER_ADMIN sees:
```
☑️ Checkbox (select all)
☑️ Row checkboxes
[Pulihkan] [Hapus Permanen] buttons
Bulk toolbar when items selected
```

### ADMIN sees:
```
—  (no checkbox)
—  (no row checkboxes)
"Hanya Super Admin" text
No bulk toolbar
```

## 🛡️ Security

### Frontend (UI)
- Checkboxes hidden
- Action buttons hidden
- Toolbar hidden

### Backend (Critical)
- All actions validate `role === 'SUPER_ADMIN'`
- Return `{ error: 'Gagal: Anda tidak memiliki hak akses.' }`
- Self-delete protection

## 📍 Quick Test

```bash
# Login as SUPER_ADMIN → Can manage users ✅
# Login as ADMIN → Cannot manage users ❌
```

## 📂 Modified Files

```
✏️ src/app/(app)/admin/actions.ts (2 new functions)
✏️ src/app/(app)/admin/trash/page.tsx
✏️ src/app/components/TrashActionButtons.tsx
✏️ src/app/components/BulkTrashActionsToolbar.tsx
✏️ src/app/components/TrashUsersWithPagination.tsx
```

---
**Last Updated:** 2025-01-21
