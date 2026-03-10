/**
 * Auto-admin: checks if an email should be auto-promoted to admin role.
 * Configured via ADMIN_EMAILS env var (comma-separated list of emails).
 */

const getAdminEmails = (): string[] => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

export function shouldBeAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}
