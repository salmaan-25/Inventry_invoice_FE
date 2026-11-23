import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { showSnackbar, type AlertSeverity } from '../store/slice/uiSlice';

export function useNotify() {
  const dispatch = useAppDispatch();

  const notify = useCallback(
    (message: string, severity: AlertSeverity = 'info') => {
      dispatch(showSnackbar({ message, severity }));
    },
    [dispatch]
  );

  const notifySuccess = useCallback(
    (message: string) => notify(message, 'success'),
    [notify]
  );

  const notifyError = useCallback(
    (message: string) => notify(message, 'error'),
    [notify]
  );

  const notifyWarning = useCallback(
    (message: string) => notify(message, 'warning'),
    [notify]
  );

  const notifyInfo = useCallback(
    (message: string) => notify(message, 'info'),
    [notify]
  );

  return {
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}
