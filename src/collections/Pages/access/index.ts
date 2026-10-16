import type { Access, FieldAccess } from 'payload'

export const canCreatePage: Access = ({ req }) => Boolean(req.user)

export const canReadPage: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const canUpdatePage: Access = ({ req }) => Boolean(req.user)

// A query constraint also protects bulk deletes, where there is no single document.
export const canDeletePage: Access = ({ req }) => {
  if (!req.user) return false
  return { slug: { not_in: ['home', '404'] } }
}

export const canChangePagePath: FieldAccess = ({ doc }) =>
  doc?.slug !== 'home' && doc?.slug !== '404'

// The 404 block's text is editable; its one-block structure is checked by the hook.
export const canChangePageBlocks: FieldAccess = ({ req }) => Boolean(req.user)
