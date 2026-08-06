import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from './CircularProgress';

const TITLE_STYLE = { fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '20px' };
const FLEX_CONTAINER_STYLE = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' };
const STATUS_DESC_STYLE = { fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' };

const ATSScoreCard = React.memo(({ score }) => {
  const scoreColor = useMemo(() => {
    return score >= 71 ? '#22C55E' : score >= 41 ? '#F59E0B' : '#EF4444';
  }, [score]);

  const statusText = useMemo(() => {
    return score >= 71 ? 'Excellent match' : score >= 41 ? 'Good match' : 'Needs improvement';
  }, [score]);

  const noticeText = useMemo(() => {
    return score >= 71
      ? '✓ Your resume is well-optimized for this role.'
      : score >= 41
      ? '⚠ Your resume partially matches. Some improvements were made.'
      : '✗ Significant gaps detected. Review recommendations below.';
  }, [score]);

  const scoreLabelStyle = useMemo(() => ({
    fontSize: '2rem',
    fontWeight: 800,
    color: scoreColor,
    lineHeight: 1,
  }), [scoreColor]);

  const noticeStyle = useMemo(() => ({
    padding: '12px',
    background: score >= 71 ? '#F0FDF4' : score >= 41 ? '#FFFBEB' : '#FEF2F2',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: score >= 71 ? '#15803D' : score >= 41 ? '#92400E' : '#B91C1C',
  }), [score]);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 style={TITLE_STYLE}>
        ATS Compatibility Score
      </h3>
      <div style={FLEX_CONTAINER_STYLE}>
        <CircularProgress value={score} size={100} strokeWidth={8} color={scoreColor} />
        <div>
          <p style={scoreLabelStyle}>
            {score}%
          </p>
          <p style={STATUS_DESC_STYLE}>
            {statusText}
          </p>
        </div>
      </div>
      <div style={noticeStyle}>
        {noticeText}
      </div>
    </motion.div>
  );
});

ATSScoreCard.displayName = 'ATSScoreCard';

export default ATSScoreCard;
