import React from 'react';
import { Box, Typography } from '@mui/material';

export default function DetailPanel({ selectedItem }) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #dbe3e8',
        borderRadius: 2,
        p: 1.5,
        minHeight: 0,
        overflowY: 'auto',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight:550, mb:1, fontSize:12, color:"#6b7280" }}>
        Detalle
      </Typography>

      {!selectedItem ? (
        <Typography variant="body2" sx={{ fontSize:12, color: '#94a3b8' }}>
          info... del nodo...
        </Typography>
      ) : (
        <>
          <Typography variant="h6">{selectedItem.title || selectedItem.titulo}</Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
              {selectedItem.tx_hechos || selectedItem.resumen}
            </Typography>
        </>
      )}
    </Box>
  );
}
