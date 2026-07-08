import { useState, useEffect, useRef } from 'react';
import { fetchQuestions } from '../data/questions';
import { supabase } from '../lib/supabase';
export default function QuizRenderer({ subject, year, onRestart }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mode, setMode] = useState('practice');
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isFinished, setIsFinished] = useState(false);

  const audioCtx = useRef(null);
  const timerRef = useRef(null);

  // Create audio context on first user interaction
  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playTone = (freq, duration) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsFinished(false);
    setTimeLeft(2100);

    fetchQuestions(subject, year)
.then((data) => {
        if (isMounted) {
          if (data.length === 0) {
            setError('No questions found.');
          } else {
            setQuestions(data);
            setUserAnswers(new Array(data.length).fill(null));
          }
          setLoading(false);
        }
      })
.catch(() => {
        if (isMounted) {
          setError('Failed to load questions.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearInterval(timerRef.current);
    };
  }, [subject, year]);

  useEffect(() => {
    if (mode === 'exam' &&!isSubmitted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, isSubmitted, questions.length]);

  const handleSelect = (index) => {
    if (mode === 'practice' && userAnswers[currentIndex]!== null) return;
    if (mode === 'exam' && isSubmitted) return;

    const labels = ['A', 'B', 'C', 'D'];
    const currentQ = questions[currentIndex];
    const isCorrect = labels[index] === currentQ.answer;

    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = index;
    setUserAnswers(newAnswers);

    // Practice mode: high tone = correct, low tone = wrong
    // Exam mode: neutral click tone
    if (mode === 'practice') {
      playTone(isCorrect? 800 : 300, 0.15);
    } else {
      playTone(600, 0.1);
    }

    if (mode === 'exam') {
      if (currentIndex < questions.length - 1) {
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (mode === 'exam') {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setIsSubmitted(true);
    setIsFinished(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const calculateScore = () => {
    const labels = ['A', 'B', 'C', 'D'];
    return questions.reduce((acc, q, idx) => {
      return acc + (userAnswers[idx]!== null && labels[userAnswers[idx]] === q.answer? 1 : 0);
    }, 0);
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onRestart} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Exit</button>
      </div>
    );
  }


useEffect(() => {
  if (isFinished) {
    const score = calculateScore();
    const saveScore = async () => {
      const { error } = await supabase
        .from('quiz_results')
        .insert([{
          user_id: 'guest',
          subject: subject,
          year: year,
          score: score,
          total: questions.length
        }]);
      if (error) console.error('Error saving score:', error);
    };
    saveScore();
  }
}, [isFinished, subject, year, questions.length]);


  // Loading and Error checks
if (loading) return <div className="p-4 text-center">Loading questions...</div>;
if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

// Finished screen
if (isFinished) {
  return (
    <div className="quiz-complete-container p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
      <p className="text-xl font-semibold mb-6">
        Your Score: {calculateScore()} / {questions.length}
      </p>
      <button onClick={onRestart} className="btn-primary max-w-xs mx-auto">
        Restart Quiz
      </button>
    </div>
  );
}



  
  const currentQ = questions[currentIndex];
  const labels = ['A', 'B', 'C', 'D'];
  const currentAnswer = userAnswers[currentIndex];
  const isAnswered = currentAnswer!== null;

  if (!currentQ) {
    return <div className="p-4 text-center text-red-600">Question data error</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {initAudio(); setMode('practice')}}
            disabled={isAnswered}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'practice'? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => {initAudio(); setMode('exam')}}
            disabled={isAnswered}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'exam'? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Exam
          </button>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'exam' && (
            <span className={`text-sm font-mono font-bold ${timeLeft < 300? 'text-red-600' : 'text-gray-700'}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
          <button
            onClick={() => {initAudio(); setIsMuted(!isMuted)}}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-xl"
            title={isMuted? 'Unmute' : 'Mute'}
          >
            {isMuted? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600">
          Question {currentIndex + 1} of {questions.length}
        </span>
        {mode === 'practice' && (
          <span className="text-sm font-medium text-blue-600">
            Score: {calculateScore()}
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold mb-6 text-gray-900">{currentQ.question}</h2>

      <div className="space-y-3">
        {currentQ.options?.map((opt, idx) => {
          const isCorrect = labels[idx] === currentQ.answer;
          let btnClass = 'w-full p-4 text-left border-2 rounded-lg transition-all flex items-center gap-3 ';

          if (mode === 'practice' && isAnswered) {
            if (isCorrect) btnClass += 'border-green-500 bg-green-50 text-green-900';
            else if (idx === currentAnswer) btnClass += 'border-red-500 bg-red-50 text-red-900';
            else btnClass += 'border-gray-200 bg-gray-50 text-gray-500 opacity-60';
          } else if (mode === 'exam' && isSubmitted) {
            if (isCorrect) btnClass += 'border-green-500 bg-green-50 text-green-900';
            else if (idx === currentAnswer) btnClass += 'border-red-500 bg-red-50 text-red-900';
            else btnClass += 'border-gray-200 bg-gray-50 text-gray-500 opacity-60';
          } else if (idx === currentAnswer) {
            btnClass += 'border-blue-500 bg-blue-50 text-blue-900';
          } else {
            btnClass += 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={(mode === 'practice' && isAnswered) || (mode === 'exam' && isSubmitted)}
              className={btnClass}
            >
              <span className="font-bold w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 flex-shrink-0">
                {labels[idx]}
              </span>
              <span className="flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {mode === 'practice' && isAnswered && currentQ.explanation && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
          <p className="font-semibold mb-1">Explanation:</p>
          <p className="text-sm">{currentQ.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {mode === 'practice' && (
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={mode === 'exam' && currentAnswer === null}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {mode === 'exam' && currentIndex === questions.length - 1
      ? 'Submit Quiz'
            : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
