import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/admin-auth';
import AdminNav from '@/components/admin/AdminNav';

export const metadata = {
  title: 'IntroCar Admin',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const isLoginPage = false; // Will be handled by checking pathname

  // Check if authenticated (skip for login page)
  const isValid = validateSession(sessionToken);

  return (
    <div className="min-h-screen bg-gray-50">
      {isValid && <AdminNav />}
      <main className={isValid ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
}
