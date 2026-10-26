import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import loginPageStyles from '../styles/loginPageStyles';
import { login } from '../api/auth';

export default function AuthPage({ onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Los campos de usuario y contraseña son obligatorios.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login({ username, password });
      onAuth(user);
    } catch (err) {
      setError(err.message || 'Error al intentar iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={loginPageStyles.root}>
      <Paper elevation={6} sx={loginPageStyles.paper}>
        <Box sx={loginPageStyles.logoBox}>
          <Avatar src="/logoAvatar.jpg" sx={loginPageStyles.avatar}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#1a237e" mb={1}>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Consulta Centralizada de Información de Casos DFC
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Usuario" variant="outlined" fullWidth autoFocus margin="normal"
            value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Contraseña" variant="outlined" fullWidth margin="normal" type="password" slotProps={{ input: { endAdornment: null } }}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={loginPageStyles.button} disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}