import { ROLE, type Role } from './enums';
import { ROUTES } from './routes';

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly iconName: string;
  readonly roles?: readonly Role[];
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.dashboard,
    iconName: 'Dashboard',
  },
  {
    label: 'Invoices',
    path: ROUTES.invoices.list,
    iconName: 'Receipt',
  },
  {
    label: 'Payments',
    path: ROUTES.payments.list,
    iconName: 'Payment',
  },
  {
    label: 'Customers',
    path: ROUTES.customers.list,
    iconName: 'People',
  },
  {
    label: 'Products & Inventory',
    path: ROUTES.products.list,
    iconName: 'Inventory2',
  },
  {
    label: 'Stock Movements',
    path: ROUTES.inventory.movements,
    iconName: 'History',
  },
  {
    label: 'Expenses',
    path: ROUTES.expenses.list,
    iconName: 'TrendingDown',
  },
  {
    label: 'Other Income',
    path: ROUTES.otherIncome.list,
    iconName: 'TrendingUp',
  },
  {
    label: 'Company Profile',
    path: ROUTES.settings.company,
    iconName: 'Business',
  },
  {
    label: 'Staff Management',
    path: ROUTES.settings.staff,
    iconName: 'Badge',
    roles: [ROLE.ADMIN],
  },
  {
    label: 'Categories',
    path: ROUTES.settings.categories,
    iconName: 'Category',
  },
] as const;
