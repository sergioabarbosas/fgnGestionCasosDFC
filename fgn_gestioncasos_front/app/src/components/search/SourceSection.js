import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CasosBusqueda from "../CasosBusqueda";
import GicBusqueda from "../GICBusqueda";
import UIAFBusqueda from "../UIAFBusqueda";
import { SOURCE_COLORS } from '../../utils/sourceColors';


const SOURCE_COMPONENTS = {
  casos: CasosBusqueda,
  gic: GicBusqueda,
  uiaf: UIAFBusqueda,
  // muif: MuifBusqueda,
};


export default function SourceSection({ source, items = [],  searchTerms=[] }) {

  const SectionComponent = SOURCE_COMPONENTS[source];
  const sourceColor = SOURCE_COLORS[source] || '#cbd5e1';

  return (
    
    <Accordion 
      defaultExpanded 
      //sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}
      disableGutters
      sx={{
        mb: 2,
        mr:2,
        borderRadius: 4,
        overflow: 'hidden',
        border: `1.6px solid ${SOURCE_COLORS[source]}`,
        borderLeft: `6px solid ${SOURCE_COLORS[source]}`,
        boxShadow: 'none',
        '&:before': { display: 'none' },
      }}
      >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              bgcolor: sourceColor,
            }}
          />
          <Typography variant="body2" sx={{ fontWeight:520, color:"#6b7280" }}>
            {source.toUpperCase()} ({items.length})
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {SectionComponent ? (
          <SectionComponent
            resultados={items}
            searchTerms={searchTerms}
            hasSearched
          />
        ) : (
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Fuente no configurada.
          </Typography>

        )}
      </AccordionDetails>
    </Accordion>
  );
}
