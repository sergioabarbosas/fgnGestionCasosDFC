import { Box, Container, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import logo from "../assets/logo_mod.png";
import mainPageStyles from '../styles/mainPageStyles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';


export default function Header() {
  
  return (
      <Container maxWidth="xl">
        <Box sx={mainPageStyles.header}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: 50, objectFit: 'contain', display: 'block' }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff' }}>
                Consulta Centralizada de Información
              </Typography>
              <Typography variant="subtitle2" sx={{ fontStyle: 'italic', color: '#fff' }}>
                Aplicativo orientativo para la consulta de casos de la DFC.
              </Typography>
            </Box>
          </Box>

          <Button
            type="button"
            variant="contained"
            endIcon={<ExitToAppIcon />}
            sx={ mainPageStyles.logoutButton }
          >
            Salir
          </Button>
        </Box>
      </Container>
  );
}