export const handleDownloadInterviewReportPDF = async (report, jobTitle = 'Untitled Role', resumeName = 'Resume') => {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 54; // 0.75in
  const maxWidth = pageWidth - marginX * 2;
  let y = 54;

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > pageHeight - 54) {
      doc.addPage();
      y = 54;
    }
  };

  const addLine = (text, { size = 10, bold = false, italic = false, align = 'left', gap = 13 } = {}) => {
    if (!text) return;
    let style = 'normal';
    if (bold && italic) style = 'bolditalic';
    else if (bold) style = 'bold';
    else if (italic) style = 'italic';

    doc.setFont('times', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line) => {
      ensureSpace(gap);
      const x = align === 'center' ? pageWidth / 2 : marginX;
      doc.text(line, x, y, { align });
      y += gap;
    });
  };

  const addSectionHeading = (title) => {
    y += 8;
    ensureSpace(24);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), marginX, y);
    y += 4;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 14;
  };

  doc.setTextColor(0, 0, 0);

  // Main Title
  addLine('INTERVIEW PREPARATION REPORT', { size: 16, bold: true, align: 'center', gap: 20 });
  y += 6;

  // Metadata Block
  const scoreVal = typeof report.matchScore === 'number' ? `${report.matchScore}%` : 'N/A';
  addLine(`Resume: ${resumeName}`, { size: 10, bold: true, gap: 14 });
  addLine(`Target Role: ${jobTitle}`, { size: 10, bold: true, gap: 14 });
  addLine(`Match Score: ${scoreVal}`, { size: 10, bold: true, gap: 14 });
  y += 10;

  // Executive Summary
  if (report.summary) {
    addSectionHeading('Executive Summary');
    addLine(report.summary, { size: 10, gap: 14 });
  }

  // Technical Questions
  if (Array.isArray(report.technicalQuestions) && report.technicalQuestions.length) {
    addSectionHeading('Technical Questions & Guidance');
    report.technicalQuestions.forEach((q, i) => {
      ensureSpace(40);
      addLine(`Q${i + 1}: ${q.question}`, { size: 10, bold: true, gap: 14 });
      if (q.intention) {
        addLine(`Interviewer Intent: ${q.intention}`, { size: 9.5, italic: true, gap: 13 });
      }
      if (q.answer) {
        addLine(`Suggested Answer: ${q.answer}`, { size: 10, gap: 13 });
      }
      y += 8; // Spacer between questions
    });
  }

  // Behavioral Questions
  if (Array.isArray(report.behavioralQuestions) && report.behavioralQuestions.length) {
    addSectionHeading('Behavioral Questions (STAR Method)');
    report.behavioralQuestions.forEach((q, i) => {
      ensureSpace(40);
      addLine(`Q${i + 1}: ${q.question}`, { size: 10, bold: true, gap: 14 });
      if (q.intention) {
        addLine(`Interviewer Intent: ${q.intention}`, { size: 9.5, italic: true, gap: 13 });
      }
      if (q.answer) {
        addLine(`Suggested Answer: ${q.answer}`, { size: 10, gap: 13 });
      }
      y += 8; // Spacer between questions
    });
  }

  // Skill Gaps
  if (Array.isArray(report.skillsGaps) && report.skillsGaps.length) {
    addSectionHeading('Skill Gap Analysis');
    report.skillsGaps.forEach((gap) => {
      ensureSpace(30);
      const severityStr = gap.severity ? ` [Priority: ${gap.severity}]` : '';
      addLine(`•  ${gap.skill}${severityStr}`, { size: 10, bold: true, gap: 14 });
      if (gap.description) {
        addLine(gap.description, { size: 10, gap: 13 });
      }
      y += 4;
    });
  }

  // 7-Day Prep Plan
  if (Array.isArray(report.preparationPlan) && report.preparationPlan.length) {
    addSectionHeading('7-Day Interview Preparation Plan');
    report.preparationPlan.forEach((dayPlan) => {
      ensureSpace(40);
      const focusStr = dayPlan.focus ? ` — ${dayPlan.focus}` : '';
      addLine(`Day ${dayPlan.day}${focusStr}`, { size: 10.5, bold: true, gap: 16 });
      
      if (Array.isArray(dayPlan.tasks)) {
        dayPlan.tasks.forEach((t) => {
          const taskText = typeof t === 'string' ? t : (t?.task || '');
          if (taskText) {
            addLine(`•  ${taskText}`, { size: 10, gap: 13 });
          }
        });
      }
      y += 8;
    });
  }

  // File Name construction
  const sanitizedTitle = jobTitle.trim().replace(/\s+/g, '_').substring(0, 30);
  const fileName = `Interview_Report_${sanitizedTitle}`;
  doc.save(`${fileName}.pdf`);
};
