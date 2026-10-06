import React, { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SearchTopBar from '../components/search/SearchTopBar';
import SourceSection from '../components/search/SourceSection';
import GraphPanel from '../components/search/GraphPanel';
import DetailPanel from '../components/search/DetailPanel';
import Header from '../components/header';

const ALL_SOURCES = ['casos', 'uiaf', 'gic', 'muif'];

export default function BusquedaUnificada({ query = '', resultados = {}, loading = false, onBack }) {
  const [activeSources, setActiveSources] = useState(ALL_SOURCES);
  const [selectedItem, setSelectedItem] = useState(null);

  const visibleResults = useMemo(() => {
    const filtered = {};
    ALL_SOURCES.forEach((source) => {
      const list = resultados?.[source] || [];
      filtered[source] = activeSources.includes(source) ? list : [];
    });
    return filtered;
  }, [resultados, activeSources]);

  const totalResults = Object.values(visibleResults).reduce((acc, list) => acc + list.length, 0);

  const toggleSource = (source) => {
    setActiveSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  return (

    <Box sx={{ height: '100vh', overflow: "hidden", display: 'flex', flexDirection: 'column', bgcolor: '#f4f7f9' }}>

    <Header/>

      <SearchTopBar
        query={query}
        setQuery={() => {}}
        onSearch={() => {}}
        onBack={onBack}
        loading={loading}
        activeSources={activeSources}
        toggleSource={toggleSource}
      />

      <Box sx={{ px: 3, py: 1, borderBottom: '1px solid #dbe3e8', bgcolor: '#fff' }}>
        <Typography variant="caption" sx={{ color: '#5b7280' }}>
          {totalResults} Resultados · {activeSources.length}/{ALL_SOURCES.length} Fuentes activas
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gridTemplateRows: 'minmax(0, 1fr)', 
          gap: 2,
          p: 2,
        }}
      >
        {/* izq */}
        <Box sx={{ minHeight: 0, overflowY: 'auto', pr: 1 }}>
          {ALL_SOURCES.map((source) =>
            activeSources.includes(source) ? (
              <SourceSection
                key={source}
                source={source}
                items={visibleResults[source]}
                selectedItem={selectedItem}
                onSelect={setSelectedItem}
              />
            ) : null
          )}
        </Box>

        {/* der */}
        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: 'minmax(320px, 3fr) minmax(240px, 2fr)',
            gap: 2,
          }}
        >
          <GraphPanel selectedItem={selectedItem} items={visibleResults} />
          <DetailPanel selectedItem={selectedItem} />
        </Box>
      </Box>
    </Box>
  );
}