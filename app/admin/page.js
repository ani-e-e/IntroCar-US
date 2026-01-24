import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/admin-auth';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

async function getProductStats() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'json', 'products.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(data);

    const inStock = products.filter(p => p.inStock).length;
    const outOfStock = products.filter(p => !p.inStock).length;
    const categories = [...new Set(products.map(p => p.categories).filter(Boolean))].length;

    return {
      total: products.length,
      inStock,
      outOfStock,
      categories,
    };
  } catch (error) {
    console.error('Error loading product stats:', error);
    return { total: 0, inStock: 0, outOfStock: 0, categories: 0 };
  }
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!validateSession(sessionToken)) {
    redirect('/admin/login');
  }

  const stats = await getProductStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500">In Stock</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.inStock.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Categories</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.categories}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">View Products</h3>
          <p className="text-sm text-gray-500 mt-1">Browse and edit individual products</p>
        </Link>

        <Link
          href="/admin/upload"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="text-3xl mb-3">📤</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Upload CSV</h3>
          <p className="text-sm text-gray-500 mt-1">Bulk update prices, stock, weights</p>
        </Link>

        <Link
          href="/admin/sync"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="text-3xl mb-3">🔄</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Sync to Magento</h3>
          <p className="text-sm text-gray-500 mt-1">Push updates to Magento store</p>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">US Site Data</span>
            <span className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Loaded
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Magento Connection</span>
            <span className="flex items-center text-yellow-600">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Awaiting Token
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Last Sync</span>
            <span className="text-gray-500">Never</span>
          </div>
        </div>
      </div>
    </div>
  );
}
