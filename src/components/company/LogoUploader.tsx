import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Avatar, Stack } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { FILE_LIMITS } from '../../constants/validation';

export interface LogoUploaderProps {
  currentLogoUrl?: string;
  selectedFile?: File;
  onChange: (file?: File) => void;
  disabled?: boolean;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogoUrl,
  selectedFile,
  onChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(undefined);
    return undefined;
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorText(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!FILE_LIMITS.ACCEPTED_LOGO_TYPES.includes(file.type as 'image/png' | 'image/jpeg' | 'image/jpg')) {
      setErrorText('Only PNG or JPG images are allowed.');
      return;
    }

    if (file.size > FILE_LIMITS.MAX_LOGO_SIZE_BYTES) {
      setErrorText('File size must not exceed 2MB.');
      return;
    }

    onChange(file);
  };

  const handleClear = () => {
    setErrorText(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl ?? currentLogoUrl;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Company Logo
      </Typography>

      <Stack direction="row" spacing={3} alignItems="center">
        <Avatar
          src={displayUrl}
          variant="rounded"
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          Logo
        </Avatar>

        {!disabled && (
          <Box>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={disabled}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                Choose File
              </Button>

              {selectedFile && (
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleClear}
                  disabled={disabled}
                >
                  Remove Selection
                </Button>
              )}
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              PNG or JPG under 2MB.
            </Typography>

            {errorText && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {errorText}
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
