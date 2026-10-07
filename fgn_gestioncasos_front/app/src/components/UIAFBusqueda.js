import React, { useState } from 'react';
import {
  Box, Paper, Typography, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Stack
} from '@mui/material';
import camposDescripcionUIAF from './diccionarioColumnasUIAF';
import { esValorValido, primeraMayus, titleCase, highlightText } from '../utils/textUtils';
import { mostrarNormalizadoGic as mostrarNormalizado } from '../utils/normalised';

// function highlightText(text, terms) {
//   if (text == null) return "";
//   const safeText = typeof text === "string" ? text : String(text);
//   if (!terms || (Array.isArray(terms) && terms.length === 0)) return safeText;

//   const rawTerms = Array.isArray(terms) ? terms : [terms];

//   // Construir patrones por término (usar grupos no-capturantes)
//   const parts = rawTerms.map(t => {
//     if (t === null || t === undefined) return '';
//     let s = String(t).trim();
//     if (!s) return '';

//     // Frase entre comillas -> frase exacta (espacios colapsados)
//     if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
//       const inner = s.slice(1, -1).trim();
//       if (!inner) return '';
//       const esc = inner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
//       return `(?:${esc})`;
//     }

//     const hasWildcard = s.includes('*') || s.includes('%');

//     if (hasWildcard) {
//       // escapamos todo y luego convertimos los comodines escapados a .*
//       let escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//       escaped = escaped.replace(/\\\*/g, '.*').replace(/\\%/g, '.*');
//       return `(?:${escaped})`;
//     }

//     // Si contiene espacios -> resaltamos cualquiera de las palabras (OR) 
//     // (backend debería aplicar AND si corresponde; aquí solo resaltamos ocurrencias)
//     if (/\s+/.test(s)) {
//       const toks = s.split(/\s+/).map(tok => tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(Boolean);
//       if (!toks.length) return '';
//       return `(?:${toks.join('|')})`;
//     }

//     // Término simple: buscar palabra completa usando boundaries
//     const escapedSingle = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//     return `(?:\\b${escapedSingle}\\b)`;
//   }).filter(Boolean);

//   if (!parts.length) return safeText;

//   // ordenar por longitud de patrón para priorizar matches más largos (evita fragmentación)
//   parts.sort((a, b) => b.length - a.length);

//   const regex = new RegExp(parts.join('|'), 'gi');

//   // Reconstrucción segura usando posiciones (evita duplicados)
//   const children = [];
//   let lastIndex = 0;
//   let matchIndex = 0;
//   for (const m of safeText.matchAll(regex)) {
//     const idx = m.index;
//     if (typeof idx !== 'number') continue;
//     // texto antes del match
//     if (lastIndex < idx) {
//       children.push(safeText.slice(lastIndex, idx));
//     }
//     // el match resaltado
//     const matchedText = m[0];
//     children.push(
//       <span key={`hlt-${matchIndex}`} style={{ backgroundColor: '#f010ddff', color: '#fff' }}>
//         {matchedText}
//       </span>
//     );
//     matchIndex += 1;
//     lastIndex = idx + matchedText.length;
//   }
//   // resto final
//   if (lastIndex < safeText.length) {
//     children.push(safeText.slice(lastIndex));
//   }

//   // si no hubo matches devolvemos el string original
//   if (children.length === 0) return safeText;
//   return children;
// }

// Mostrar valores normalizados y legibles
// function mostrarNormalizado(valor) {
//   // Función auxiliar para limpiar texto básico
//   function limpiarTexto(input) {
//     return typeof input === "string" ? input.trim() : ""; 
//   }
//   // Función auxiliar para obtener valores clave desde un objeto
//   function extraerValor(obj) {
//     const fullName = limpiarTexto(obj.nombre_completo);
//     if (fullName) return fullName;
//     const fallbackId = limpiarTexto(obj.num_id || obj.c_radicado);
//     if (fallbackId) return fallbackId;
//     return null;
//   }
//   // Condición: null o undefined
//   if (valor === null || valor === undefined) return "No aplica";
//   // Condición: Array
//   if (Array.isArray(valor)) {
//     if (valor.length === 0) return "No aplica";
//     const textos = valor.map(v => {
//       // Para valores no objetos retornamos como cadena
//       if (!v || typeof v !== "object") return String(v);
//       // Para objeto la función de extracción
//       const valorExtraido = extraerValor(v);
//       return valorExtraido !== null ? valorExtraido : JSON.stringify(v); // Si no encuentra, serializa como JSON
//     }).filter(Boolean);
//     return textos.length > 0 ? textos.join(", ") : "No aplica";
//   }
//   // Condición: Objeto
//   if (typeof valor === "object") {
//     const valorExtraido = extraerValor(valor);
//     return valorExtraido !== null ? valorExtraido : "No aplica";
//   }
//   // Condición: Cadena de texto
//   if (typeof valor === "string") {
//     const textoLimpiado = limpiarTexto(valor);
//     if (textoLimpiado.toLowerCase() === "n/a") return "No aplica";
//     return textoLimpiado;
//   }
//   // Condición: Número u otros
//   return String(valor);
// }


// -------------------

const PAGE_SIZE = 5;

// Funcion principal
function UIAFBusqueda({ resultados, mensaje, searchTerms, loading, hasSearched }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const [pagina, setPagina] = useState(1);
  const totalPages = Math.ceil((resultados || []).length / PAGE_SIZE);
  const pageResults = (resultados || []).slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  console.log("Resultados de búsqueda:", resultados);

  const handleSeleccionar = (item) => setSeleccionado(item);
  const handleCerrar = () => setSeleccionado(null);
  const handlePageChange = (_e, value) => setPagina(value);

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
            <Typography key={key} variant="body2" sx={{ mb: 0.3 }}>
              <strong>{camposDescripcionUIAF[key] || key}:</strong>{" "}
              {highlightText(primeraMayus(mostrarNormalizado(main[key])), terms)}
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
                Personas Asociadas al Informe de UIAF:
              </Typography>

              {/* Listado de personas utilizando cards */}
              <Stack spacing={1.5} sx={{ maxWidth: 460, margin: '0 auto' }}>
                {item.personas.map((p, i) => (
                  <Paper key={p.num_informe || p.num_id || i} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      
                      {/* Encabezado de la persona */}
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 13.5, color: '#137cbd' }}>
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
                              fontSize: 13,
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
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
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
      {mensaje ? (
        <Alert severity="info" sx={{ mb: 2 }}>{mensaje}</Alert>
      ) : hasSearched && resultados.length === 0 ? (
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
                  Detalle del Registro UIAF
                </Typography>
                <Typography variant="h6" sx={{ color: '#a21caf', mb: -4, p: 1 }}>
                  {`No. Informe UIAF: `}{ highlightText(String(idEntrada), searchTerms || []) }
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

export default UIAFBusqueda;