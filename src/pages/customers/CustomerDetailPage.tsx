import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Button,
  Grid,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { SectionCard } from '../../components/common/SectionCard';
import { KeyValueList } from '../../components/data-display/KeyValueList';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CustomerInvoicesTable } from '../../components/customers/CustomerInvoicesTable';

import {
  useGetCustomerQuery,
  useGetCustomerInvoicesQuery,
  useUpdateCustomerMutation,
} from '../../store/api/customersApi';
import { useLazyGetInvoiceDocumentBlobQuery } from '../../store/api/invoicesApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { openBlobInNewTab } from '../../utils/download';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notifySuccess, notifyError } = useNotify();

  const initialTabParam = searchParams.get('tab');
  const getInitialTab = () => {
    if (initialTabParam === 'invoices' || initialTabParam === '1') return 1;
    return 0;
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  const {
    data: customer,
    isLoading: isCustomerLoading,
    error: customerError,
  } = useGetCustomerQuery(id as string);

  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
  } = useGetCustomerInvoicesQuery(
    { id: id as string, params: { page_size: 100 } },
    { skip: !id }
  );
  const customerInvoices = invoicesData?.results ?? [];

  const [triggerDocumentQuery] = useLazyGetInvoiceDocumentBlobQuery();
  const handleDownloadPdf = async (invoiceId: number) => {
    try {
      const blob = await triggerDocumentQuery(invoiceId).unwrap();
      openBlobInNewTab(blob);
    } catch (err: unknown) {
      notifyError(parseApiError(err).detail);
    }
  };

  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const handleToggleActive = async () => {
    if (!customer) return;
    try {
      await updateCustomer({
        id: customer.id,
        is_active: !customer.is_active,
      }).unwrap();
      notifySuccess(MESSAGES.general.updateSuccess);
      setDeactivateDialogOpen(false);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail);
    }
  };

  if (isCustomerLoading) {
    return <LoadingScreen message="Loading customer account..." />;
  }

  if (customerError) {
    return <ApiErrorAlert error={parseApiError(customerError)} />;
  }

  if (!customer) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title={`${customer.name} (${customer.code})`}
        subtitle="Customer account overview, billing records, and invoices."
        breadcrumbs={[
          { label: 'Customers', path: ROUTES.customers.list },
          { label: customer.name },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(ROUTES.customers.edit(customer.id))}
            >
              Edit Customer
            </Button>
          </Stack>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newVal: number) => {
            setCurrentTab(newVal);
            if (newVal === 1) setSearchParams({ tab: 'invoices' });
            else setSearchParams({});
          }}
          aria-label="customer detail tabs"
        >
          <Tab label="Overview" />
          <Tab
            label={
              customerInvoices.length > 0
                ? `Invoices (${customerInvoices.length})`
                : 'Invoices'
            }
          />
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <SectionCard title="Contact & Billing Details">
              <KeyValueList
                items={[
                  { label: 'Customer Code', value: customer.code },
                  { label: 'Company / Name', value: customer.name },
                  { label: 'Phone', value: customer.phone },
                  { label: 'GSTIN', value: customer.gstin || 'Unregistered' },
                  { label: 'State', value: customer.state },
                  { label: 'Billing Address', value: customer.billing_address },
                  {
                    label: 'Account Status',
                    value: (
                      <StatusChip
                        label={customer.is_active ? 'Active' : 'Inactive'}
                        color={customer.is_active ? 'success' : 'default'}
                      />
                    ),
                  },
                ]}
              />
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={5}>
            <SectionCard title="Account Actions">
              <Box sx={{ p: 1 }}>
                <Button
                  variant="outlined"
                  color={customer.is_active ? 'error' : 'success'}
                  fullWidth
                  onClick={() => setDeactivateDialogOpen(true)}
                >
                  {customer.is_active ? 'Deactivate Customer' : 'Reactivate Customer'}
                </Button>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Invoices */}
      {currentTab === 1 && (
        <Box>
          {isInvoicesLoading ? (
            <LoadingScreen message="Loading customer invoices..." />
          ) : (
            <CustomerInvoicesTable
              invoices={customerInvoices}
              customerId={customer.id}
              onDownloadPdf={handleDownloadPdf}
            />
          )}
        </Box>
      )}

      <ConfirmDialog
        open={deactivateDialogOpen}
        title={customer.is_active ? 'Deactivate Customer' : 'Activate Customer'}
        message={
          customer.is_active
            ? `Are you sure you want to deactivate ${customer.name}? They will be hidden from new invoice selections.`
            : `Are you sure you want to activate ${customer.name}?`
        }
        confirmLabel={customer.is_active ? 'Deactivate' : 'Activate'}
        confirmColor={customer.is_active ? 'error' : 'primary'}
        isLoading={isUpdating}
        onConfirm={() => void handleToggleActive()}
        onCancel={() => setDeactivateDialogOpen(false)}
      />
    </Box>
  );
};

export default CustomerDetailPage;
