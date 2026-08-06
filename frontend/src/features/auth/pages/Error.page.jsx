import { Link } from 'react-router-dom'




const ErrorPage = () => (
  <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
    <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
      <h1 className="text-3xl font-semibold text-slate-900 mb-4">404 Not Found</h1>
      <p className="text-sm text-slate-500 mb-6">The page you tried to access does not exist.</p>
      <Link
        to="/login"
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Go to login
      </Link>
    </div>
  </main>
)

export default ErrorPage