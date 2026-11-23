import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useParams, useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { SectionCard } from '../../components/common/SectionCard';
import { DateText } from '../../components/common/DateText';
import { FileDownloadButton } from '../../components/common/FileDownloadButton';
import {
  useGetChallanQuery,
  useLazyGetChallanDocumentBlobQuery,
} from '../../store/api/challansApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { openBlobInNewTab } from '../../utils/download';
import { ROUTES } from '../../constants/routes';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const challanId = Number(id);
  const navigate = useNavigate();
  const { notifyError } = useNotify();

  const { data: challan, isLoading, error } = useGetChallanQuery(challanId, {
    skip: !challanId,
  });

  const [triggerDocumentQuery, { isFetching: isDownloading }] = useLazyGetChallanDocumentBlobQuery();

  const handleDownloadPdf = async () => {
    try {
      const blob = await triggerDocumentQuery(challanId).unwrap();
      openBlobInNewTab(blob);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading delivery challan..." />;
  }

  if (error || !challan) {
    return <ApiErrorAlert error={error ? parseApiError(error) : 'Delivery challan not found'} />;
  }

  return (
    <Box>
      <PageHeader
        title={`Delivery Challan #DC-${String(challan.id).padStart(4, '0')}`}
        subtitle={`Delivery Date: ${challan.delivery_date}`}
        breadcrumbs={[
          { label: 'Delivery Challans', path: ROUTES.challans.list },
          { label: `DC-${String(challan.id).padStart(4, '0')}` },
        ]}
        action={
          <FileDownloadButton
            label="Download PDF"
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            isLoading={isDownloading}
            onDownload={handleDownloadPdf}
          />
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Linked Invoice & Customer
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="text"
                  sx={{ p: 0, fontWeight: 700, fontSize: '1rem' }}
                  onClick={() => navigate(ROUTES.invoices.detail(challan.invoice))}
                >
                  {challan.invoice_number}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block">
                  Invoice Date: {challan.invoice_date}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 1.5 }}>
                {challan.customer_name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Transport & Dispatch Details
              </Typography>
              <Typography variant="body2">
                <strong>Delivery Date:</strong> <DateText value={challan.delivery_date} />
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Delivered By:</strong> {challan.delivered_by}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Received By:</strong> {challan.received_by}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Audit Log
              </Typography>
              <Typography variant="body2">
                <strong>Created By:</strong> {challan.created_by_name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Created At:</strong> <DateText value={challan.created_at} />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dispatched Items */}
      <SectionCard title="Dispatched Items">
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="challan items table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}>#</TableCell>
                <TableCell>Product / Item</TableCell>
                <TableCell>HSN/SAC</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right" sx={{ width: 140 }}>Dispatched Qty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {challan.items.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.product_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Code: {item.product_code}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.hsn_sac || '—'}</TableCell>
                  <TableCell>{item.unit_name}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {item.quantity}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Box>
  );
};

export default ChallanDetailPage;
