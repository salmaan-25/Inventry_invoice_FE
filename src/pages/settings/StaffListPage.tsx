import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { FilterBar } from '../../components/data-display/FilterBar';
import { SearchField } from '../../components/common/SearchField';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StaffFormDialog } from '../../components/staff/StaffFormDialog';

import {
  useGetStaffListQuery,
  useDeleteStaffMutation,
} from '../../store/api/staffApi';
import { usePaginationParams } from '../../hooks/usePaginationParams';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import type { StaffMember } from '../../types/api/staff';

export const StaffListPage: React.FC = () => {
  const { notifySuccess, notifyError } = useNotify();
  const { page, pageSize, search, setPage, setPageSize, setSearch } = usePaginationParams();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>(undefined);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | undefined>(undefined);

  const queryParams = useMemo(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
    };
  }, [page, pageSize, search]);

  const { data, isLoading, error } = useGetStaffListQuery(queryParams);
  const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();

  const handleOpenCreate = () => {
    setEditingStaff(undefined);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;
    try {
      await deleteStaff(deletingStaff.id).unwrap();
      notifySuccess(`Employee ${deletingStaff.name} deleted successfully.`);
      setDeletingStaff(undefined);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail || 'Failed to delete employee.');
    }
  };

  const columns: readonly Column<StaffMember>[] = [
    {
      id: 'employee_id',
      label: 'Employee ID',
      minWidth: 140,
      render: (row) => (
        <Chip
          label={row.employee_id}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, fontFamily: 'monospace' }}
        />
      ),
    },
    {
      id: 'name',
      label: 'Employee Name',
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      minWidth: 160,
      render: (row) => (
        <Typography variant="body2" color={row.contact ? 'text.primary' : 'text.secondary'}>
          {row.contact || '—'}
        </Typography>
      ),
    },
    {
      id: 'notes',
      label: 'Notes / Role',
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" color={row.notes ? 'text.primary' : 'text.secondary'}>
          {row.notes || '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 110,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Edit Employee">
            <IconButton size="small" onClick={() => handleOpenEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Employee">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeletingStaff(row)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Staff Management"
        subtitle="Manage business employees, their IDs, contact details, and salary recipients."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Employee
          </Button>
        }
      />

      <FilterBar>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search by ID, name, contact..."
        />
      </FilterBar>

      <DataTable<StaffMember>
        columns={columns}
        rows={data?.results ?? []}
        count={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error ? parseApiError(error).detail : undefined}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        emptyTitle="No Employees Found"
        emptyMessage="Add employees to track business staff and select them when recording salary expenses."
      />

      <StaffFormDialog
        open={formDialogOpen}
        staff={editingStaff}
        onClose={() => setFormDialogOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deletingStaff)}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deletingStaff?.name} (${deletingStaff?.employee_id})?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingStaff(undefined)}
      />
    </Box>
  );
};

export default StaffListPage;
