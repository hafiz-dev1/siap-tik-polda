# 🧪 Testing Guide - User Trash Permission

## 📋 Prerequisites

### Test Accounts Required
```
1. SUPER_ADMIN account
   - Username: [your-superadmin]
   - Password: [password]

2. ADMIN account (regular)
   - Username: [your-admin]
   - Password: [password]

3. Test users (for deletion)
   - Create 3-5 test user accounts
   - These will be deleted and restored during testing
```

---

## 🎯 Test Scenarios

### Scenario 1: SUPER_ADMIN - Full Access

#### Step 1: Login as SUPER_ADMIN
```
1. Navigate to: http://localhost:3000/login
2. Login with SUPER_ADMIN credentials
3. Verify login successful
```

#### Step 2: Prepare Test Data
```
1. Navigate to: /admin/users
2. Create 3 test users:
   - User Test 1
   - User Test 2
   - User Test 3
3. Delete all 3 users (soft delete)
```

#### Step 3: Access Trash Page
```
1. Navigate to: /admin/trash
2. ✅ Verify: You see "Sampah Akun Pengguna" section
3. ✅ Verify: You see the 3 deleted users
```

#### Step 4: Test Checkbox Visibility
```
1. Look at the user list table
2. ✅ Verify: Checkbox appears in header row
3. ✅ Verify: Checkbox appears in each user row
4. ✅ Verify: Checkboxes are clickable
```

#### Step 5: Test Single User Selection
```
1. Click checkbox on "User Test 1"
2. ✅ Verify: Checkbox becomes checked
3. ✅ Verify: Bulk toolbar appears at top
4. ✅ Verify: Toolbar shows "1 akun dipilih"
```

#### Step 6: Test Select All
```
1. Click checkbox in header row
2. ✅ Verify: All user checkboxes become checked
3. ✅ Verify: Toolbar shows "3 akun dipilih"
4. Click header checkbox again
5. ✅ Verify: All checkboxes become unchecked
6. ✅ Verify: Toolbar disappears
```

#### Step 7: Test Single User Restore
```
1. Find "User Test 1" in the list
2. ✅ Verify: "Pulihkan" button is visible
3. Click "Pulihkan" button
4. ✅ Verify: Confirmation modal appears
5. Click "Ya, Pulihkan"
6. ✅ Verify: Success toast appears
7. ✅ Verify: User disappears from trash
8. Navigate to /admin/users
9. ✅ Verify: "User Test 1" is back in active users
```

#### Step 8: Test Single User Delete Permanent
```
1. Navigate back to /admin/trash
2. Find "User Test 2" in the list
3. ✅ Verify: "Hapus Permanen" button is visible
4. Click "Hapus Permanen" button
5. ✅ Verify: Warning modal appears with red warning
6. Click "Ya, Hapus Permanen"
7. ✅ Verify: Success toast appears
8. ✅ Verify: User disappears from trash
9. Check database
10. ✅ Verify: User is completely deleted (not in trash anymore)
```

#### Step 9: Test Bulk Restore
```
1. Delete 2 more users from /admin/users
2. Navigate to /admin/trash
3. Select both users using checkboxes
4. ✅ Verify: Bulk toolbar appears
5. Click "Pulihkan 2 akun" button
6. ✅ Verify: Confirmation modal appears
7. Click "Ya, Pulihkan 2 akun"
8. ✅ Verify: Success toast appears
9. ✅ Verify: Both users disappear from trash
10. Navigate to /admin/users
11. ✅ Verify: Both users are back in active list
```

#### Step 10: Test Bulk Delete Permanent
```
1. Delete 2 users again
2. Navigate to /admin/trash
3. Select both users
4. Click "Hapus Permanen" button in toolbar
5. ✅ Verify: Red warning modal appears
6. Click "Ya, Hapus Permanen 2 akun"
7. ✅ Verify: Success toast appears
8. ✅ Verify: Users disappear from trash
9. ✅ Verify: Users completely deleted from database
```

---

### Scenario 2: ADMIN - Read-Only Access

#### Step 1: Login as ADMIN (Regular)
```
1. Logout from SUPER_ADMIN
2. Login with ADMIN credentials
3. Verify login successful
```

#### Step 2: Prepare Test Data (as SUPER_ADMIN)
```
1. Switch to SUPER_ADMIN account
2. Delete 2-3 test users
3. Switch back to ADMIN account
```

#### Step 3: Access Trash Page
```
1. Navigate to: /admin/trash
2. ✅ Verify: You can see "Sampah Akun Pengguna" section
3. ✅ Verify: You can see deleted users in the list
```

#### Step 4: Test Checkbox Visibility
```
1. Look at the user list table header
2. ✅ Verify: NO checkbox in header
3. ✅ Verify: Shows "—" symbol instead
4. Look at each user row
5. ✅ Verify: NO checkbox in rows
6. ✅ Verify: Shows "—" symbol instead
```

#### Step 5: Test Action Buttons
```
1. Look at each user row's "Aksi" column
2. ✅ Verify: NO "Pulihkan" button
3. ✅ Verify: NO "Hapus Permanen" button
4. ✅ Verify: Shows text "Hanya Super Admin"
```

#### Step 6: Test Bulk Toolbar
```
1. Try clicking where checkboxes would be
2. ✅ Verify: Nothing happens (no checkbox to click)
3. ✅ Verify: Bulk toolbar NEVER appears
4. ✅ Verify: No bulk action buttons visible
```

#### Step 7: Test Direct Action (Security)
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to call action directly:
   ```javascript
   // This should fail
   fetch('/api/...', { method: 'POST' })
   ```
4. ✅ Verify: Action is rejected
5. ✅ Verify: Error message shown
```

---

### Scenario 3: Edge Cases & Security

#### Test 1: Self-Deletion Protection
```
1. Login as SUPER_ADMIN
2. Navigate to /admin/users
3. Soft-delete your own account (if possible)
4. Navigate to /admin/trash
5. Try to delete permanently your own account
6. ✅ Verify: Error message: "Anda tidak dapat menghapus akun Anda sendiri"
```

#### Test 2: Session Expiration
```
1. Login as SUPER_ADMIN
2. Navigate to /admin/trash
3. Clear cookies/session storage
4. Try to restore a user
5. ✅ Verify: Redirected to login or error shown
```

#### Test 3: Invalid User ID
```
1. Login as SUPER_ADMIN
2. Try to restore non-existent user ID
3. ✅ Verify: Error message shown
4. ✅ Verify: No crash/error in console
```

#### Test 4: Empty Bulk Selection
```
1. Login as SUPER_ADMIN
2. Navigate to /admin/trash
3. Don't select any users
4. ✅ Verify: Bulk toolbar does NOT appear
```

#### Test 5: Profile Picture Cleanup
```
1. Create user with profile picture
2. Delete user (soft delete)
3. Delete permanently
4. Check public/uploads folder
5. ✅ Verify: Profile picture file is deleted
```

---

## 📊 Test Results Template

### Date: _____________
### Tester: _____________

| Test Case | Expected Result | Actual Result | Status | Notes |
|-----------|----------------|---------------|--------|-------|
| S1.4: SUPER_ADMIN Checkbox Visible | ✅ Visible | | ⬜ Pass / ⬜ Fail | |
| S1.7: Single User Restore | ✅ Success | | ⬜ Pass / ⬜ Fail | |
| S1.8: Single Delete Permanent | ✅ Success | | ⬜ Pass / ⬜ Fail | |
| S1.9: Bulk Restore | ✅ Success | | ⬜ Pass / ⬜ Fail | |
| S1.10: Bulk Delete Permanent | ✅ Success | | ⬜ Pass / ⬜ Fail | |
| S2.4: ADMIN No Checkbox | ✅ Hidden | | ⬜ Pass / ⬜ Fail | |
| S2.5: ADMIN No Buttons | ✅ "Hanya Super Admin" | | ⬜ Pass / ⬜ Fail | |
| S2.6: ADMIN No Bulk Toolbar | ✅ Hidden | | ⬜ Pass / ⬜ Fail | |
| S3.1: Self-Delete Protection | ✅ Error | | ⬜ Pass / ⬜ Fail | |
| S3.5: Profile Picture Cleanup | ✅ Deleted | | ⬜ Pass / ⬜ Fail | |

---

## 🔍 Visual Verification Checklist

### SUPER_ADMIN View
```
Expected UI:
┌────────────────────────────────────────────────────┐
│ Sampah Akun Pengguna                    3 akun    │
├────────────────────────────────────────────────────┤
│ [✓] │ Nama      │ Role  │ Deleted  │ Aksi        │
├────────────────────────────────────────────────────┤
│ [✓] │ User 1    │ Admin │ 5m ago   │ [Pulihkan]  │
│     │           │       │          │ [Hapus]     │
├────────────────────────────────────────────────────┤
│ [ ] │ User 2    │ Admin │ 10m ago  │ [Pulihkan]  │
│     │           │       │          │ [Hapus]     │
└────────────────────────────────────────────────────┘

When selected:
┌────────────────────────────────────────────────────┐
│ ✓ 2 akun dipilih   [Batal]                        │
│                     [Pulihkan 2] [Hapus Permanen] │
└────────────────────────────────────────────────────┘
```

### ADMIN View
```
Expected UI:
┌────────────────────────────────────────────────────┐
│ Sampah Akun Pengguna                    3 akun    │
├────────────────────────────────────────────────────┤
│  —  │ Nama      │ Role  │ Deleted  │ Aksi        │
├────────────────────────────────────────────────────┤
│  —  │ User 1    │ Admin │ 5m ago   │ Hanya Super │
│     │           │       │          │ Admin       │
├────────────────────────────────────────────────────┤
│  —  │ User 2    │ Admin │ 10m ago  │ Hanya Super │
│     │           │       │          │ Admin       │
└────────────────────────────────────────────────────┘

No bulk toolbar ever appears!
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Checkboxes not hiding for ADMIN
**Solution:** 
- Check if `userRole` prop is passed correctly
- Verify `isSuperAdmin` check in TrashUsersWithPagination
- Check session is properly retrieved in page.tsx

### Issue 2: Bulk actions not working
**Solution:**
- Verify new functions are imported in BulkTrashActionsToolbar
- Check conditional logic for entityType
- Ensure userIds array is passed correctly

### Issue 3: Action buttons still visible for ADMIN
**Solution:**
- Check `userRole` prop in TrashActionButtons
- Verify `canManageUsers` logic
- Ensure entityType is 'pengguna'

### Issue 4: Error messages not showing
**Solution:**
- Check toast is imported and configured
- Verify error object has `error` property
- Check console for backend errors

---

## 📝 Notes for Testers

1. **Always test with fresh browser session** to avoid cached data
2. **Check browser console** for any errors during testing
3. **Document any unexpected behavior** even if test passes
4. **Test on multiple browsers** (Chrome, Firefox, Edge)
5. **Test on mobile viewport** for responsive design
6. **Clear cache** between SUPER_ADMIN and ADMIN tests

---

## ✅ Sign-off

**Tested by:** _______________  
**Date:** _______________  
**Overall Status:** ⬜ PASS / ⬜ FAIL  
**Comments:** _______________

---

**Last Updated:** 2025-01-21  
**Version:** 1.0.0
