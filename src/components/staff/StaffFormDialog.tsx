import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import {
  useCreateStaffMutation,
  useUpdateStaffMutation,
} from '../../store/api/staffApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { MESSAGES } from '../../constants/messages';
import type { StaffMember } from '../../types/api/staff';

export interface StaffFormDialogProps {
  open: boolean;
  staff?: StaffMember;
  onClose: () => void;
}

export const StaffFormDialog: React.FC<StaffFormDialogProps> = ({
  open,
  staff,
  onClose,
}) => {
  const isEdit = Boolean(staff);
  const { notifySuccess } = useNotify();

  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (staff) {
      setEmployeeId(staff.employee_id || '');
      setName(staff.name || '');
      setContact(staff.contact || '');
      setNotes(staff.notes || '');
    } else {
      setEmployeeId('');
      setName('');
      setContact('');
      setNotes('');
    }
    setErrors({});
    setGeneralError(null);
  }, [staff, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const validationErrors: Record<string, string> = {};
    if (!employeeId.trim()) {
      validationErrors.employee_id = 'Employee ID is required.';
    }
    if (!name.trim()) {
      validationErrors.name = 'Employee name is required.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEdit && staff) {
        await updateStaff({
          id: staff.id,
          employee_id: employeeId.trim(),
          name: name.trim(),
          contact: contact.trim(),
          notes: notes.trim(),
        }).unwrap();
        notifySuccess(MESSAGES.general.updateSuccess);
      } else {
        await createStaff({
          employee_id: employeeId.trim(),
          name: name.trim(),
          contact: contact.trim(),
          notes: notes.trim(),
        }).unwrap();
        notifySuccess(MESSAGES.general.createSuccess);
      }
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        const mappedErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed.fieldErrors)) {
          mappedErrors[k] = Array.isArray(v) ? (v[0] ?? '') : String(v);
        }
        setErrors(mappedErrors);
      } else {
        setGeneralError(parsed.detail || 'Failed to save employee.');
      }
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {generalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee ID"
                placeholder="e.g. EMP-001"
                fullWidth
                size="small"
                required
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  if (errors.employee_id) setErrors((prev) => ({ ...prev, employee_id: '' }));
                }}
                error={Boolean(errors.employee_id)}
                helperText={errors.employee_id}
                autoFocus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee Name"
                placeholder="e.g. Ramesh Kumar"
                fullWidth
                size="small"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact / Phone"
                placeholder="e.g. 9876543210"
                fullWidth
                size="small"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (errors.contact) setErrors((prev) => ({ ...prev, contact: '' }));
                }}
                error={Boolean(errors.contact)}
                helperText={errors.contact}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Notes / Role (Optional)"
                placeholder="e.g. Driver / Carpenter / Sales"
                fullWidth
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isLoading}
          >
            {isEdit ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
