import { notFound } from 'next/navigation'
import { adminGetInquiryDetail } from '@/app/actions/admin'
import { InquiryDetail } from '@/components/admin/InquiryDetail'
import { getServerUser } from '@/lib/auth/get-server-user'

export const dynamic = 'force-dynamic'

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ inquiry, notes }, user] = await Promise.all([
    adminGetInquiryDetail(id),
    getServerUser(),
  ])

  if (!inquiry) notFound()

  return <InquiryDetail inquiry={inquiry} notes={notes} adminId={user?.id ?? ''} />
}
