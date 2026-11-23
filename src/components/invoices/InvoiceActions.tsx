import React, { useState } from 'react';
import { Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '../common/ConfirmDialog';
import { FileDownloadButton } from '../common/FileDownloadButton';
import { useIssueInvoiceMutation, useLazyGetInvoiceDocumentBlobQuery } from '../../store/api/invoicesApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { openBlobInNewTab } from '../../utils/download';
import { INVOICE_STATUS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import type { Invoice } from '../../types/api/invoice';

export interface InvoiceActionsProps {
  invoice: Invoice;
  onIssuedSuccess?: () => void;
  onIssueError?: (err: string) => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  onIssuedSuccess,
  onIssueError,
}) => {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotify();

  const [issueInvoice, { isLoading: isIssuing }] = useIssueInvoiceMutation();
  const [triggerDocumentQuery, { isFetching: isDocumentLoading }] = useLazyGetInvoiceDocumentBlobQuery();

  const [confirmIssueOpen, setConfirmIssueOpen] = useState(false);

  const isDraft = invoice.status === INVOICE_STATUS.DRAFT;

  const handleConfirmIssue = async () => {
    try {
      await issueInvoice(invoice.id).unwrap();
      notifySuccess(MESSAGES.general.actionSuccess);
      setConfirmIssueOpen(false);
      onIssuedSuccess?.();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail);
      onIssueError?.(parsed.detail);
      setConfirmIssueOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await triggerDocumentQuery(invoice.id).unwrap();
      openBlobInNewTab(blob);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        {/* Edit Button is available for both DRAFT and ISSUED invoices */}
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(ROUTES.invoices.edit(invoice.id))}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {isDraft ? 'Edit Draft' : 'Edit Invoice'}
        </Button>

        {isDraft ? (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => setConfirmIssueOpen(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Issue Invoice
            </Button>

            <FileDownloadButton
              label="Preview PDF"
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              isLoading={isDocumentLoading}
              onDownload={handleDownloadPdf}
              sx={{ whiteSpace: 'nowrap' }}
            />
          </>
        ) : (
          <>
            <FileDownloadButton
              label="Print / Download PDF"
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              isLoading={isDocumentLoading}
              onDownload={handleDownloadPdf}
              sx={{ whiteSpace: 'nowrap' }}
            />

            <Button
              variant="outlined"
              color="success"
              startIcon={<PaymentIcon />}
              onClick={() => navigate(ROUTES.payments.new)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Record Payment
            </Button>
          </>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmIssueOpen}
        title="Issue Invoice"
        message={MESSAGES.confirm.issueInvoice}
        confirmLabel="Confirm & Issue"
        confirmColor="success"
        isLoading={isIssuing}
        onConfirm={() => void handleConfirmIssue()}
        onCancel={() => setConfirmIssueOpen(false)}
      />
    </>
  );
};
