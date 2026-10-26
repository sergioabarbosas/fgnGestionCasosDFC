import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { changePassword, logout } from '../api/auth';

export default function AccountPage({ user, onLogout }) {
  const [old_password, setOld] = useState('');
  const [new_password, setNew] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onChangePass = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await changePassword({ old_password, new_password });
      setMsg('Contraseña actualizada.');
      setOld('');
      setNew('');
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const onSignOut = async () => {
    try {
      await logout(); // POST /api/auth/logout/
    } catch (_) {
      // aunque falle el backend, cerramos sesión local
    } finally {
      onLogout(); // setUser(null)
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Hola, {user.username}</Typography>
      <Box component="form" onSubmit={onChangePass} mt={2}>
        <Stack spacing={2}>
          {msg && <Alert severity="success">{msg}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}
          <TextField label="Contraseña actual" type="password" value={old_password} onChange={(e) => setOld(e.target.value)} required />
          <TextField label="Nueva contraseña" type="password" value={new_password} onChange={(e) => setNew(e.target.value)} required />
          <Button type="submit" variant="contained">Cambiar contraseña</Button>

          <Button color="error" variant="outlined" onClick={onSignOut}>
            Cerrar sesión
          </Button>

        </Stack>
      </Box>
    </Paper>
  );
}