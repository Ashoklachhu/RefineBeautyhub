import { adminGetProductById } from '@/app/actions/admin'
import { ProductForm } from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await adminGetProductById(id)
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Products
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Product</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
