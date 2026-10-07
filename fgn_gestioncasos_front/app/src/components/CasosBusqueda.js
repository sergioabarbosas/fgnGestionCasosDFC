import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Stack
} from '@mui/material';
import camposDescripcion from '../components/diccionarioColumnas';


function highlightText(text, terms) {
  // Convierte a string si no lo es
  if (text == null) return ""; // para null o undefined
  const safeText = typeof text === "string" ? text : String(text);

  if (!terms.length || !safeText) return safeText;
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return safeText.split(regex).map((part, idx) =>
    terms.some(term => part.toLowerCase() === term.toLowerCase())
      ? <span key={idx} style={{ backgroundColor: '#f010ddff', color: '#fff' }}>{part}</span>
      : part
  );
}

// valido que no sea vacío
function esValorValido(valor) {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string" && ["", "null"].includes(valor.trim().toLowerCase())) return false;
  return true;
}

function primeraMayus(str) {
  if (typeof str !== "string") return str;
  if (!str.length) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Normaliza valores para mostrarlos en columnas: convierte arrays/objetos a texto legible
function mostrarNormalizado(valor) {
  // null / undefined
  if (valor === null || valor === undefined) return "No aplica";
  // Si es array de objetos (personas/empresas), intentar construir textos legibles
  if (Array.isArray(valor)) {
    if (valor.length === 0) return "No aplica";
    // intentar extraer nombre completo / razon_social / nombre_comercial / c_nit
    const textos = valor.map(v => {
      if (!v || typeof v !== 'object') return String(v);
      // Persona preferencia
      const pName = (v.c_nombre_completo || `${v.c_primer_nombre || ''} ${v.c_primer_apellido || ''}`).trim();
      if (pName) return pName;
      // Empresa preferencia
      const eName = (v.c_nombre_comercial || v.c_razon_social || v.c_nit || '').trim();
      if (eName) return eName;
      // Fallback por radicado
      if (v.c_radicado) return `Radicado: ${v.c_radicado}`;
      // última opción: stringify seguro
      try { return JSON.stringify(v); } catch { return String(v); }
    }).filter(Boolean);
    return textos.length ? textos.join(', ') : "No aplica";
  }

  // Si es objeto simple, intentar formatear con campos conocidos
  if (typeof valor === 'object') {
    const v = valor;
    const pName = (v.c_nombre_completo || `${v.c_primer_nombre || ''} ${v.c_primer_apellido || ''}`).trim();
    if (pName) return pName;
    const eName = (v.c_nombre_comercial || v.c_razon_social || v.c_nit || '').trim();
    if (eName) return eName;
    // fallback a radicado si existe
    if (v.c_radicado) return `Radicado: ${v.c_radicado}`;
    // Si no hay campos significativos, devolver 'No aplica' en vez de stringify
    return "No aplica";
  }

  // Si es string / number / boolean -> tratar 'n/a'
  if (typeof valor === "string" && valor.trim().toLowerCase() === "n/a") return "No aplica";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "number") return String(valor);
  return String(valor);
}

function mostrarSiNo(valor) {
  // función para booleanos
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "number") return valor === 1 ? "Sí" : "No";
  if (typeof valor === "string") {
    const v = valor.trim().toLowerCase();
    if (v === "1" || v === "si" || v === "sí" || v === "true") return "Sí";
    if (v === "0" || v === "no" || v === "false") return "No";
  }
  return mostrarNormalizado(valor);
}

const PAGE_SIZE = 5; // num de pag

function CasosBusqueda({ resultados = [], mensaje, searchTerms=[], hasSearched=true }) {
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  const [pagina, setPagina] = useState(1);
  const totalPages = Math.ceil(resultados.length / PAGE_SIZE);
  const pageResults = resultados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);
  
  const handleSeleccionar = (caso) => setCasoSeleccionado(caso);
  const handleCerrarDialog = () => setCasoSeleccionado(null);
  const handlePageChange = (_event, value) => setPagina(value);
  const camposHechos = ["tx_hechos", "tx_hipotesis", "tx_observaciones"];
  const camposBooleanos = [
    "b_asignacion_especial",
    "b_asociaciones_conexidades",
    "b_delito_transnacional",
    "b_equipo_conjunto_eci",
    "b_priorizado"
  ];

  useEffect(() => {
    setPagina(1);
  }, [resultados]);

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
      {mensaje ? (
        <Alert severity="info" sx={{ mb: 2 }}>{mensaje}</Alert>
      ) : hasSearched && resultados.length === 0 ? (
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
