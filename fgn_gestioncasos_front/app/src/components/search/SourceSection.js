import React, { useState, useEffect  } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Pagination } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ResultCard from './ResultCard';
import CasosBusqueda from "../CasosBusqueda";
import GicBusqueda from "../GICBusqueda";
import UIAFBusqueda from "../UIAFBusqueda"
import { SOURCE_COLORS } from '../../utils/sourceColors';

const PAGE_SIZE = 5;

export default function SourceSection({ source, items = [], selectedItem, onSelect, searchTerms=[] }) {

  // paginacion
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  return (
    
    <Accordion 
      defaultExpanded 
      //sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}
      disableGutters
      sx={{
        mb: 2,
        borderRadius: 4,
        overflow: 'hidden',
        border: `2px solid ${SOURCE_COLORS[source]}`,
        borderLeft: `6px solid ${SOURCE_COLORS[source]}`,
        boxShadow: 'none',
      //  '&:before': { display: 'none' },
      }}
      >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              bgcolor: SOURCE_COLORS[source],
            }}
          />
          <Typography variant="body2" sx={{ fontWeight:520, color:"#6b7280" }}>
            {source.toUpperCase()} ({items.length})
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {source === 'casos' ? (
          <CasosBusqueda
            resultados={items}
            searchTerms={searchTerms}
            loading={false}
            hasSearched
          />
        ) : source === 'gic' ? (
          <GicBusqueda
            resultados={items}
            searchTerms={searchTerms}
            hasSearched
          />
        ) : source === 'uiaf' ? (
          <UIAFBusqueda
            resultados={items}
            searchTerms={searchTerms}
            hasSearched
          />
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {items.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Sin resultados en esta fuente.
                </Typography>
              ) : (
                pageItems.map((item, idx) => (
                  <ResultCard
                    key={item.id || idx}
                    item={item}
                    source={source}
                    selected={selectedItem?.id === item.id}
                    onSelect={onSelect}
                  />
                ))
              )}
            </Box>
          
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, gap: 0.5 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_e, value) => setPage(value)}
                  size="small"
                  siblingCount={0}
                  boundaryCount={1}
                  // color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .Mui-selected': { bgcolor: `${SOURCE_COLORS[source]} !important`, color: '#fff' },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, items.length)} de {items.length}
                </Typography>
              </Box>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
