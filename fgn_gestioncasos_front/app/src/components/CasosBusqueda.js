import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Pagination, Stack
} from '@mui/material';
import camposDescripcion from './dictionaries/diccionarioColCasos';
import { esValorValido, primeraMayus, highlightText, titleCase } from '../utils/textUtils';
import { mostrarNormalizadoCasos as mostrarNormalizado, mostrarSiNo } from '../utils/normalised';
import usePaginacion from '../utils/usePaginacion';
import DetalleDialog from './DetalleDialog';

// funcion prpal
function CasosBusqueda({ resultados = [], searchTerms=[], hasSearched=true }) {

  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  const handleSeleccionar = (caso) => setCasoSeleccionado(caso);
  const handleCerrarDialog = () => setCasoSeleccionado(null);

  const formatConRol = (nombre, rol) =>
  nombre ? (rol ? `${nombre} (${rol})` : nombre) : '';

  const getNombrePer = (p) =>
    typeof p === 'string'
      ? p
      : formatConRol(p?.c_nombre_completo, p?.c_rol_persona);

  const getNombreEmp = (e) =>
    typeof e === 'string'
      ? e
      : e?.c_razon_social || '';

  const renderListaNombres = (label, lista, getNombre) =>
    Array.isArray(lista) && lista.length > 0 ? (
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ fontSize: 12 }}>
          <strong>{label}:</strong>{' '}
          {highlightText(
            titleCase(lista.map(getNombre).filter(Boolean).join(', ')),
            searchTerms
          )}
        </Typography>
      </Box>
    ) : null;

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
            <Typography key={key} variant="body2" sx={{ mb: 0.5, fontSize:12 }}>
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
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize:12 }}>
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
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize:12, color: '#137cbd' }}>
            Radicado:
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleSeleccionar(row)}
            sx={{ fontWeight: 'bold', fontSize: '0.75rem', minWidth: 150 }}
          >
            {row.c_radicado}
          </Button>
          <Typography variant="body2" sx={{ mx: 1, fontSize:12 }}>
            | Estado: <span style={{ fontWeight: 'bold', color: '#0a237e' }}>{primeraMayus(row.c_estado)}</span>
          </Typography>
          <Typography variant="body2" sx={{ mx: 1, fontSize:12 }}>
            | Dirección: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{highlightText(String(row.c_unidad ?? '').toUpperCase(), searchTerms)}</span>
          </Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize:12, color: '#a21caf' }}>
            Hechos:
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, fontSize:12 }}>
            {row.tx_hechos
              ? highlightText(row.tx_hechos.length > 550
                  ? row.tx_hechos.slice(0, 550) + "..."
                  : row.tx_hechos, searchTerms)
              : <span style={{ color: '#888' }}>Sin información de hechos</span>}
          </Typography>
          
          {/* Lista de fulanos */}
          {renderListaNombres('Personas', row.personas, getNombrePer)}
          {renderListaNombres('Empresas', row.empresas, getNombreEmp)}

        </Box>
      </Stack>
    </Paper>
  );

  return (
    <>
      {/* Mostrar cargando */}
      {hasSearched && resultados.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#999', mt: 2 }}>
          No existen resultados para esta búsqueda. Recuerda que los datos 
          consultados son únicamente los casos de la DFC.
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
      
      {/* detalle del dialog*/}
      <DetalleDialog
        open={!!casoSeleccionado}
        onClose={handleCerrarDialog}
        title="Detalle del Caso en APLICA"
        subtitulo={casoSeleccionado?.c_radicado}
      >
        {casoSeleccionado && renderDetalleCaso(casoSeleccionado, searchTerms)}
      </DetalleDialog>

    </>
  );
}

export default CasosBusqueda;
