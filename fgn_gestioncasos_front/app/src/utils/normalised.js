import React from 'react';


/**
 * extractor(obj) -> string | null
 */

const limpiar = (s) => (typeof s === 'string' ? s.trim() : '');


export function crearNormalizador(extractor) {
    
    const deObjeto = (obj) => extractor(obj) || null;

    return function mostrarNormalizado(valor) {

        if (valor === null || valor === undefined) return 'No aplica';

        if (Array.isArray(valor)) {

            if (valor.length === 0) return 'No aplica';

        const textos = valor
            .map((v) => {
            if (!v || typeof v !== 'object') return String(v);
            const extraido = deObjeto(v);
            if (extraido) return extraido;
            try { return JSON.stringify(v); } catch { return String(v); }
            })
            .filter(Boolean);
        return textos.length ? textos.join(', ') : 'No aplica';
        
        }

    if (typeof valor === 'object') return deObjeto(valor) || 'No aplica';

    if (typeof valor === 'string') {
    const t = valor.trim();
    return t.toLowerCase() === 'n/a' ? 'No aplica' : t;
    }
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    return String(valor);
  };
}

// --- extractores por fuente ---

// aplica
export const extraerCasos = (v) => {
    // personas y empresas de aplica
    const persona = limpiar(v.c_nombre_completo || `${v.c_primer_nombre || ''} ${v.c_primer_apellido || ''}`);
    if (persona) return persona;
    const empresa = limpiar(v.c_nombre_comercial || v.c_razon_social || v.c_nit);
    if (empresa) return empresa;
    if (v.c_radicado) return `Radicado: ${v.c_radicado}`;
    return null;
};
// gic
export const extraerGic = (v) => {
  const persona = limpiar(v.NombreCompleto || `${v.Nombre_1 || ''} ${v.Apellido_1 || ''}`);
  if (persona) return persona;
  return limpiar(v.Identificacion || v.Title) || null;
};
// uiaf
export const extraerUiaf = (v) =>
  limpiar(v.nombre_completo) || limpiar(v.num_id || v.c_radicado) || null;


export const mostrarNormalizadoCasos = crearNormalizador(extraerCasos);
export const mostrarNormalizadoGic = crearNormalizador(extraerGic);
export const mostrarNormalizadoUiaf = crearNormalizador(extraerUiaf);

// booleanos (usado en aplica y gic)
export function mostrarSiNo(valor, normalizar = mostrarNormalizadoCasos) {
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (typeof valor === 'number') return valor === 1 ? 'Sí' : 'No';
  if (typeof valor === 'string') {
    const v = valor.trim().toLowerCase();
    if (['1', 'si', 'sí', 'true'].includes(v)) return 'Sí';
    if (['0', 'no', 'false'].includes(v)) return 'No';
  }
  return normalizar(valor);
}


