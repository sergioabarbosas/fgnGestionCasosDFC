import React, { useState } from 'react';
import { Box, Chip, IconButton, TextField } from '@mui/material';
import mainPageStyles from '../styles/mainPageStyles';
import { InputAdornment, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import Header from '../components/header';
import BusquedaUnificada from './BusquedaUnificada'
import { SOURCE_COLORS } from '../utils/sourceColors';

const ALL_SOURCES = ['casos', 'uiaf', 'gic'];


export default function MainPage() {

  const [form, setForm] = useState({ radicado: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  //const navigate = useNavigate();
  const [selectedSources, setSelectedSources] = useState([]);

  const toggleSource = (source) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const doFetch = async (payload) => {
    const res = await fetch('http://10.105.15.143:5000/api/busqueda', {    // provisional
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) throw new Error(`Error ${res.status} al consultar el servidor`);
    return res.json();
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = form.radicado.trim();
    if (!query) return;
    if (selectedSources.length === 0) {
      setError('Seleccione al menos una fuente');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(true);

    try {
      const data = await doFetch({ 
        libre: query, 
        fuentes: selectedSources // selectedSources.map((s) => (s === 'aplica' ? 'casos' : s)) // ***** priovisonal
      }); // selectedSources

      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudo consultar');
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasSearched && results) {
    return (
      <BusquedaUnificada
        query={form.radicado}
        resultados={results}
        loading={loading}
        selectedSources={selectedSources}
        onBack={() => {
            setHasSearched(false);
            setResults(null);
            setForm({ radicado: '' });
            window.history.replaceState({}, '', window.location.pathname);
            //navigate('/', { replace: true });
          }}
      />
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* background */}
      <Box
        component="video"
        src="/assets/video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        sx={ mainPageStyles.videoStyle }
      />

      {/* capa oscura video*/}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.65) 100%)',
          zIndex: 1,
        }}
      />

      {/* main content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header */}
        <Header/>
        
        {/* input search sources */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            px: 2,
            pb: 20,
            mt: 10,
          }}
        >

          {/* toggle */}
          {/* <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}> */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {/* <Typography variant="caption" sx={{ color: '#5b7280' }}>
              Seleccione fuente de consulta
            </Typography> */}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {ALL_SOURCES.map((source) => {
                const active = selectedSources.includes(source);
                const color = SOURCE_COLORS[source];
                return (
                  <Chip
                    key={source}
                    label={source.toUpperCase()}
                    onClick={() => toggleSource(source)}
                    variant="outlined"
                    icon={active ? <CheckIcon fontSize='small' sx={{ color: '#fff !important' }} /> : undefined}
                    sx={{
                      minWidth: 80,
                      height: 30,
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: '999px',
                      transition: 'all 0.2s ease',
                      justifyContent: 'center',
                      '& .MuiChip-label': {px: 1.5,},
                      // apagado al inicio
                      color: active ? '#fff' : '#454c5a',
                      bgcolor: active ? color : '#fcfdfd',
                      borderColor: active ? color : '#a5a7a8',
                      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                      opacity: active ? 1 : 0.6,
                      '&:hover': {
                        bgcolor: active ? color : '#e5e7eb',
                        borderColor: active ? color : '#cbd5e1',
                      },
                    }}
                  />
                  
                );
              })}
            </Box>            
          </Box>

          {/* Input text*/}
          <TextField
            name="radicado"//"inputText"
            value={form.radicado}
            onChange={handleChange}
            placeholder="Buscar en todas las fuentes de información de la DFC"
            autoFocus
            fullWidth
            disabled={loading}
            error={!!error}
            helperText={error}
            sx={ mainPageStyles.inputTextmain }
            autoComplete='off'
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ pl: 1.5 }}>
                  <SearchIcon sx={{ color: '#003f52' }} />
                </InputAdornment>
              ),
              autoComplete: 'off',
              endAdornment: (
                <InputAdornment position="end" sx={{ pr: 1 }}>
                  <Tooltip title="Ingrese la consulta.">
                    <IconButton edge="end" tabIndex={-1} sx={{ color: 'rgba(0, 63, 82, 0.7)' }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />

        </Box>
    </Box>
  </Box>
);
}
