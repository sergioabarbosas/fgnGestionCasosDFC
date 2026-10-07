import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Stack
} from '@mui/material';
import camposDescripcion from '../components/diccionarioColumnas';
import { esValorValido, primeraMayus, highlightText } from '../utils/textUtils';
import { mostrarNormalizadoCasos as mostrarNormalizado, mostrarSiNo } from '../utils/normalised';
import usePaginacion from '../utils/usePaginacion';


// funcion prpal
function CasosBusqueda({ resultados = [], searchTerms=[], hasSearched=true }) {
  
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  const handleSeleccionar = (caso) => setCasoSeleccionado(caso);
  const handleCerrarDialog = () => setCasoSeleccionado(null);

  const camposHechos = ["tx_hechos", "tx_hipotesis", "tx_observaciones"];
  const camposBooleanos = [
    "b_asignacion_especial",
    "b_asociaciones_conexidades",
    "b_delito_transnacional",
    "b_equipo_conjunto_eci",
    "b_priorizado"
  ];

  const {
    pagina,
    totalPages,
    pageResults,
    handlePageChange,
  } = usePaginacion(resultados);

  // tarjeta para detalle del caso
  const renderDetalleCaso = (caso, terms) => {
    const keysIzquierda = Object.keys(caso).filter(
      key => !camposHechos.includes(key) && esValorValido(caso[key])
    );

    return (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, p: 1 }}>
        
        {/* Columna izquierda */}
        <Box sx={{ flex: 1 }}>
          {keysIzquierda.map(key => (
            // esValorValido(caso[key]) &&
            <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{camposDescripcion[key] || key}:</strong>{" "}
              {camposBooleanos.includes(key)
                ? highlightText(primeraMayus(mostrarSiNo(caso[key])), terms)
                : highlightText(primeraMayus(mostrarNormalizado(caso[key])), terms)}
            </Typography>
          ))}
        </Box>

        {/* Columna derecha */}
        <Box sx={{ flex: 1 }}>
          {camposHechos.map(key =>
            esValorValido(caso[key]) ? (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#a21caf', mb: 1 }}>
                  {camposDescripcion[key] || key}:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {highlightText(primeraMayus(mostrarNormalizado(caso[key])), terms)}
                </Typography>
              </Box>
            ) : null
          )}
        </Box>

      </Box>
    );
  };

  // panel para el caso genral
  const renderPanelCaso = (row, idx) => (
    <Paper elevation={4} sx={{ p: 2, mb: 1 }} key={idx}>
      <Stack spacing={0.4}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#137cbd' }}>
            Radicado:
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleSeleccionar(row)}
            sx={{ fontWeight: 'bold', fontSize: '0.80rem', minWidth: 150 }}
          >
            {row.c_radicado}
          </Button>
          <Typography variant="body2" sx={{ mx: 1 }}>
            | Estado: <span style={{ fontWeight: 'bold', color: '#0a237e' }}>{primeraMayus(row.c_estado)}</span>
          </Typography>
          <Typography variant="body2" sx={{ mx: 1 }}>
            | Dirección: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{highlightText(String(row.c_unidad ?? '').toUpperCase(), searchTerms)}</span>
          </Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a21caf' }}>
            Hechos:
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {row.tx_hechos
              ? highlightText(row.tx_hechos.length > 550
                  ? row.tx_hechos.slice(0, 550) + "..."
                  : row.tx_hechos, searchTerms)
              : <span style={{ color: '#888' }}>Sin información de hechos</span>}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <>
      {/* Mostrar cargando */}
      {hasSearched && resultados.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#999', mt: 2 }}>
          No existen resultados para esta búsqueda.
        </Typography>
      ) : (
        <>
          <Box sx={{ mt: 1 }}>
            {pageResults.map(renderPanelCaso)}

            {/* Paginación */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={pagina}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </>
      )}

      <Dialog open={!!casoSeleccionado} onClose={handleCerrarDialog} maxWidth="md" fullWidth>
        {casoSeleccionado && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  Detalle del Caso
                </Typography>
              
                <Typography variant="subtitle1" sx={{ color: '#a21caf', fontWeight: 'bold' }}>
                  {casoSeleccionado.c_radicado}
                </Typography>
                
              </Box>
            </DialogTitle>

            <DialogContent>
              {renderDetalleCaso(casoSeleccionado, searchTerms)}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCerrarDialog}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default CasosBusqueda;
