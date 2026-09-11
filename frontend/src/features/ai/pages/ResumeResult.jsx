import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAI from '../../../context/useAI';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import PageTransition from '../../../components/ui/PageTransition';
import { ResumeResultSkeleton } from '../../../components/ui/SkeletonLoader';
import { matchJobsFromText } from '../../../services/ai.api';
import SEO from '../../../components/ui/SEO';

import ResumeHeader from '../components/ResumeHeader';
import ResumeContent from '../components/ResumeContent';
import ResumeActions from '../components/ResumeActions';
import ResumeSidebar from '../components/ResumeSidebar';

import { normalizeAtsData } from '../utils/normalizeAtsData';
import { buildPlainText } from '../utils/buildPlainText';
import { handleDownloadPDF } from '../utils/resumePdf';

const GRID_CONTAINER_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 360px',
  gap: '32px',
  alignItems: 'start',
};

const ResumeResult = () => {
  const navigate = useNavigate();
  const {
    atsResumeData, isLoadingResume, isLoadingReport, interviewReportData,
    jobMatches, setJobMatches, isLoadingJobs, setIsLoadingJobs, jobsWarning, setJobsWarning,
  } = useAI();

  // Guard: if there is no data and we're not loading, the user navigated here
  // directly (e.g. refreshed the page). Redirect back to /analyze.
  useEffect(() => {
    if (!isLoadingResume && !atsResumeData) {
      navigate('/analyze', { replace: true });
    }
  }, [isLoadingResume, atsResumeData, navigate]);

  const data = useMemo(() => normalizeAtsData(atsResumeData), [atsResumeData]);
  const resume = data.resume;
  const atsReport = data.atsReport;

  const score = useMemo(() => atsReport.score || 0, [atsReport.score]);

  // ─── Kick off job matching once, using the newly generated (optimized) resume text ───
  useEffect(() => {
    if (!resume) return
    if (jobMatches !== null) return // already fetched (or already attempted) this session

    const resumeText = buildPlainText(resume)
    if (!resumeText || !resumeText.trim()) return

    let cancelled = false

    const runJobMatch = async () => {
      setIsLoadingJobs(true)
      setJobsWarning('')
      try {
        const result = await matchJobsFromText(resumeText)
        if (cancelled) return
        setJobMatches(Array.isArray(result?.jobs) ? result.jobs : [])
        if (result?.matchLevel === 'none' || result?.matchLevel === 'error') {
          setJobsWarning('No strong job matches found right now.')
        }
      } catch (e) {
        if (cancelled) return
        setJobMatches([])
        e.message = ""
        setJobsWarning('Could not fetch matching jobs.')
      } finally {
        if (!cancelled) setIsLoadingJobs(false)
      }
    }

    runJobMatch()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  // ─── Check Analysis button state ───
  const analysisReady = useMemo(() => !isLoadingReport && !!interviewReportData, [isLoadingReport, interviewReportData]);

  const handleCheckAnalysis = useCallback(() => {
    if (!analysisReady) return;
    navigate('/interview-report');
  }, [analysisReady, navigate]);

  // ─── Copy to clipboard ───
  const handleCopy = useCallback(() => {
    const text = buildPlainText(resume);
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.textContent = '✓ Copied!';
        setTimeout(() => { if (btn) btn.textContent = 'Copy to Clipboard'; }, 2000);
      }
    });
  }, [resume]);

  // ─── Download as .pdf ───
  const handleDownload = useCallback(() => {
    handleDownloadPDF(resume);
  }, [resume]);

  if (isLoadingResume) {
    return (
      <PageTransition>
        <Navbar />
        <div style={{ paddingTop: '72px' }}>
          <div className="container" style={{ padding: '48px 24px' }}>
            <ResumeResultSkeleton />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEO
        title="MatchWise AI — Optimized Resume Result"
        description="Your AI-optimized resume is ready with custom bullet enhancements, ATS score breakdown, and job recommendations."
        noindex={true}
      />
      <Navbar />

      <div style={{ paddingTop: '72px', minHeight: '100vh' }}>
        {/* Page Header */}
        <ResumeHeader>
          <ResumeActions
            handleCopy={handleCopy}
            handleDownloadPDF={handleDownload}
            handleCheckAnalysis={handleCheckAnalysis}
            analysisReady={analysisReady}
            isLoadingReport={isLoadingReport}
            interviewReportData={interviewReportData}
            navigate={navigate}
          />
        </ResumeHeader>

        <div className="container" style={{ padding: '40px 24px 80px' }}>
          <div className="result-grid" style={GRID_CONTAINER_STYLE}>
            {/* ─── Left: Formatted Resume ─── */}
            <ResumeContent resume={resume} />

            {/* ─── Right: ATS Report ─── */}
            <ResumeSidebar
              score={score}
              isLoadingReport={isLoadingReport}
              analysisReady={analysisReady}
              handleCheckAnalysis={handleCheckAnalysis}
              keywordsMatched={atsReport.keywordsMatched}
              improvements={atsReport.improvements}
              jobs={jobMatches}
              isLoadingJobs={isLoadingJobs}
              jobsWarning={jobsWarning}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </PageTransition>
  );
};

export default ResumeResult;