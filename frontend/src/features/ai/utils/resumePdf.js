export const handleDownloadPDF = async (resume) => {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
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

  const addLine = (
    text,
    { size = 10, bold = false, align = "left", gap = 13 } = {},
  ) => {
    if (!text) return;
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line) => {
      ensureSpace(gap);
      const x = align === "center" ? pageWidth / 2 : marginX;
      doc.text(line, x, y, { align });
      y += gap;
    });
  };

  const addSectionHeading = (title) => {
    y += 6;
    ensureSpace(22);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), marginX, y);
    y += 4;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 14;
  };

  doc.setTextColor(0, 0, 0);

  // Name
  addLine(resume.name || "", {
    size: 18,
    bold: true,
    align: "center",
    gap: 22,
  });

  // Contact line
  const contactParts = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    resume.contact?.linkedin,
  ].filter(Boolean);
  addLine(contactParts.join("   |   "), { size: 10, align: "center", gap: 20 });

  // Summary
  if (resume.summary) {
    addSectionHeading("Professional Summary");
    addLine(resume.summary, { size: 10, gap: 13 });
  }

  // Experience
  if (resume.experience?.length) {
    addSectionHeading("Experience");
    resume.experience.forEach((exp, i) => {
      addLine(`${exp.title} — ${exp.company}     ${exp.period}`, {
        size: 10.5,
        bold: true,
        gap: 14,
      });
      exp.bullets.forEach((b) => addLine(`•  ${b}`, { size: 10, gap: 13 }));
      if (i < resume.experience.length - 1) y += 6;
    });
  }

  // Skills
  if (resume.skills?.technical?.length || resume.skills?.soft?.length) {
    addSectionHeading("Skills");
    if (resume.skills.technical?.length) {
      addLine(`Technical: ${resume.skills.technical.join(", ")}`, {
        size: 10,
        gap: 13,
      });
    }
    if (resume.skills.soft?.length) {
      addLine(`Soft Skills: ${resume.skills.soft.join(", ")}`, {
        size: 10,
        gap: 13,
      });
    }
  }

  // Education
  if (resume.education?.length) {
    addSectionHeading("Education");
    resume.education.forEach((edu) => {
      addLine(`${edu.degree} — ${edu.school}, ${edu.year}`, {
        size: 10,
        gap: 13,
      });
    });
  }

  const fileName = (resume.name || "ATS_Resume").trim().replace(/\s+/g, "_");
  doc.save(`${fileName}.pdf`);
};
