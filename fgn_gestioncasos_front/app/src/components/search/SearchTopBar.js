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
  casos: '#005e79',
  uiaf: '#7a0033', 
  gic: '#007a58',
};

export default function SearchTopBar({
  query,
  setQuery,
  onSearch,
  onBack,
  loading,
  activeSources,
  toggleSource,
  selectedSources
}) {

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
        size="small"
        sx={{
          flex: 1,
          minWidth: 320,
          '& .MuiOutlinedInput-root': {
            borderRadius: '999px',
            bgcolor: '#f4f7f9',
            fontSize: '0.80rem',
          },
          '& .MuiInputBase-input': {
            fontSize: '0.80rem',
          },
          '& .MuiInputBase-input::placeholder': {
            fontSize: '0.80rem',
            opacity: 0.7,
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
        {selectedSources.map((source) => {
          const active = activeSources.includes(source);
          return (
              <Chip
                key={source}
                label={source.toUpperCase()}
                onClick={() => toggleSource(source)}
                variant={active ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 650,
                  fontSize: '0.75rem',
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