import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { PageHeader } from '../../components/common/PageHeader';
import { SectionCard } from '../../components/common/SectionCard';
import { RoleGate } from '../../components/common/RoleGate';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
} from '../../store/api/expensesApi';
import {
  useGetIncomeCategoriesQuery,
  useCreateIncomeCategoryMutation,
} from '../../store/api/incomeApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { categorySchema } from '../../schemas/finance';
import { ROLE } from '../../constants/enums';
import { MESSAGES } from '../../constants/messages';

export const CategoriesSettingsPage: React.FC = () => {
  const { notifySuccess } = useNotify();

  const { data: expenseCategories = [], isLoading: isExpLoading } = useGetExpenseCategoriesQuery();
  const { data: incomeCategories = [], isLoading: isIncLoading } = useGetIncomeCategoriesQuery();

  const [createExpenseCat, { isLoading: isCreatingExp }] = useCreateExpenseCategoryMutation();
  const [createIncomeCat, { isLoading: isCreatingInc }] = useCreateIncomeCategoryMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | undefined>();

  const handleOpenAdd = (type: 'EXPENSE' | 'INCOME') => {
    setDialogType(type);
    setName('');
    setError(undefined);
    setServerError(undefined);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(undefined);

    const result = categorySchema.safeParse({ name: name.trim() });
    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }

    try {
      if (dialogType === 'EXPENSE') {
        await createExpenseCat({ name: name.trim() }).unwrap();
      } else {
        await createIncomeCat({ name: name.trim() }).unwrap();
      }
      notifySuccess(MESSAGES.general.saveSuccess);
      setDialogOpen(false);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setServerError(parsed.detail);
    }
  };

  if (isExpLoading || isIncLoading) {
    return <LoadingScreen message="Loading categories..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Category Settings"
        subtitle="Manage bookkeeping classification tags for expenses and non-sales income."
      />

      <Grid container spacing={3}>
        {/* Expense Categories */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Expense Categories"
            subheader="Categories used to track company operational overheads."
            action={
              <RoleGate roles={[ROLE.ADMIN]}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAdd('EXPENSE')}
                >
                  Add Category
                </Button>
              </RoleGate>
            }
          >
            <Card variant="outlined">
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <List disablePadding>
                  {expenseCategories.map((cat, index) => (
                    <ListItem
                      key={cat.id}
                      divider={index < expenseCategories.length - 1}
                      secondaryAction={
                        <Chip
                          size="small"
                          label={cat.is_active ? 'Active' : 'Inactive'}
                          color={cat.is_active ? 'success' : 'default'}
                        />
                      }
                    >
                      <ListItemText primary={cat.name} />
                    </ListItem>
                  ))}
                  {expenseCategories.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No expense categories defined yet.
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </SectionCard>
        </Grid>

        {/* Income Categories */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Other Income Categories"
            subheader="Categories used for scrap sales, asset disposals, and bank returns."
            action={
              <RoleGate roles={[ROLE.ADMIN]}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAdd('INCOME')}
                >
                  Add Category
                </Button>
              </RoleGate>
            }
          >
            <Card variant="outlined">
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <List disablePadding>
                  {incomeCategories.map((cat, index) => (
                    <ListItem
                      key={cat.id}
                      divider={index < incomeCategories.length - 1}
                      secondaryAction={
                        <Chip
                          size="small"
                          label={cat.is_active ? 'Active' : 'Inactive'}
                          color={cat.is_active ? 'success' : 'default'}
                        />
                      }
                    >
                      <ListItemText primary={cat.name} />
                    </ListItem>
                  ))}
                  {incomeCategories.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No other income categories defined yet.
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Add Category Dialog (Admin only) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialogType === 'EXPENSE' ? 'Add Expense Category' : 'Add Income Category'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogContent dividers>
            {serverError && <ApiErrorAlert error={serverError} sx={{ mb: 2 }} />}
            <TextField
              autoFocus
              label="Category Name"
              placeholder="e.g. Printing, Logistics, Scrap"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(undefined);
              }}
              error={Boolean(error)}
              helperText={error}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreatingExp || isCreatingInc}
            >
              Create Category
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CategoriesSettingsPage;
