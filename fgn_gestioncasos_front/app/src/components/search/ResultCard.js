import React from 'react';
import { Button, Card, CardActionArea, CardContent, Typography, Box, Chip, Stack } from '@mui/material';

const SOURCE_COLORS = {
  casos: '#005e79',
  uiaf: '#7a0033', 
  gic: '#007a58',
};


function highlightText(text, terms = []) {
  if (text == null) return '';
  const safeText = typeof text === 'string' ? text : String(text);
  if (!terms.length || !safeText) return safeText;

  const regex = new RegExp(
    `(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );

  return safeText.split(regex).map((part, idx) =>
    terms.some(term => part.toLowerCase() === term.toLowerCase())
      ? <span key={idx} style={{ backgroundColor: '#f010ddff', color: '#fff' }}>{part}</span>
      : part
  );
}

function primeraMayus(str) {
  if (typeof str !== 'string') return str;
  if (!str.length) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/*
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
*/

export default function ResultCard({ item, source, selected, onSelect, searchTerms = [] }) {
  if (source === 'casos') {
    return (
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          borderColor: selected ? SOURCE_COLORS[source] : '#dbe3e8',
          boxShadow: selected ? `0 0 0 2px ${SOURCE_COLORS[source]}22` : 'none',
          borderRadius: 2,
        }}
      >
        <CardActionArea onClick={() => onSelect(item)}>
          <CardContent>
            <Stack spacing={0.8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#137cbd' }}>
                  Radicado:
                </Typography>

                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                  sx={{ fontWeight: 'bold', fontSize: '0.85rem', minWidth: 150 }}
                >
                  {item.c_radicado}
                </Button>

                <Typography variant="body2" sx={{ mx: 1 }}>
                  | Estado:{' '}
                  <span style={{ fontWeight: 'bold', color: '#0a237e' }}>
                    {primeraMayus(item.c_estado)}
                  </span>
                </Typography>

                <Typography variant="body2" sx={{ mx: 1 }}>
                  | Dirección:{' '}
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    {highlightText(String(item.c_unidad ?? '').toUpperCase(), searchTerms)}
                  </span>
                </Typography>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a21caf' }}>
                  Hechos:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {item.tx_hechos
                    ? highlightText(
                        item.tx_hechos.length > 550
                          ? item.tx_hechos.slice(0, 550) + '...'
                          : item.tx_hechos,
                        searchTerms
                      )
                    : <span style={{ color: '#888' }}>Sin información de hechos</span>}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

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