import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const buildLog = [
  {
    label: "Live",
    tone: "live",
    title: "ATS resume scoring",
    detail:
      "Upload a resume and a job description, get a real match score and specific line-by-line fixes — not a generic checklist.",
  },
  {
    label: "Live",
    tone: "live",
    title: "AI interview prep",
    detail:
      "Practice with role-specific questions and get a structured report afterward, so you know what to fix before the real thing.",
  },
  {
    label: "Live",
    tone: "live",
    title: "Job search",
    detail:
      "Search real listings from inside the app, matched against the resume you're actively improving.",
  },
  {
    label: "In progress",
    tone: "progress",
    title: "Faster, more reliable scoring",
    detail:
      "Tightening up model fallbacks and response times so scoring feels instant even under load.",
  },
];

const values = [
  {
    heading: "Built by someone who's used it",
    body: "MatchWise AI started as a tool I needed for my own job search — as a solo developer, every feature gets built because it solved a real problem, not because it looked good on a roadmap.",
  },
  {
    heading: "No dark patterns, no fake urgency",
    body: "You won't find countdown timers, manufactured scarcity, or testimonials from people who don't exist. If something isn't working yet, this page says so.",
  },
  {
    heading: "Feedback actually changes what gets built",
    body: "This is early, active software. What you report shapes what gets built next — not a backlog that disappears into a queue.",
  },
];

export default function AboutUs() {
  return (
    <main style={{ background: "#FBFAF7", color: "#151812" }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          padding: "clamp(96px, 12vw, 140px) 24px 64px",
        }}
      >
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          style={{
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#0F6E56",
            marginBottom: "20px",
          }}
        >
          About MatchWise AI
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: 1.15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            maxWidth: "18ch",
            marginBottom: "24px",
          }}
        >
          Software built to get you the interview, not just look good doing it
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          style={{
            fontSize: "18px",
            lineHeight: 1.65,
            color: "#4A4F45",
            maxWidth: "62ch",
          }}
        >
          MatchWise AI is a resume, ATS, and interview-prep tool built and run
          by one developer. It's early-stage, actively worked on, and honest
          about what it does and doesn't do yet.
        </motion.p>
      </section>

      {/* Origin */}
      <section
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          padding: "48px 24px",
          borderTop: "1px solid #E7E4DA",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          style={{ display: "grid", gap: "16px", maxWidth: "68ch" }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 600 }}>
            Why this exists
          </h2>
          <p style={{ fontSize: "16px", lineHeight: 1.75, color: "#4A4F45" }}>
            Most resume tools optimize for looking impressive in a demo. They
            promise a lot and deliver a keyword count. MatchWise AI exists
            because applying for jobs is stressful enough without guessing
            whether your resume will even get seen — you need a straight
            answer on what's wrong and what to fix, and practice that
            actually prepares you for the conversation on the other side of
            the interview.
          </p>
          <p style={{ fontSize: "16px", lineHeight: 1.75, color: "#4A4F45" }}>
            It's built and maintained by a single full-stack developer,
            end-to-end — the scoring engine, the interview simulator, the job
            search, the interface. That means it moves fast on real feedback,
            and it also means it's still growing. Both of those are true at
            once, and this page won't pretend otherwise.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          padding: "48px 24px",
          borderTop: "1px solid #E7E4DA",
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px" }}
        >
          How it's run
        </motion.h2>

        <div style={{ display: "grid", gap: "28px" }}>
          {values.map((v, i) => (
            <motion.div
              key={v.heading}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={i}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 220px) 1fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 600 }}>
                {v.heading}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#4A4F45",
                  margin: 0,
                }}
              >
                {v.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Build log / state of the product */}
      <section
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          padding: "48px 24px 96px",
          borderTop: "1px solid #E7E4DA",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          style={{ marginBottom: "8px" }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 600 }}>
            What's actually working right now
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "#4A4F45",
              marginTop: "8px",
              maxWidth: "60ch",
            }}
          >
            An honest snapshot instead of a features list that oversells.
          </p>
        </motion.div>

        <div style={{ display: "grid", gap: "1px", marginTop: "28px" }}>
          {buildLog.map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={i}
              style={{
                display: "grid",
                gridTemplateColumns: "108px 1fr",
                gap: "20px",
                alignItems: "start",
                padding: "18px 0",
                borderBottom: "1px solid #E7E4DA",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifySelf: "start",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background:
                    item.tone === "live" ? "#E1F5EE" : "#FAEEDA",
                  color: item.tone === "live" ? "#085041" : "#633806",
                }}
              >
                {item.label}
              </span>
              <div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: 1.65,
                    color: "#4A4F45",
                    margin: 0,
                  }}
                >
                  {item.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          style={{
            marginTop: "48px",
            padding: "28px",
            borderRadius: "16px",
            background: "#F2F0E8",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ maxWidth: "48ch" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>
              Found a bug, or something that could be better?
            </p>
            <p style={{ fontSize: "14.5px", color: "#4A4F45", margin: 0 }}>
              Reports go straight to the person building this. No support
              queue in between.
            </p>
          </div>
          <Link
            to="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 22px",
              borderRadius: "999px",
              background: "#0F6E56",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Send feedback
          </Link>
        </motion.div>
      </section>
    </main>
  );
}