export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  customers: {
    list: '/customers',
    new: '/customers/new',
    detail: (id: string | number) => `/customers/${id}`,
    edit: (id: string | number) => `/customers/${id}/edit`,
  },
  products: {
    list: '/products',
    new: '/products/new',
    detail: (id: string | number) => `/products/${id}`,
    edit: (id: string | number) => `/products/${id}/edit`,
  },
  inventory: {
    movements: '/inventory/movements',
  },
  invoices: {
    list: '/invoices',
    new: '/invoices/new',
    detail: (id: string | number) => `/invoices/${id}`,
    edit: (id: string | number) => `/invoices/${id}/edit`,
  },
  challans: {
    list: '/challans',
    new: (invoiceId?: string | number) =>
      invoiceId ? `/challans/new?invoice=${invoiceId}` : '/challans/new',
    detail: (id: string | number) => `/challans/${id}`,
  },
  payments: {
    list: '/payments',
    new: '/payments/new',
  },
  expenses: {
    list: '/expenses',
  },
  otherIncome: {
    list: '/other-income',
  },
  settings: {
    company: '/settings/company',
    staff: '/settings/staff',
    categories: '/settings/categories',
  },
  forbidden: '/forbidden',
  notFound: '/404',
} as const;
