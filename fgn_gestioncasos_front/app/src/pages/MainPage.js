import React, { useState } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import mainPageStyles from '../styles/mainPageStyles';
import { InputAdornment, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/header';
import BusquedaUnificada from './BusquedaUnificada'
//import { useNavigate } from 'react-router-dom';


export default function MainPage() {

  const [form, setForm] = useState({ inputText: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  //const navigate = useNavigate();

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
    const query = form.inputText.trim();
    if (!query) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await doFetch({ inputText: query, fuentes: ['casos', 'uiaf', 'gic', 'muif'] });

      setResults(data);
    } catch (err) {
      console.error(err);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasSearched && results) {
    return (
      <BusquedaUnificada
        query={form.inputText}
        resultados={results}
        loading={loading}
        onBack={() => {
            setHasSearched(false);
            setResults(null);
            setForm({ inputText: '' });
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
          {/* Input text*/}
          <TextField
            name="inputText"
            value={form.inputText}
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
