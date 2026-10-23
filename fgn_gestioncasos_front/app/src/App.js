import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import { me } from './api/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <AuthPage onAuth={setUser} />;

  return <MainPage user={user} onLogout={() => setUser(null)} />;
}

export default App;