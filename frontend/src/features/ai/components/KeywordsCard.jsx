import React from 'react';
import { motion } from 'framer-motion';

const TITLE_STYLE = { fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '14px' };
const CONTAINER_STYLE = { display: 'flex', flexWrap: 'wrap', gap: '8px' };

const KeywordsCard = React.memo(({ keywordsMatched = [] }) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 style={TITLE_STYLE}>
        Keywords Matched
      </h3>
      <div style={CONTAINER_STYLE}>
        {keywordsMatched.map((kw, i) => (
          <span
            key={i}
            className="badge badge-success"
          >
            {kw}
          </span>
        ))}
      </div>
    </motion.div>
  );
});

KeywordsCard.displayName = 'KeywordsCard';

export default KeywordsCard;
