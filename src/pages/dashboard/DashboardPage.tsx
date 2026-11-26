import React from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/data-display/StatCard';
import { SectionCard } from '../../components/common/SectionCard';
import { PaymentStatusChip } from '../../components/common/PaymentStatusChip';
import { MoneyText } from '../../components/common/MoneyText';
import { DateText } from '../../components/common/DateText';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { useGetDashboardSummaryQuery } from '../../store/api/dashboardApi';
import { parseApiError } from '../../utils/apiError';
import { formatCurrency } from '../../utils/format';
import { ROUTES } from '../../constants/routes';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetDashboardSummaryQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (error) {
    return (
      <Box>
        <PageHeader title="Executive Dashboard" />
        <ApiErrorAlert error={parseApiError(error)} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Executive Dashboard"
        subtitle={data?.as_of ? `Financial & Operational Metrics as of ${data.as_of}` : 'Live Business Performance Overview'}
        action={
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            flexWrap="wrap"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.invoices.new)}
              fullWidth
              sx={{ width: { sm: 'auto' } }}
            >
              New Invoice
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<PaymentIcon />}
              onClick={() => navigate(ROUTES.payments.new)}
              fullWidth
              sx={{ width: { sm: 'auto' } }}
            >
              Record Payment
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(ROUTES.expenses.list)}
              fullWidth
              sx={{ width: { sm: 'auto' } }}
            >
              Expenses
            </Button>
          </Stack>
        }
      />

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={3} key={`kpi-skeleton-${idx}`}>
              <Skeleton variant="rounded" height={110} />
            </Grid>
          ))
        ) : data ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Sales"
                value={formatCurrency(data.today_sales)}
                subtitle="Issued Invoices Today"
                icon={<TrendingUpIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Month's Sales"
                value={formatCurrency(data.month_sales?.amount)}
                subtitle={`${data.month_sales?.invoice_count ?? 0} Invoices this month`}
                icon={<ReceiptIcon color="info" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Payments Received"
                value={formatCurrency(data.month_payments_received)}
                subtitle="Collected this month"
                icon={<PaymentIcon color="success" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Outstanding Receivables"
                value={formatCurrency(data.outstanding_amount)}
                subtitle="Customer balance due"
                icon={<AccountBalanceWalletIcon color="warning" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Monthly Expenses"
                value={formatCurrency(data.month_expenses)}
                subtitle="Operational expenditures"
                icon={<TrendingDownIcon color="error" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Other Income"
                value={formatCurrency(data.month_other_income)}
                subtitle="Non-sales earnings"
                icon={<MonetizationOnIcon color="success" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Inventory Products"
                value={`${data.stock?.tracked_product_count ?? 0} Items`}
                subtitle={`${data.stock?.low_stock_count ?? 0} Low Stock warnings`}
                icon={<Inventory2Icon color={(data.stock?.low_stock_count ?? 0) > 0 ? 'warning' : 'primary'} />}
              />
            </Grid>
          </>
        ) : null}
      </Grid>

      {/* Operational Breakdown Section */}
      <Grid container spacing={3}>
        {/* Recent Invoices */}
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Recent Invoices"
            subheader="Latest generated billing invoices and settlement statuses."
            action={
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(ROUTES.invoices.list)}
              >
                View All Invoices
              </Button>
            }
          >
            {isLoading ? (
              <Skeleton variant="rounded" height={220} />
            ) : data && data.recent_invoices && data.recent_invoices.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Payment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recent_invoices.map((inv) => (
                      <TableRow key={inv.id} hover>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate(ROUTES.invoices.detail(inv.id))}
                            sx={{ p: 0, fontWeight: 600 }}
                          >
                            {inv.invoice_number}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <DateText value={inv.invoice_date} />
                        </TableCell>
                        <TableCell>{inv.customer_name}</TableCell>
                        <TableCell align="right">
                          <MoneyText amount={inv.grand_total} fontWeight={600} />
                        </TableCell>
                        <TableCell align="center">
                          <PaymentStatusChip status={inv.payment_status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent invoices recorded.
              </Typography>
            )}
          </SectionCard>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Low Stock Alerts"
            subheader="Goods running at or below reorder threshold."
            action={
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => navigate(`${ROUTES.products.list}?low_stock=true`)}
              >
                View Inventory
              </Button>
            }
          >
            {isLoading ? (
              <Skeleton variant="rounded" height={220} />
            ) : data && data.low_stock_products && data.low_stock_products.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Reorder At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.low_stock_products.map((prod) => (
                      <TableRow key={prod.id} hover>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate(ROUTES.products.detail(prod.id))}
                            sx={{ p: 0, fontWeight: 600, textAlign: 'left' }}
                          >
                            {prod.name}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color="error.main">
                            {prod.current_stock} {prod.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {prod.reorder_level} {prod.unit}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  ✓ All tracked products have sufficient stock levels.
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
