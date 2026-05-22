'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Shield, User, ShieldCheck, Eye, UserPlus } from 'lucide-react'
import { adminUpdateUserRole, adminToggleUserActive } from '@/app/actions/admin'
import { AdminBadge } from './AdminBadge'
import { UserDetailPanel } from './UserDetailPanel'
import { AddUserPanel } from './AddUserPanel'
import type { Profile, UserRole } from '@/types/database'

interface UsersManagerProps {
  users: Profile[]
  total: number
  page:  number
}

const roleColor: Record<UserRole, 'gray' | 'blue' | 'gold'> = {
  client: 'gray', staff: 'blue', admin: 'gold',
}

const roleIcon: Record<UserRole, typeof User> = {
  client: User, staff: Shield, admin: ShieldCheck,
}

export function UsersManager({ users, total, page }: UsersManagerProps) {
  const router = useRouter()
  const [, start] = useTransition()
  const [selected,    setSelected]    = useState<Profile | null>(null)
  const [addingUser,  setAddingUser]  = useState(false)
  const pageSize   = 20
  const totalPages = Math.ceil(total / pageSize)

  function navigate(p: number) {
    router.push(`/admin/users?page=${p}`)
  }

  async function handleRoleChange(id: string, role: UserRole) {
    if (!confirm(`Change this user's role to "${role}"?`)) return
    start(async () => {
      const { error } = await adminUpdateUserRole(id, role)
      if (error) toast.error(error)
      else { toast.success('Role updated'); router.refresh() }
    })
  }

  async function handleToggleActive(id: string, current: boolean) {
    start(async () => {
      const { error } = await adminToggleUserActive(id, !current)
      if (error) toast.error(error)
      else { router.refresh() }
    })
  }

  return (
    <>
      {/* Add User button */}
      <div className="flex justify-end mb-1">
        <button
          onClick={() => setAddingUser(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30
                     text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5">
                {['User', 'Joined', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-neutral-500 text-sm">No users found.</td></tr>
              )}
              {users.map((u) => {
                const RoleIcon = roleIcon[u.role]
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer
                      ${!u.is_active ? 'opacity-50' : ''}`}
                    onClick={() => setSelected(u)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                            : <User className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white text-xs font-medium">{u.full_name}</p>
                          <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-neutral-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge label={u.role} color={roleColor[u.role]} />
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? 'green' : 'gray'} />
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {/* View / Edit details */}
                        <button onClick={() => setSelected(u)}
                          title="View & edit details"
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Quick role selector */}
                        <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-neutral-300 text-xs rounded-lg px-2 py-1
                                     cursor-pointer hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                          <option value="client">Client</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${u.is_active
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/5">
            <p className="text-xs text-gray-400 dark:text-neutral-500">Page {page} of {totalPages} · {total} users</p>
            <div className="flex gap-1">
              <button onClick={() => navigate(page - 1)} disabled={page <= 1}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => navigate(page + 1)} disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User detail slide-over */}
      {selected && (
        <UserDetailPanel
          user={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Add user slide-over */}
      {addingUser && (
        <AddUserPanel onClose={() => setAddingUser(false)} />
      )}
    </>
  )
}
