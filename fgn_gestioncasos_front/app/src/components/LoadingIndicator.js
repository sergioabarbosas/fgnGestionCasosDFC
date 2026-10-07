import React from "react";
import { Typography } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';

function LoadingIndicator({ message = "Buscando resultados..." }) {
  return (
    <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
        {/* <LinearProgress color="success" /> */}
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1.5, color: "#666" }}>
            {message}
        </Typography>
    </Stack>
  );
}

export default LoadingIndicator;