import React from 'react';
import { Box, Typography } from '@mui/material';

export default function GraphPanel({ selectedItem, items }) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #dbe3e8',
        borderRadius: 2,
        p: 2,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Grafo
      </Typography>

      <Box
        sx={{
          height: 'calc(100% - 32px)',
          borderRadius: 2,
          border: '1px dashed #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
        }}
      >
        ----------- grafo que no tengo aún -----------
      </Box>
    </Box>
  );
}