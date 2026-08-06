import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const TITLE_STYLE = { fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '10px' };
const LOADING_CONTAINER_STYLE = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' };
const BUTTON_STYLE = { width: '100%' };
const DESC_STYLE = { fontSize: '0.875rem', color: 'var(--color-text-muted)' };

const InterviewStatusCard = React.memo(({
  isLoadingReport,
  analysisReady,
  handleCheckAnalysis
}) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 style={TITLE_STYLE}>
        Interview Preparation
      </h3>
      {isLoadingReport ? (
        <div style={LOADING_CONTAINER_STYLE}>
          <LoadingSpinner size={16} />
          Generating your interview analysis in the background...
        </div>
      ) : analysisReady ? (
        <button onClick={handleCheckAnalysis} className="btn btn-primary btn-sm" style={BUTTON_STYLE}>
          Check Analysis
        </button>
      ) : (
        <p style={DESC_STYLE}>
          Analysis isn't available yet. Try again from the Analyze page.
        </p>
      )}
    </motion.div>
  );
});

InterviewStatusCard.displayName = 'InterviewStatusCard';

export default InterviewStatusCard;
