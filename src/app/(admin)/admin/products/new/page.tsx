import { ProductForm } from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Products
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Product</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">Add a product to The Refined Edit</p>
      </div>
      <ProductForm />
    </div>
  )
}
