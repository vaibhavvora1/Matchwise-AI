/* ─── Generic Skeleton Block ─── */
export const SkeletonBlock = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
)

/* ─── Resume Result Skeleton ─── */
export const ResumeResultSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
    {/* Left — resume content */}
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBlock height="32px" width="60%" />
      <SkeletonBlock height="1px" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonBlock height="18px" width="40%" />
          <SkeletonBlock height="14px" />
          <SkeletonBlock height="14px" width="90%" />
          <SkeletonBlock height="14px" width="80%" />
        </div>
      ))}
    </div>
    {/* Right — ATS report */}
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SkeletonBlock height="24px" width="70%" />
      <SkeletonBlock height="120px" borderRadius="50%" width="120px" style={{ margin: '0 auto' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} height="28px" width="80px" borderRadius="999px" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} height="14px" width={i % 2 === 0 ? '90%' : '75%'} />
      ))}
    </div>
  </div>
)

/* ─── Interview Report Skeleton ─── */
export const InterviewReportSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    {/* Score */}
    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
      <SkeletonBlock height="80px" width="200px" borderRadius="12px" style={{ margin: '0 auto 16px' }} />
      <SkeletonBlock height="20px" width="300px" style={{ margin: '0 auto' }} />
    </div>
    {/* Tabs */}
    <div style={{ display: 'flex', gap: '8px' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} height="40px" width="140px" borderRadius="8px" />
      ))}
    </div>
    {/* Content */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card" style={{ padding: '20px' }}>
          <SkeletonBlock height="16px" width="70%" />
        </div>
      ))}
    </div>
  </div>
)

/* ─── Analyze Page Skeleton (not needed but exported) ─── */
export const AnalyzeSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <SkeletonBlock height="200px" />
    <SkeletonBlock height="200px" />
    <SkeletonBlock height="200px" />
  </div>
)
