import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, Pagination, Stack
} from '@mui/material';
import camposDescripcionGic from './dictionaries/diccionarioColGic';
import { esValorValido, primeraMayus, titleCase, highlightText } from '../utils/textUtils';
import { mostrarNormalizadoGic as mostrarNormalizado } from '../utils/normalised';
import usePaginacion from '../utils/usePaginacion';


// Función para renderizar claves y valores (como tabla)
function renderClaveValor(data, headers, terms) {
  return headers.map(header => (
    <Typography variant="body2" sx={{ fontSize: 13 }} key={header.key}>
      <strong>{header.label}:</strong>{" "}
      {highlightText(mostrarNormalizado(data[header.key]) || "Sin información", terms)}
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
            <Typography key={key} variant="body2" sx={{ mb: 0.3 }}>
              <strong>{camposDescripcionGic[key] || key}:</strong>{" "}
              {camposBooleanos.includes(key)
                ? highlightText(primeraMayus(String(main[key])), terms)
                : highlightText(primeraMayus(mostrarNormalizado(main[key])), terms)}
            </Typography>
          ))}

          {/* Lista de fulanos */}
          {item.personasList && (
            <Typography variant="body2" sx={{ mt: 0.7 }}>
              <strong>Listado de Personas:</strong> {highlightText(titleCase(item.personasList), terms)}
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
                    {renderClaveValor(p, [
                      { key: "NombreCompleto", label: "Nombre completo" },
                      { key: "Identificacion", label: "Identificación" },
                      { key: "TipoIdentificacion", label: "Tipo de Identificación" },
                      { key: "RelacionPersona", label: "Rol de la persona" },
                    ], terms)}
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
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
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
                    {renderClaveValor(t, [
                      { key: "Created", label: "Fecha de Creación" },
                      { key: "Created By", label: "Creado por" },
                      { key: "Decisión FiscalUGIC", label: "Decisión del Fiscal" },
                      { key: "DescripciónResultado", label: "Descrip. resultado" },
                      { key: "DestinoDireccion", label: "Dirección de destino" },
                      { key: "DestinoSeccional", label: "Seccional de destino" },
                      { key: "EsActivo", label: "Estado" },
                      { key: "FechaAsignacionUGIC", label: "Fecha asignación UGIC" },
                      { key: "FechaEntregaDEIF", label: "Fecha entrega DEIF" },
                      { key: "FechaMesaTrabajo", label: "Fecha mesa de trabajo" },
                      { key: "FechaRegistroTramite", label: "Fecha de registro trámite" },
                      { key: "FechaUsuarioModificaTramite", label: "Fecha de modificación de registro" },
                      { key: "FiscalResponsableUGIC", label: "Fiscal responsable UGIC" },
                      { key: "GenNumIntervTemp", label: "GenNumIntervTemp" },
                      { key: "GenNumIntervTempDEIF", label: "GenNumIntervTempDEIF"},
                      { key: "NivelRelevancia", label: "Nivel de relevancia"},
                      { key: "Modified By", label: "Modificado por"},
                      { key: "NoCasosAsociados", label: "No. casos asociados"},
                      { key: "NoCasosIdentAsoc", label: "NoCasosIdentAsoc"},
                      { key: "NumAsignacion", label: "No. asignación"},
                      { key: "NumIniciativaDEIF", label: "No. iniciativa DEIF"},
                      { key: "NumIntervTemp", label: "NumIntervTemp"},
                      { key: "PolJudAsignada", label: "Policía Judicial asignada"},
                      { key: "RealizaMesaTrabajo", label: "Realiza mesa de trabajo"},
                      { key: "Resultado", label: "Resultado"},
                      { key: "ResultadoInforme", label: "Resultado informe"},
                      { key: "SistemaDestino", label: "Sist. destino"},
                      { key: "SustentoNivelPrioridad", label: "Sustento nivel prioridad"},
                      { key: "TipoGestion", label: "Tipo de gestión"},
                      { key: "TipoMesaTrabajo", label: "Tipo de mesa de trabajo"},
                      { key: "Title", label: "Title"},
                      { key: "UsuarioCreadorTramite", label: "Usuario que creó el trámite"},
                      { key: "UuarioModificaTramite", label: "Usuario que modifica el trámite"},
                    ], terms)}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#137cbd' }}>IdEntrada:</Typography>
            <Button variant="outlined" color="primary" size="small" onClick={() => handleSeleccionar(item)} sx={{ fontWeight: 'bold', fontSize: '0.85rem', minWidth: 150 }}>
              {titulo}
            </Button>

            <Typography variant="body2" sx={{ mx: 1 }}>
              | Estado: <span style={{ fontWeight: 'bold', color: '#0a237e' }}>{primeraMayus(estado)}</span>
            </Typography>

            <Typography variant="body2" sx={{ mx: 1 }}>
              {lugar ? <>| Lugar de los Hechos: <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>{highlightText(String(titleCase(lugar)), searchTerms)}</span></> : null}
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

      <Dialog open={!!seleccionado} onClose={handleCerrar} maxWidth="md" fullWidth>
        {seleccionado && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" align='center' sx={{ color: 'text.secondary', mb: -1, p: 1}}>
                  Detalle del Registro GIC
                </Typography>
                <Typography variant="h6" sx={{ color: '#a21caf', mb: -4, p: 1 }}>
                  {`Id Entrada: `}{ highlightText(String(idEntrada), searchTerms || []) }
                </Typography>
              </Box>
            </DialogTitle>

            <DialogContent>
              {renderDetalle(seleccionado, searchTerms)}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCerrar}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default GicBusqueda;