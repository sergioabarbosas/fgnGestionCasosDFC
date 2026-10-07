import { useEffect, useMemo, useState } from 'react';


const PAGE_SIZE = 5; // num elementos x pag

export default function usePaginacion(resultados = [], pageSize = PAGE_SIZE) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [resultados]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((resultados || []).length / pageSize)),
    [resultados, pageSize]
  );

  const pageResults = useMemo(
    () => (resultados || []).slice((pagina - 1) * pageSize, pagina * pageSize),
    [resultados, pagina, pageSize]
  );

  const handlePageChange = (_event, value) => setPagina(value);

  return {
    pagina,
    setPagina,
    totalPages,
    pageResults,
    handlePageChange,
  };
}