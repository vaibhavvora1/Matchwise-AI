export const buildPlainText = (r) => {
  if (!r) return ''
  let out = `${r.name}\n`
  out += `${r.contact?.email || ''} | ${r.contact?.phone || ''} | ${r.contact?.location || ''}\n\n`
  out += `PROFESSIONAL SUMMARY\n${'─'.repeat(40)}\n${r.summary || ''}\n\n`
  out += `EXPERIENCE\n${'─'.repeat(40)}\n`
  if (r.experience) {
    r.experience.forEach(exp => {
      out += `${exp.title} — ${exp.company} (${exp.period})\n`
      if (exp.bullets) {
        exp.bullets.forEach(b => { out += `• ${b}\n` })
      }
      out += '\n'
    })
  }
  out += `SKILLS\n${'─'.repeat(40)}\n`
  out += `Technical: ${(r.skills?.technical || []).join(', ')}\n`
  out += `Soft Skills: ${(r.skills?.soft || []).join(', ')}\n\n`
  out += `EDUCATION\n${'─'.repeat(40)}\n`
  if (r.education) {
    r.education.forEach(e => { out += `${e.degree} — ${e.school}, ${e.year}\n` })
  }
  return out
}
