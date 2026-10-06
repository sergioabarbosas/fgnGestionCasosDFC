import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box, Chip } from '@mui/material';

const SOURCE_COLORS = {
  casos: '#94015b',
  uiaf: '#047857',
  gic: '#6d28d9',
  muif: '#0e7490',
};

export default function ResultCard({ item, source, selected, onSelect }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: selected ? SOURCE_COLORS[source] : '#dbe3e8',
        boxShadow: selected ? `0 0 0 2px ${SOURCE_COLORS[source]}22` : 'none',
      }}
    >
      <CardActionArea onClick={() => onSelect(item)}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Typography fontWeight={700} noWrap>
              {item.title || item.titulo || item.id || 'Sin título'}
            </Typography>
            <Chip
              size="small"
              label={source.toUpperCase()}
              sx={{
                bgcolor: SOURCE_COLORS[source],
                color: '#fff',
                fontSize: 11,
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
            {item.summary || item.resumen || 'Sin resumen disponible'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}