import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { login, register } from '../api/auth';

export default function AuthPage({ onAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = isRegister
        ? await register(form)
        : await login({ username: form.username, password: form.password });
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ p: 3, width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" mb={2}>
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack component="form" spacing={2} onSubmit={submit}>
          <TextField label="Usuario" name="username" value={form.username} onChange={onChange} required />
          {isRegister && (
            <TextField label="Correo (opcional)" name="email" value={form.email} onChange={onChange} />
          )}
          <TextField label="Contraseña" name="password" type="password" value={form.password} onChange={onChange} required />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </Button>
          <Button type="button" onClick={() => setIsRegister((v) => !v)}>
            {isRegister ? 'Ya tengo cuenta' : 'No tengo cuenta'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}