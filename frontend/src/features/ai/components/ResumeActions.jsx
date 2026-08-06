import React, { useMemo } from 'react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const CONTAINER_STYLE = { display: 'flex', gap: '10px', flexWrap: 'wrap' };

const ResumeActions = React.memo(({
  handleCopy,
  handleDownloadPDF,
  handleCheckAnalysis,
  analysisReady,
  isLoadingReport,
  interviewReportData,
  navigate
}) => {
  const analysisBtnStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: analysisReady ? 1 : 0.6,
    cursor: analysisReady ? 'pointer' : 'not-allowed',
  }), [analysisReady]);

  return (
    <div style={CONTAINER_STYLE}>
      <button id="copy-btn" onClick={handleCopy} className="btn btn-outline btn-sm">
        Copy to Clipboard
      </button>
      <button onClick={handleDownloadPDF} className="btn btn-outline btn-sm" id="download-resume-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Download .pdf
      </button>
      <button
        onClick={handleCheckAnalysis}
        disabled={!analysisReady}
        className="btn btn-outline btn-sm"
        id="check-analysis-btn"
        title={
          isLoadingReport
            ? 'Your interview analysis is still being generated'
            : !interviewReportData
              ? 'Analysis is not available yet'
              : 'View your interview preparation report'
        }
        style={analysisBtnStyle}
      >
        {isLoadingReport ? (
          <>
            <LoadingSpinner size={14} />
            Analyzing...
          </>
        ) : analysisReady ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Check Analysis
          </>
        ) : (
          'Analysis Unavailable'
        )}
      </button>
      <button onClick={() => navigate('/analyze')} className="btn btn-primary btn-sm" id="analyze-again-btn">
        Analyze Again
      </button>
    </div>
  );
});

ResumeActions.displayName = 'ResumeActions';

export default ResumeActions;
