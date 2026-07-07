import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { subjects } from '../data/questions';

export default function Progress() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [user]);

  async function loadResults() {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setResults(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const totalQuizzes = results.length;
  const totalQuestions = results.reduce((a, r) => a + r.total, 0);
  const totalCorrect = results.reduce((a, r) => a + r.score, 0);
  const overallPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Average by subject
  const subjectStats = subjects.map((s) => {
    const subResults = results.filter((r) => r.subject === s);
    const total = subResults.reduce((a, r) => a + r.total, 0);
    const correct = subResults.reduce((a, r) => a + r.score, 0);
    const avg = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { subject: s, average: avg, quizzes: subResults.length };
  });

  // Recent trend (last 10)
  const recent = [...results]
    .reverse()
    .slice(-10)
    .map((r, i) => ({
      idx: i + 1,
      label: `${r.subject.slice(0, 4)} ${r.year}`,
      percent: Math.round((r.score / r.total) * 100)
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your Post-UTME performance</p>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="card text-center py-3">
            <p className="text-xl font-bold text-primary-700">{totalQuizzes}</p>
            <p className="text-xs text-gray-500 mt-0.5">Quizzes</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-bold text-primary-700">{totalCorrect}</p>
            <p className="text-xs text-gray-500 mt-0.5">Correct</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-bold text-primary-700">{overallPercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Average</p>
          </div>
        </div>

        {totalQuizzes === 0 ? (
          <div className="card text-center py-12 mt-5">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-800 font-semibold">No quizzes yet</p>
            <p className="text-sm text-gray-500 mt-1">Take your first quiz to see progress here</p>
          </div>
        ) : (
          <>
            {/* Subject Average Chart */}
            <div className="card mt-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Average by Subject</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    formatter={(v) => `${v}%`}
                  />
                  <Bar dataKey="average" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Chart */}
            {recent.length > 1 && (
              <div className="card mt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={recent}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      formatter={(v) => `${v}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="percent"
                      stroke="#1d4ed8"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#1d4ed8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Results List */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Quizzes</h3>
              <div className="space-y-2">
                {results.slice(0, 10).map((r) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  return (
                    <div key={r.id} className="card flex items-center justify-between py-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{r.subject}</p>
                        <p className="text-xs text-gray-500">{r.year} • {new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {pct}%
                        </p>
                        <p className="text-xs text-gray-500">{r.score}/{r.total}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}