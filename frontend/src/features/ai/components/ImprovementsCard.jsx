import React from 'react';
import { motion } from 'framer-motion';

const TITLE_STYLE = { fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '14px' };
const LIST_STYLE = { display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' };
const ITEM_STYLE = { display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' };
const SVG_STYLE = { flexShrink: 0, marginTop: '2px' };

const ImprovementsCard = React.memo(({ improvements = [] }) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 style={TITLE_STYLE}>
        Key Improvements Made
      </h3>
      <ul style={LIST_STYLE}>
        {improvements.map((imp, i) => (
          <li key={i} style={ITEM_STYLE}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={SVG_STYLE}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {imp}
          </li>
        ))}
      </ul>
    </motion.div>
  );
});

ImprovementsCard.displayName = 'ImprovementsCard';

export default ImprovementsCard;
