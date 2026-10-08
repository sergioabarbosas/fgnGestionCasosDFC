import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Pagination, Stack
} from '@mui/material';
import { esValorValido, primeraMayus, titleCase, highlightText } from '../utils/textUtils';
import { mostrarNormalizadoGic as mostrarNormalizado } from '../utils/normalised';
import usePaginacion from '../utils/usePaginacion';
import DetalleDialog from './DetalleDialog';
import camposDescripcionGic, {
  GIC_PERSONA,
  GIC_PERSONA_CARD_KEYS,
  GIC_TRAMITE,
} from './dictionaries/diccionarioColGic';


// renderizar claves y valores como tabla
function renderClaveValor(data, dict, keys, terms) {
  return keys.map((key) => (
    <Typography variant="body2" sx={{ fontSize: 12 }} key={key}>
      <strong>{dict[key] || key}:</strong>{" "}
      {highlightText(mostrarNormalizado(data[key]) || "Sin información", terms)}
    </Typography>
  ));
}


// Funcion principal
function GicBusqueda({ resultados = [], searchTerms=[], hasSearched=true }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const handleSeleccionar = (item) => setSeleccionado(item);
  const handleCerrar = () => setSeleccionado(null);
  console.info("resultados gic: ", resultados)
  const {
    pagina,
    totalPages,
    pageResults,
    handlePageChange,
  } = usePaginacion(resultados);

  // campos columna derecha
  const camposHechosGic = [ "ResumenHechos", "Lugar de los hechos", "LugarHechos" ]
  // booleanos
  const camposBooleanos = [ "EsActivo", "RealizaVerificacion", "RealizaAnalisis" ];
  // Id Entrada / title
  const idEntrada = seleccionado?.IdEntrada || seleccionado?.main?.IdEntrada || seleccionado?.Title || "";

  const renderDetalle = (item, terms) => {
    const main = item && item.main ? item.main : {};

    // keys left: todas las keys de main excluye Hechos y vacíos
    const keysIzquierda = Object.keys(main || {}).filter(
      key => !camposHechosGic.includes(key) && esValorValido(main[key])
    );

    return (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, p: 1 }}>
        {/* Izquierda: metadatos */}
        <Box sx={{ flex: 1 }}>
          {keysIzquierda.map(key => (
            <Typography key={key} variant="body2" sx={{ fontSize: 12, mb: 0.3 }}>
              <strong>{camposDescripcionGic[key] || key}:</strong>{" "}
              {camposBooleanos.includes(key)
                ? highlightText(primeraMayus(String(main[key])), terms)
                : highlightText(primeraMayus(mostrarNormalizado(main[key])), terms)}
            </Typography>
          ))}

          {/* Lista de fulanos */}
          {item.personasList && (
            <Typography variant="body2" sx={{ fontSize: 12, mt: 0.7 }}>
              <strong>Lista de Personas:</strong> {highlightText(titleCase(item.personasList), terms)}
            </Typography>
          )}

          {/* Tabla de Personas (lista completa) */}
          {Array.isArray(item.personas) && item.personas.length > 0 && (
            <>
              <Typography variant="h6" sx={{ color: '#a21caf', mt: 2, mb: 0.7 }}>
                Personas Asociadas al IdEntrada:
              </Typography>

              <Stack spacing={2} sx={{ maxWidth: 400, margin: '1 auto', }}>
                {item.personas.map((p, i) => (
                  <Paper sx={{ p: 1, border: '1px solid #ddd', borderRadius: 2 }}>
                    <Box key={p.Title || p.Identificacion || i} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {renderClaveValor(p, GIC_PERSONA, GIC_PERSONA_CARD_KEYS, terms)}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Box>

        {/* Derecha: textos largos */}
        <Box sx={{ flex: 1 }}>
          {camposHechosGic.map(key =>
            esValorValido(main[key]) ? (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#a21caf', mb: 1 }}>
                  {camposDescripcionGic[key] || key}:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12, whiteSpace: 'pre-line' }}>
                  {highlightText(primeraMayus(mostrarNormalizado(main[key])), terms)}
                </Typography>
              </Box>
            ) : null
          )}

          {/* Información de Trámites */}
          <Typography variant="h6" sx={{ color: '#a21caf', mb: 2}}>
            Información del Trámite
          </Typography>
          {/* Trámites cards */}
          <Stack spacing={2} sx={{ mt: 5, maxWidth: 460, margin: '0 auto' }}>
            {item.tramites.map((t, i) => (
              <Paper key={t.IdEntrada || t.Resultado || i} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Encabezado del tramite */}
                  <Typography variant="body2" sx={{ fontSize: 13, color: '#374151', fontWeight: 'bold', mt: 0.5 }}>
                    Resultado del Informe: <span style={{ color: '#ff5733', fontWeight: 'bold' }}>
                      {highlightText(t.ResultadoInforme || "Por determinar", terms)}
                    </span>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13, color: '#374151', fontWeight: 'bold', mt: 0 }}>
                    Radicado: <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                      {highlightText(t.NúmeroProcesoGenerado || "Por determinar", terms)}
                    </span>
                  </Typography>

                  {/* Detalle tramite */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, rowGap: 1.5, columnGap: 2 }}>
                    {renderClaveValor(t, GIC_TRAMITE, Object.keys(GIC_TRAMITE), terms)}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  };

  const renderPanel = (item, idx) => {
    const main = item && item.main ? item.main : {};
    const titulo = item && item.IdEntrada ? item.IdEntrada : (main && main.Title ? main.Title : '—');
    const estado = main && (main.UltimoEstadoTramite || main.EstadoTramite) ? (main.UltimoEstadoTramite || main.EstadoTramite) : '';
    const lugar = main && (main.LugarHecho || main["Lugar de los hechos"]) ? (main.LugarHecho || main["Lugar de los hechos"]) : '';

    const hechos = [main ? (main.ResumenHechos || '') : '',].filter(Boolean);
    const hechosPreview = hechos.length
      ? (hechos[0].length > 450 ? hechos[0].slice(0, 550) + "(...)" : hechos[0])
      : '';
    // const hechosFull = main && ( main.ResumenHechos ) ? ( main.ResumenHechos ) : '';

    return (
      <Paper elevation={6} sx={{ p: 2, mb: 2 }} key={idx}>
        <Stack spacing={0.8}>
          <Box sx={{ display: 'flex', flexwrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#137cbd', fontSize:12 }}>IdEntrada:</Typography>
            <Button variant="outlined" color="primary" size="small" onClick={() => handleSeleccionar(item)} sx={{ fontWeight: 'bold', fontSize: '0.75rem', minWidth: 150 }}>
              {titulo}
            </Button>

            <Typography variant="body2" sx={{ mx: 1, fontSize:12 }}>
              | Estado: <span style={{ fontWeight: 'bold', color: '#0a237e' }}>{primeraMayus(estado)}</span>
            </Typography>

            <Typography variant="body2" sx={{ mx: 1, fontSize:12 }}>
              {lugar ? <>| Lugar de los Hechos: <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>{highlightText(String(titleCase(lugar)), searchTerms)}</span></> : null}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a21caf',fontSize:12 }}>Hechos:</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize:12 }}>
              {hechosPreview
                ? highlightText(hechosPreview.length > 550 ? hechosPreview.slice(0, 440) + "..." : hechosPreview, searchTerms)
                : <span style={{ color: '#888' }}>Sin información de hechos</span>}
            </Typography>
          </Box>

          {/* resumen personas (si existe) */}
          {item.personasList && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{fontSize:12}} >
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
        title="Detalle del Registro en GIC"
        subtitulo={highlightText(`Id Entrada: ${idEntrada}`, searchTerms || [])}
      >
        {seleccionado && renderDetalle(seleccionado, searchTerms)}
      </DetalleDialog>

    </>
  );
}

export default GicBusqueda;