import React from 'react';

const ResumeHeader = React.memo(({ children }) => {
  return (
    <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="section-label" style={{ marginBottom: '6px' }}>Result</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-text-primary)' }}>
              Your ATS-Optimized Resume
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
});

ResumeHeader.displayName = 'ResumeHeader';

export default ResumeHeader;
