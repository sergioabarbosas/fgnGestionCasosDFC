

// normalizar los campos de todas las fuentes

const normalizePerson = (p, source) => ({
  id: `${p.tipo_id ?? p.TipoIdentificacion}:${p.num_id ?? p.Identificacion}`,
  nombre: p.nombre_completo ?? p.NombreCompleto,
  documento: p.num_id ?? p.Identificacion,
  tipo: p.tipo_persona ?? p.TipoPersona,
  source,
});


// casos
export const adaptCasos = (r) => ({
  source: 'casos',
  id: r.c_radicado,
  titulo: `Radicado ${r.c_radicado}`,
  estado: r.c_estado,
  fecha: r.dt_fecha_denuncia_nc,
  resumen: r.tx_hechos,
  personas: [...r.personas, ...r.empresas].map((p) => normalizePerson(p, 'casos')),
});

// uiaf
export const adaptUiaf = (r) => ({
  source: 'uiaf',
  id: r.UIAFinforme,
  titulo: `Informe ${r.UIAFinforme}`,
  estado: r.main.c_delito,
  fecha: r.main.dt_informe,
  resumen: r.main.tx_hechos,
  personas: r.personas.map((p) => normalizePerson(p, 'uiaf')),
});

// gic
export const adaptGic = (r) => ({
  source: 'gic',
  id: r.IdEntrada,
  titulo: `Entrada ${r.IdEntrada}`,
  estado: r.main.EstadoTramite,
  fecha: r.main.FechaIngreso,
  resumen: r.main.ResumenHechos,
  refCruzada: r.main.RefEntrada,
  personas: r.personas.map((p) => normalizePerson(p, 'gic')),
});