import React from 'react';
import { Box, Typography } from '@mui/material';

export default function GraphPanel({ selectedItem, items }) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #dbe3e8',
        borderRadius: 2,
        p: 1.5,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight:550, mb:1, fontSize:12, color:"#6b7280" }}>
        Grafo de Correlaciones
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
          fontSize:12
        }}
      >
        ----------- ? -----------
      </Box>
    </Box>
  );
}