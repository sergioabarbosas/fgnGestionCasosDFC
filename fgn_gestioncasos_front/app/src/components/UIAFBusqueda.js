import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Stack
} from '@mui/material';
import camposDescripcionUIAF from './dictionaries/diccionarioColUIAF';
import { esValorValido, primeraMayus, titleCase, highlightText } from '../utils/textUtils';
import { mostrarNormalizadoGic as mostrarNormalizado } from '../utils/normalised';
import usePaginacion from '../utils/usePaginacion';
import DetalleDialog from './DetalleDialog';


// Funcion principal
function UIAFBusqueda({ resultados, searchTerms, hasSearched }) {

  //console.log("Resultados de búsqueda:", resultados);
  const [seleccionado, setSeleccionado] = useState(null);
  const handleSeleccionar = (item) => setSeleccionado(item);
  const handleCerrar = () => setSeleccionado(null);

  const {
    pagina,
    totalPages,
    pageResults,
    handlePageChange,
  } = usePaginacion(resultados);

  // campos columna derecha
  const camposHechosUIAF = [ "tx_hechos", "Lugar de los hechos", "c_departamento" ]
  
  // Num_informe
  const idEntrada = seleccionado?.num_informe || seleccionado?.main?.num_informe || seleccionado?.c_radicado || "";

  const renderDetalle = (item, terms) => {

    const main = item && item.main ? item.main : {};
    
    // keys left: todas las keys de main excluye Hechos y vacíos
    const keysIzquierda = Object.keys(main || {}).filter(
      key => !camposHechosUIAF.includes(key) && esValorValido(main[key])
    );

    return (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 1 }}>
        
        {/* Izquierda: metadatos */}
        <Box sx={{ flex: 1 }}>
          {keysIzquierda.map(key => (
            <Typography key={key} variant="body2" sx={{ fontSize: 12, mb: 0.3 }}>
              <strong>{camposDescripcionUIAF[key] || key}:</strong>{" "}
              {highlightText(primeraMayus(mostrarNormalizado(main[key])), terms)}
            </Typography>
          ))}

          {/* Lista de fulanos */}
          {item.personasList && (
            <Typography variant="body2" sx={{ mt: 0.7, fontSize: 12 }}>
              <strong>Listado de Personas:</strong> {highlightText(titleCase(item.personasList), terms)}
            </Typography>
          )}

          {/* Tabla de Personas (lista completa) */}
          {Array.isArray(item.personas) && item.personas.length > 0 && (
            <>
              <Typography variant="h6" sx={{ color: '#a21caf', mt: 2, mb: 0.7 }}>
                Personas Asociadas al Informe de UIAF:
              </Typography>

              {/* Listado de personas utilizando cards */}
              <Stack spacing={1.5} sx={{ maxWidth: 460, margin: '0 auto' }}>
                {item.personas.map((p, i) => (
                  <Paper key={p.num_informe || p.num_id || i} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      
                      {/* Encabezado de la persona */}
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 12, color: '#137cbd' }}>
                        {highlightText(p.nombre_completo || "Sin Nombre", terms)}
                        {" - "}
                        <span style={{ color: '#ff5733', fontWeight: 'bold' }}>
                          {highlightText(p.tipo_persona || "Sin Tipo", terms)}
                        </span>
                      </Typography>

                      {/* Detalles organizados como tabla */}
                      <Box 
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                          rowGap: 1, 
                          columnGap: 2 
                          }}
                        >
                        {[
                          { key: "tipo_id", label: "Tipo de ID" },
                          { key: "num_id", label: "Número de ID" },
                          { key: "c_nacionalidad", label: "Nacionalidad" },
                          { key: "c_org_criminal", label: "Organización Criminal" },
                          { key: "Por vinculacion internacional", label: "Vinculación Internacional" },
                          { key: "c_departamento", label: "Departamento" },
                          { key: "c_ciudad", label: "Ciudad" },
                          { key: "c_sector_economico", label: "Sector Económico" }
                        ].map(header => (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: 12,
                              wordWrap: "break-word",
                              overflow: "hidden",
                              whiteSpace: "pre-wrap"
                            }} 
                            key={header.key}>
                            <strong>{header.label}:</strong>{" "}
                            {highlightText(mostrarNormalizado(p[header.key]) || "Sin información", terms)}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Box>

        {/* Derecha: textos largos */}
        <Box sx={{ flex: 1 }}>
          {camposHechosUIAF.map(key =>
            esValorValido(main[key]) ? (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#a21caf', mb: 1 }}>
                  {camposDescripcionUIAF[key] || key}:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: 12 }}>
                  {highlightText(primeraMayus(mostrarNormalizado(main[key])), terms)}
                </Typography>
              </Box>
            ) : null
          )}
        </Box>
      </Box>
    );
  };

  const renderPanel = (item, idx) => {
    const main = item && item.main ? item.main : {};
    const titulo = item && item.num_informe ? item.num_informe : (main && main.num_informe ? main.num_informe : '—');
    const radicado = item && item.c_radicado ? item.c_radicado : (main && main.c_radicado ? main.c_radicado : '-');
    const fecha = item && item.dt_informe ? item.dt_informe : (main && main.dt_informe ? main.dt_informe : '-');
    const direccion = main && (main.c_direccion_cargo || main["c_direccion_cargo"]) ? (main.LugarHecho || main["c_direccion_cargo"]) : '';
    
    const hechos = [main ? (main.tx_hechos || '') : '',].filter(Boolean);
    const hechosPreview = hechos.length
      ? (hechos[0].length > 450 ? hechos[0].slice(0, 550) + "(...)" : hechos[0])
      : '';
    // const hechosFull = main && ( main.ResumenHechos ) ? ( main.ResumenHechos ) : '';

    return (
      <Paper elevation={6} sx={{ p: 2, mb: 2 }} key={idx}>
        <Stack spacing={0.8}>
          <Box sx={{ display: 'flex', flexwrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#137cbd' }}>No. Informe UIAF:</Typography>
            <Button variant="outlined" color="primary" size="small" onClick={() => handleSeleccionar(item)} sx={{ fontWeight: 'bold', fontSize: '0.85rem', minWidth: 150 }}>
              {titulo}
            </Button>

            <Typography variant="body2" sx={{ mx: 1 }}>
              | Radicado: <span style={{ fontWeight: 'bold', color: '#0a237e' }}>{radicado}</span>
            </Typography>

            <Typography variant="body2" sx={{ mx: 1 }}>
              {direccion ? <>| Dirección a cargo: <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>{highlightText(String(direccion), searchTerms)}</span></> : null}
            </Typography>

            <Typography variant="body2" sx={{ mx: 1 }}>
              {fecha ? <>| Fecha del Informe: <span style={{ color: '#b910abff', fontWeight: 'bold', fontSize: '0.85rem' }}>{highlightText(String(fecha), searchTerms)}</span></> : null}
            </Typography>

          </Box>

          <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a21caf' }}>Hechos:</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {hechosPreview
                ? highlightText(hechosPreview.length > 550 ? hechosPreview.slice(0, 440) + "..." : hechosPreview, searchTerms)
                : <span style={{ color: '#888' }}>Sin información de hechos</span>}
            </Typography>
          </Box>

          {/* resumen personas (si existe) */}
          {item.personasList && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Personas:</strong> {highlightText(titleCase(item.personasList), searchTerms)}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    );
  };

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
            {pageResults.map(renderPanel)}

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
        open={!!seleccionado}
        onClose={handleCerrar}
        title="Detalle del Registro en UIAF"
        subtitulo={highlightText(`No. Informe UIAF: ${idEntrada}`, searchTerms || [])}
      >
        {seleccionado && renderDetalle(seleccionado, searchTerms)}
      </DetalleDialog>

    </>
  );
}

export default UIAFBusqueda;
