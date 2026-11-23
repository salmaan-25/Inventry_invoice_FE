import React from 'react';
import { Button, CircularProgress, type ButtonProps } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export interface FileDownloadButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string;
  isLoading?: boolean;
  onDownload: () => Promise<void> | void;
}

export const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({
  label = 'Download',
  isLoading = false,
  onDownload,
  variant = 'outlined',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      disabled={isLoading || props.disabled}
      startIcon={
        isLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />
      }
      onClick={() => void onDownload()}
      {...props}
    >
      {label}
    </Button>
  );
};
