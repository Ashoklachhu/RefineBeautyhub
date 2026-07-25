import { BRANCHES } from '@/constants'
import type { BranchInfo, SiteSettings } from '@/types/database'

/**
 * Used until an admin saves branches, and if the settings row is unreachable.
 * Phone is deliberately blank: the seed data has no per-branch number, and
 * showing the generic office line under every branch reads as a real direct
 * number that nobody answers.
 */
export const FALLBACK_BRANCHES: BranchInfo[] = BRANCHES.map(b => ({
  id:      b.id,
  name:    b.name,
  address: b.address,
  phone:   '',
  map_url: b.mapUrl,
}))

type BranchSource = Pick<SiteSettings, 'branches'> | null | undefined

/**
 * Branch list for the public site. Rows missing a name or address are dropped
 * so a half-filled row in the admin editor can never render an empty card.
 */
export function resolveBranches(settings: BranchSource): BranchInfo[] {
  const saved = settings?.branches
  if (!Array.isArray(saved)) return FALLBACK_BRANCHES

  const usable = saved.filter(b => b?.name?.trim() && b?.address?.trim())
  return usable.length > 0 ? usable : FALLBACK_BRANCHES
}

/** Stable id from a branch name — kept for booking records that store branch ids. */
export function branchIdFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `branch-${Date.now().toString(36)}`
}
