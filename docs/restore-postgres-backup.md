# Restoring `data_backup.sql` into the Prisma-managed Postgres database

This guide walks through importing the bundled `data_backup.sql` file into the remote Postgres instance that Prisma uses (for example, a database hosted via Prisma Data Platform or another managed provider).

---

## 1. Prerequisites

- Ensure you have the Postgres client tools installed locally. On Windows you can get them from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/). You only need `psql` for this process.
- Confirm you have a **connection string** for the remote database. In this project it is typically stored in the `.env` file as `DATABASE_URL`. The format is:
  ```
  postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require
  ```
- Make a fresh backup of the remote database before importing, in case you need to roll back.

> **Heads-up:** The SQL dump recreates the Prisma-managed tables (`_prisma_migrations`, `pengguna`, `surat`, `lampiran`). Importing will overwrite any existing rows with the same primary keys.

---

## 2. Prepare the SQL dump (optional)

The dump begins with a `\restrict …` guard that is only understood by `psql` \>= 17. If your local `psql` is older, comment that line out or delete it before running the import.

```
-- \restrict … (remove or comment out if your psql version complains)
```

No other changes are required.

---

## 3. Import using `psql`

1. Open **Windows PowerShell** in the project root.
2. Export the database password so that `psql` can authenticate (replace with your actual password):
   ```powershell
   $Env:PGPASSWORD = 'super-secret-password'
   ```
3. Run the restore command, substituting host, port, user, and database from your `DATABASE_URL`:
   ```powershell
   psql -h your-db-host.supabase.co -p 5432 -U your_username -d your_database -f "data_backup.sql" --set ON_ERROR_STOP=on
   ```
   - The `--set ON_ERROR_STOP=on` flag makes `psql` stop immediately if any statement fails.
   - If your provider requires SSL (most managed services do), either ensure `sslmode=require` is already present in the connection string or add `?sslmode=require` to the database name in the command.
4. Clear the password from your environment once the import succeeds:
   ```powershell
   Remove-Item Env:PGPASSWORD
   ```

If you encounter encoding or permission issues, double-check that the database user has rights to create and insert into the listed tables.

---

## 4. Post-restore verification

Use Prisma CLI to confirm the schema matches and the data is accessible:

```powershell
npx prisma migrate status
npx prisma studio
```

- `migrate status` confirms Prisma migrations are in sync with the remote schema.
- `prisma studio` offers a quick way to inspect the `pengguna`, `surat`, and `lampiran` rows.

You can also run application-level smoke tests (e.g., log in with an imported admin account) to ensure everything behaves as expected.

---

## 5. Ongoing maintenance tips

- Keep the `data_backup.sql` file updated after significant data changes so restores stay relevant.
- For automated restores (CI/CD), consider loading the file via a script (Node.js, Python, or shell) that wraps the `psql` command and reads the connection string from `DATABASE_URL`.
- Always sanitize sensitive data (hashed passwords, personal info) before sharing backups externally.

---

Once these steps complete without errors, the Prisma-connected online Postgres should contain the same data as described in `data_backup.sql`.
