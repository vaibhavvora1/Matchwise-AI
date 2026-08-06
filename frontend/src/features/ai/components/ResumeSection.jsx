import React from 'react';

const SECTION_CONTAINER_STYLE = { marginBottom: '28px' };
const HEADER_CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '14px',
  paddingBottom: '10px',
  borderBottom: '2px solid var(--color-text-primary)',
};
const HEADER_TITLE_STYLE = {
  fontWeight: 700,
  fontSize: '0.875rem',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--color-text-primary)',
};

const ResumeSection = React.memo(({ title, children }) => {
  return (
    <div style={SECTION_CONTAINER_STYLE}>
      <div style={HEADER_CONTAINER_STYLE}>
        <h3 style={HEADER_TITLE_STYLE}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
});

ResumeSection.displayName = 'ResumeSection';

export default ResumeSection;
