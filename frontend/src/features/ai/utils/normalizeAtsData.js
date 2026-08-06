import { MOCK_DATA as _MOCK } from '../mock/mockResumeData';
const MOCK_DATA = import.meta.env?.DEV ? _MOCK : null;

export const normalizeAtsData = (data) => {
  if (!data || typeof data !== 'object') {
    if (import.meta.env?.DEV) {
      console.warn(
        '[ResumeResult] atsResumeData is missing/invalid — showing MOCK data. ' +
        'This means the real API response never reached this page via useAI(). ' +
        'Check the context provider and the component that calls generateATSResume/navigate. Received:',
        data,
      )
    }
    return MOCK_DATA || {
      resume: { name: '', contact: {}, summary: '', experience: [], skills: { technical: [], soft: [] }, education: [] },
      atsReport: { score: 0, keywordsMatched: [], improvements: [] }
    };
  }

  const payload = data.optimizedResume || data.data || data;
  const resume = payload.resume || {};
  const atsReport = payload.atsReport || {};

  return {
    resume: {
      name: typeof resume.name === 'string' ? resume.name : '',
      contact: {
        email: typeof resume.contact?.email === 'string' ? resume.contact.email : '',
        phone: typeof resume.contact?.phone === 'string' ? resume.contact.phone : '',
        location: typeof resume.contact?.location === 'string' ? resume.contact.location : '',
        linkedin: typeof resume.contact?.linkedin === 'string' ? resume.contact.linkedin : '',
      },
      summary: typeof resume.summary === 'string' ? resume.summary : '',
      experience: Array.isArray(resume.experience) ? resume.experience : [],
      skills: {
        technical: Array.isArray(resume.skills?.technical) ? resume.skills.technical : [],
        soft: Array.isArray(resume.skills?.soft) ? resume.skills.soft : [],
      },
      education: Array.isArray(resume.education) ? resume.education : [],
    },
    atsReport: {
      score: typeof atsReport.score === 'number' ? atsReport.score : 0,
      keywordsMatched: Array.isArray(atsReport.keywordsMatched) ? atsReport.keywordsMatched : [],
      improvements: Array.isArray(atsReport.improvements) ? atsReport.improvements : [],
    },
  };
};
