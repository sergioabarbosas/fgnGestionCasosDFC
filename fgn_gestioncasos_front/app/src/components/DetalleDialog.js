import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';

export default function DetalleDialog({
  open = false,
  onClose,
  title = 'Detalle',
  subtitulo,
  children,
  maxWidth = 'md',
}) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            {title}
          </Typography>
          {subtitulo ? (
            <Typography variant="subtitle1" sx={{ color: '#a21caf', fontWeight: 'bold' }}>
              {subtitulo}
            </Typography>
          ) : null}
        </Box>
      </DialogTitle>

      <DialogContent>
        {children}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}