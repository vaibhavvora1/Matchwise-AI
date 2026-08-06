import React from 'react';
import { motion } from 'framer-motion';
import ResumeSection from './ResumeSection';

const CARD_STYLE = { fontFamily: "'Courier New', Courier, monospace", lineHeight: 1.7 };
const HEADER_STYLE = { textAlign: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: '2px solid var(--color-text-primary)' };
const NAME_STYLE = { fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', fontFamily: 'Inter, sans-serif' };
const CONTACT_BAR_STYLE = { fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 16px' };
const SUMMARY_STYLE = { fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.75 };
const EXP_HEADER_STYLE = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' };
const EXP_TITLE_STYLE = { fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' };
const EXP_COMPANY_STYLE = { color: 'var(--color-text-secondary)', fontSize: '0.875rem' };
const EXP_PERIOD_STYLE = { fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' };
const BULLET_LIST_STYLE = { marginTop: '8px', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' };
const BULLET_ITEM_STYLE = { fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 };
const SKILLS_CONTAINER_STYLE = { display: 'flex', flexDirection: 'column', gap: '10px' };
const SKILL_LABEL_STYLE = { fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' };
const SKILL_VAL_STYLE = { fontSize: '0.875rem', color: 'var(--color-text-secondary)' };
const EDU_ROW_STYLE = { display: 'flex', justifyContent: 'space-between' };
const EDU_DEGREE_STYLE = { fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' };
const EDU_SCHOOL_STYLE = { color: 'var(--color-text-secondary)', fontSize: '0.875rem' };
const EDU_YEAR_STYLE = { fontSize: '0.8125rem', color: 'var(--color-text-muted)' };

const ResumeContent = React.memo(({ resume }) => {
  if (!resume) return null;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={CARD_STYLE}
    >
      {/* Header */}
      <div style={HEADER_STYLE}>
        <h2 style={NAME_STYLE}>
          {resume.name}
        </h2>
        <p style={CONTACT_BAR_STYLE}>
          <span>{resume.contact?.email}</span>
          <span>|</span>
          <span>{resume.contact?.phone}</span>
          <span>|</span>
          <span>{resume.contact?.location}</span>
          {resume.contact?.linkedin && (
            <>
              <span>|</span>
              <span>{resume.contact.linkedin}</span>
            </>
          )}
        </p>
      </div>

      {/* Summary */}
      {resume.summary && (
        <ResumeSection title="Professional Summary">
          <p style={SUMMARY_STYLE}>
            {resume.summary}
          </p>
        </ResumeSection>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <ResumeSection title="Experience">
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < resume.experience.length - 1 ? '20px' : 0 }}>
              <div style={EXP_HEADER_STYLE}>
                <div>
                  <span style={EXP_TITLE_STYLE}>{exp.title}</span>
                  <span style={EXP_COMPANY_STYLE}> — {exp.company}</span>
                </div>
                <span style={EXP_PERIOD_STYLE}>{exp.period}</span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={BULLET_LIST_STYLE}>
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} style={BULLET_ITEM_STYLE}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ResumeSection>
      )}

      {/* Skills */}
      {resume.skills && (
        <ResumeSection title="Skills">
          <div style={SKILLS_CONTAINER_STYLE}>
            {resume.skills.technical && resume.skills.technical.length > 0 && (
              <div>
                <span style={SKILL_LABEL_STYLE}>Technical: </span>
                <span style={SKILL_VAL_STYLE}>{resume.skills.technical.join(' • ')}</span>
              </div>
            )}
            {resume.skills.soft && resume.skills.soft.length > 0 && (
              <div>
                <span style={SKILL_LABEL_STYLE}>Soft Skills: </span>
                <span style={SKILL_VAL_STYLE}>{resume.skills.soft.join(' • ')}</span>
              </div>
            )}
          </div>
        </ResumeSection>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <ResumeSection title="Education">
          {resume.education.map((edu, i) => (
            <div key={i} style={EDU_ROW_STYLE}>
              <div>
                <span style={EDU_DEGREE_STYLE}>{edu.degree}</span>
                <span style={EDU_SCHOOL_STYLE}> — {edu.school}</span>
              </div>
              <span style={EDU_YEAR_STYLE}>{edu.year}</span>
            </div>
          ))}
        </ResumeSection>
      )}
    </motion.div>
  );
});

ResumeContent.displayName = 'ResumeContent';

export default ResumeContent;
