# Matchwise AI

An AI-powered career platform that helps users optimize their resumes, match them with job descriptions, analyze ATS scores, and prepare for interviews.

## Features

- AI Resume Analysis
- ATS Score Checker
- Resume vs Job Description Matching
- Interview Report Generation
- Job Recommendations
- Authentication
- Responsive UI
- Dashboard

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- Prisma
- PostgreSQL
- Supabase Auth
- JWT
- Cloudinary

### AI

- OpenAI API (or your AI provider)

## Folder Structure

```
MatchwiseAI/
├── client/
├── server/
├── prisma/
├── public/
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/vaibhavvora1/Matchwise-AI.git
```

### Install dependencies

Frontend

```bash
cd client
npm install
npm run dev
```

Backend

```bash
cd server
npm install
npm run dev
```

## Environment Variables

Create a `.env` file.

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
OPENAI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Screenshots

Add screenshots here.

## Roadmap

- Resume Builder
- ATS Resume Scanner
- AI Mock Interview
- Job Tracking
- Company Dashboard
- Admin Panel

## Contributing

Pull requests are welcome.

## Author

**Vaibhav Vora**

GitHub: <https://github.com/vaibhavvora1>
