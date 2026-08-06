import React from 'react';
import ATSScoreCard from './ATSScoreCard';
import InterviewStatusCard from './InterviewStatusCard';
import KeywordsCard from './KeywordsCard';
import ImprovementsCard from './ImprovementsCard';
import JobMatchesCard from './JobMatchesCard';

const CONTAINER_STYLE = { display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '90px' };

const ResumeSidebar = React.memo(({
  score,
  isLoadingReport,
  analysisReady,
  handleCheckAnalysis,
  keywordsMatched,
  improvements,
  jobs,
  isLoadingJobs,
  jobsWarning,
}) => {
  return (
    <div style={CONTAINER_STYLE}>
      <ATSScoreCard score={score} />
      <InterviewStatusCard
        isLoadingReport={isLoadingReport}
        analysisReady={analysisReady}
        handleCheckAnalysis={handleCheckAnalysis}
      />
      <JobMatchesCard
        jobs={jobs}
        isLoadingJobs={isLoadingJobs}
        jobsWarning={jobsWarning}
      />
      <KeywordsCard keywordsMatched={keywordsMatched} />
      <ImprovementsCard improvements={improvements} />
    </div>
  );
});

ResumeSidebar.displayName = 'ResumeSidebar';

export default ResumeSidebar;