import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import mainPageStyles from "../../styles/mainPageStyles";

const SOURCE_COLORS = {
  casos: '#94015b',
  uiaf: '#047857',
  gic: '#6d28d9',
  muif: '#0e7490',
};

export default function SearchTopBar({
  query,
  setQuery,
  onSearch,
  onBack,
  loading,
  activeSources,
  toggleSource,
}) {
  const sources = ['casos', 'uiaf', 'gic', 'muif'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        bgcolor: '#fff',
        borderBottom: '1px solid #dbe3e8',
        flexWrap: 'wrap',
      }}
    >

      <Button
          type="button"
          variant="contained"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={ mainPageStyles.logoutButton }
        >
          Atrás
      </Button>

      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar en todas las fuentes..."
        size="small"
        sx={{
          flex: 1,
          minWidth: 320,
          '& .MuiOutlinedInput-root': {
            borderRadius: '999px',
            bgcolor: '#f4f7f9',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={18} />
            </InputAdornment>
          ) : null,
        }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {sources.map((source) => {
          const active = activeSources.includes(source);
          return (
            <Chip
              key={source}
              label={source.toUpperCase()}
              onClick={() => toggleSource(source)}
              variant={active ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 700,
                color: active ? '#fff' : SOURCE_COLORS[source],
                bgcolor: active ? SOURCE_COLORS[source] : 'transparent',
                borderColor: SOURCE_COLORS[source],
                '&:hover': {
                  bgcolor: active ? SOURCE_COLORS[source] : 'rgba(0,0,0,0.04)',
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}