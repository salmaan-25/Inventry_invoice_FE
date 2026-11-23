import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { ROUTES } from '../constants/routes';
import { ROLE } from '../constants/enums';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const CompanySettingsPage = lazy(() => import('../pages/settings/CompanySettingsPage'));
const StaffListPage = lazy(() => import('../pages/settings/StaffListPage'));
const CustomerListPage = lazy(() => import('../pages/customers/CustomerListPage'));
const CustomerFormPage = lazy(() => import('../pages/customers/CustomerFormPage'));
const CustomerDetailPage = lazy(() => import('../pages/customers/CustomerDetailPage'));
const ProductListPage = lazy(() => import('../pages/products/ProductListPage'));
const ProductFormPage = lazy(() => import('../pages/products/ProductFormPage'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage'));
const StockMovementsPage = lazy(() => import('../pages/inventory/StockMovementsPage'));
const InvoiceListPage = lazy(() => import('../pages/invoices/InvoiceListPage'));
const InvoiceCreatePage = lazy(() => import('../pages/invoices/InvoiceCreatePage'));
const InvoiceEditPage = lazy(() => import('../pages/invoices/InvoiceEditPage'));
const InvoiceDetailPage = lazy(() => import('../pages/invoices/InvoiceDetailPage'));
const PaymentListPage = lazy(() => import('../pages/payments/PaymentListPage'));
const PaymentCreatePage = lazy(() => import('../pages/payments/PaymentCreatePage'));
const ExpenseListPage = lazy(() => import('../pages/expenses/ExpenseListPage'));
const OtherIncomeListPage = lazy(() => import('../pages/income/OtherIncomeListPage'));
const CategoriesSettingsPage = lazy(() => import('../pages/settings/CategoriesSettingsPage'));
const ForbiddenPage = lazy(() => import('../pages/system/ForbiddenPage'));
const NotFoundPage = lazy(() => import('../pages/system/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.dashboard} replace />,
          },
          {
            path: ROUTES.dashboard,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          // Customers
          {
            path: ROUTES.customers.list,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.customers.new,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerFormPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.customers.edit(':id'),
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerFormPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.customers.detail(':id'),
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerDetailPage />
              </Suspense>
            ),
          },
          // Products & Inventory
          {
            path: ROUTES.products.list,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProductListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.products.new,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProductFormPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.products.edit(':id'),
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProductFormPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.products.detail(':id'),
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProductDetailPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.inventory.movements,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <StockMovementsPage />
              </Suspense>
            ),
          },
          // Invoices
          {
            path: ROUTES.invoices.list,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <InvoiceListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.invoices.new,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <InvoiceCreatePage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.invoices.edit(':id'),
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <InvoiceEditPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.invoices.detail(':id'),
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <InvoiceDetailPage />
              </Suspense>
            ),
          },
          // Payments
          {
            path: ROUTES.payments.list,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.payments.new,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentCreatePage />
              </Suspense>
            ),
          },
          // Expenses & Other Income
          {
            path: ROUTES.expenses.list,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ExpenseListPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.otherIncome.list,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <OtherIncomeListPage />
              </Suspense>
            ),
          },
          // Settings
          {
            path: ROUTES.settings.company,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompanySettingsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.settings.categories,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CategoriesSettingsPage />
              </Suspense>
            ),
          },
          {
            element: <RoleRoute roles={[ROLE.ADMIN]} />,
            children: [
              {
                path: ROUTES.settings.staff,
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <StaffListPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: ROUTES.forbidden,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ForbiddenPage />
              </Suspense>
            ),
          },
          {
            path: '*',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <NotFoundPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
