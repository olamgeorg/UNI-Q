import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subjects, years } from '../data/questions';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const greeting = profile?.email
    ? profile.email.split('@')[0]
    : 'Student';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white px-5 pt-10 pb-14 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <p className="text-primary-200 text-sm font-medium">Welcome back,</p>
          <h1 className="text-3xl font-bold mt-1 flex items-center gap-2">
            {greeting}
          <span className="text-2xl">🎓</span>
          </h1>
          <p className="text-primary-100 mt-3 text-base leading-relaxed">
            Prepare for your Post-UTME with past questions across 4 subjects.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="mt-6 w-full py-3.5 bg-white text-primary-800 font-bold rounded-xl shadow-md hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Start Practicing →
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 -mt-6 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-700">4</p>
            <p className="text-xs text-gray-500 mt-1">Subjects</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary-700">4</p>
            <p className="text-xs text-gray-500 mt-1">Years (2022–2025)</p>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="px-5 mt-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Choose a Subject</h2>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => navigate('/quiz')}
              className="card text-left hover:shadow-md active:scale-[0.98] transition-all group"
            >
              <div className="text-3xl mb-2">
                {subject === 'Economics' && '📊'}
                {subject === 'English' && '📖'}
                {subject === 'Government' && '🏛️'}
                {subject === 'CRK' && '✝️'}
              </div>
              <p className="font-semibold text-gray-800 group-hover:text-primary-700">{subject}</p>
              <p className="text-xs text-gray-500 mt-1">60 questions/year</p>
            </button>
          ))}
        </div>
      </div>

      {/* Years */}
      <div className="px-5 mt-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Available Years</h2>
        <div className="flex gap-2 flex-wrap">
          {years.map((year) => (
            <span
              key={year}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
            >
              {year}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pb-8 text-center">
        <p className="text-sm text-gray-500">Developed by Georg</p>
        <p className="text-xs text-gray-400 mt-1">Post-UTME Quiz Practice App</p>
      </div>
    </div>
  );
}