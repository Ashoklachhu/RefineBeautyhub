import { adminGetProducts } from '@/app/actions/admin'
import { ProductsManager } from '@/components/admin/ProductsManager'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await adminGetProducts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
          Manage your curated product catalogue — {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>
      <ProductsManager products={products} />
    </div>
  )
}
