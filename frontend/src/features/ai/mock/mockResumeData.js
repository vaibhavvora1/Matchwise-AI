/* ─── Mock data for demo when no API data ─── */
export const MOCK_DATA = {
  resume: {
    name: 'Alex Johnson',
    contact: { email: 'alex.johnson@email.com', phone: '+1 (555) 234-5678', location: 'San Francisco, CA', linkedin: 'linkedin.com/in/alexjohnson' },
    summary: 'Results-driven Full Stack Developer with 4+ years of experience building scalable web applications using React, Node.js, and cloud infrastructure. Proven ability to deliver ATS-optimized, performance-focused solutions in agile environments.',
    experience: [
      {
        title: 'Senior Frontend Engineer',
        company: 'TechCorp Inc.',
        period: '2022 – Present',
        bullets: [
          'Architected and shipped React-based dashboard used by 50,000+ daily active users, reducing load time by 42%',
          'Led migration from CRA to Vite, cutting build times from 4 min → 35 sec',
          'Implemented real-time collaboration features using WebSockets, increasing user retention by 28%',
        ],
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        period: '2020 – 2022',
        bullets: [
          'Built RESTful APIs with Node.js/Express serving 1M+ requests/day with 99.9% uptime',
          'Integrated Stripe payment processing, enabling $2M+ in annual recurring revenue',
          'Mentored 3 junior developers, improving team velocity by 35%',
        ],
      },
    ],
    skills: { technical: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Redis'], soft: ['Leadership', 'Agile', 'Communication'] },
    education: [{ degree: 'B.S. Computer Science', school: 'UC Berkeley', year: '2020' }],
  },
  atsReport: {
    score: 87,
    keywordsMatched: ['React', 'TypeScript', 'Node.js', 'REST API', 'Agile', 'AWS', 'Docker', 'PostgreSQL', 'CI/CD', 'Microservices'],
    improvements: [
      'Added quantified metrics to all experience bullets',
      'Optimized keyword density for ATS parsing',
      'Restructured skills section for better machine readability',
      'Aligned job title with target role terminology',
      'Added missing keywords: CI/CD, Microservices, Docker',
    ],
  },
}
