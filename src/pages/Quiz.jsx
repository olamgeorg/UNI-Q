import { useState } from 'react';
import QuizRenderer from '../components/QuizRenderer';
import { subjects, years } from '../data/questions';

export default function Quiz() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);

  const handleStart = () => {
    if (selectedSubject && selectedYear) {
      setQuizStarted(true);
    }
  };

  const handleReset = () => {
    setQuizStarted(false);
    setSelectedSubject('');
    setSelectedYear('');
  };

  if (quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleReset}
            className="mb-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Selection
          </button>
          
          {/* Pass year as a number to fix the Supabase type mismatch */}
          <QuizRenderer subject={selectedSubject} year={parseInt(selectedYear)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Start Quiz</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${
                  selectedSubject === s
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
          <div className="grid grid-cols-4 gap-3">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(String(y))}
                className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                  selectedYear === String(y)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedSubject || !selectedYear}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Begin Quiz
        </button>
      </div>
    </div>
  );
}