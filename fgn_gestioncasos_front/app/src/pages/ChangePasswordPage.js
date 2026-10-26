import React, { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Avatar, Typography } from '@mui/material';
import loginPageStyles from '../styles/loginPageStyles';
import { changePassword } from '../api/auth';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


export default function ChangePasswordPage({ user, onDone }) {
  const [old_password, setOld] = useState('');
  const [new_password, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (new_password !== confirm) return setError('Las contraseñas no coinciden.');
    if (new_password === old_password) return setError('La nueva contraseña debe ser distinta.');
    setLoading(true);
    try {
      const updatedUser = await changePassword({ old_password, new_password });
      onDone( updatedUser );
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
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
            Cambio de contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Consulta Centralizada de Información de Casos DFC
          </Typography>
        </Box>

        <Typography variant="body2" align="center" color="text.error" mb={2}>
          Hola, <strong>{user.username}</strong>. Por seguridad, debes definir una contraseña nueva antes de continuar.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={submit}>
          <TextField label="Contraseña temporal" type="password" fullWidth autoFocus margin="normal" slotProps={{ input: { endAdornment: null } }}
            value={old_password} onChange={(e) => setOld(e.target.value)} required />
          <TextField label="Nueva contraseña" type="password" fullWidth margin="normal" slotProps={{ input: { endAdornment: null } }}
            value={new_password} onChange={(e) => setNew(e.target.value)} required />
          <TextField label="Confirmar nueva contraseña" type="password" fullWidth margin="normal" slotProps={{ input: { endAdornment: null } }}
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <Button type="submit" fullWidth variant="contained" sx={loginPageStyles.button} disabled={loading}>
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}