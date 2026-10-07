import React from 'react';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// resaltar palabra de busqueda
export function highlightText(text, terms) {
  if (text == null) return '';
  const safeText = typeof text === 'string' ? text : String(text);
  if (!terms || (Array.isArray(terms) && terms.length === 0)) return safeText;

  const rawTerms = Array.isArray(terms) ? terms : [terms];

  const parts = rawTerms
    .map((t) => {
      if (t == null) return '';
      const s = String(t).trim();
      if (!s) return '';

      // Frase exacta entre comillas
      if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
        const inner = s.slice(1, -1).trim();
        if (!inner) return '';
        return `(?:${escapeRegex(inner).replace(/\s+/g, '\\s+')})`;
      }

      // Comodines * y %
      if (s.includes('*') || s.includes('%')) {
        const escaped = escapeRegex(s).replace(/\\\*/g, '.*').replace(/\\%/g, '.*');
        return `(?:${escaped})`;
      }

      // Varias palabras: resalta cualquiera (OR)
      if (/\s+/.test(s)) {
        const toks = s.split(/\s+/).map(escapeRegex).filter(Boolean);
        return toks.length ? `(?:${toks.join('|')})` : '';
      }

      // Palabra simple
      return `(?:\\b${escapeRegex(s)}\\b)`;
    })
    .filter(Boolean);

  if (!parts.length) return safeText;

  // Prioriza los matches más largos
  parts.sort((a, b) => b.length - a.length);
  const regex = new RegExp(parts.join('|'), 'gi');

  const children = [];
  let lastIndex = 0;
  let matchIndex = 0;
  for (const m of safeText.matchAll(regex)) {
    const idx = m.index;
    if (typeof idx !== 'number') continue;
    if (lastIndex < idx) children.push(safeText.slice(lastIndex, idx));
    children.push(
      <span key={`hlt-${matchIndex++}`} style={{ backgroundColor: '#f010ddff', color: '#fff' }}>
        {m[0]}
      </span>
    );
    lastIndex = idx + m[0].length;
  }
  if (lastIndex < safeText.length) children.push(safeText.slice(lastIndex));

  return children.length ? children : safeText;
}

// validar que no sea vacío
export function esValorValido(valor) {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string" && ["", "null"].includes(valor.trim().toLowerCase())) return false;
  if (Array.isArray(valor) && valor.length === 0) return false;
  return true;
}

// primera letra en mayusc
export function primeraMayus(str) {
  if (typeof str !== "string") return str;
  if (!str.length) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Para nombres y lugares
export function titleCase(str) {
  if (!str) return '';
  return String(str)
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}




