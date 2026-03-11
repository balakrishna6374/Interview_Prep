import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MockInterview = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [settings, setSettings] = useState({
    role: 'Software Engineer',
    count: 5,
    focusAreas: ['Technical', 'Problem Solving', 'Communication']
  });

  useEffect(() => {
    if (inProgress && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (inProgress && timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, inProgress]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/ai/mock-interview', {
        role: settings.role,
        focusAreas: settings.focusAreas,
        count: settings.count
      });
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setQuestions(response.data.data);
        setLoading(false);
        setInProgress(true);
      } else {
        setError('Failed to generate questions. Please try again with different settings.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate questions. Please check your Groq API key.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    try {
      const currentQ = questions[currentIndex];
      
      const [evalResponse, compareResponse] = await Promise.all([
        axios.post('/api/ai/evaluate-answer', {
          question: {
            title: currentQ.title,
            description: currentQ.description
          },
          answer: answer
        }),
        axios.post('/api/ai/compare-answer', {
          question: currentQ.title,
          userAnswer: answer,
          correctAnswer: currentQ.answer || currentQ.explanation || 'No ideal answer available'
        }).catch(() => ({ data: { data: null } }))
      ]);

      const evalData = evalResponse.data.data;
      const compareData = compareResponse.data.data;

      const newResults = [...results, {
        question: currentQ,
        userAnswer: answer,
        score: evalData.score,
        feedback: evalData.feedback,
        comparison: compareData
      }];
      setResults(newResults);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer('');
        setTimeLeft(300);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(error.response?.data?.error || 'Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  const getTotalScore = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 120) return 'text-emerald-600';
    if (timeLeft > 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dark-900 mb-2">Unable to Start Interview</h2>
          <p className="text-dark-500 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setError(''); setInProgress(false); }}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const totalScore = getTotalScore();
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Interview Complete!</h1>
          <p className="text-dark-500 mb-8">Here's how you performed</p>
          
          <div className={`text-7xl font-bold mb-8 ${totalScore >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {totalScore}%
          </div>

          <div className="flex gap-4 justify-center mb-8">
            {results.map((r, idx) => (
              <div key={idx} className="p-3 bg-dark-50 rounded-xl">
                <p className="text-xs text-dark-400 mb-1">Q{idx + 1}</p>
                <p className={`text-xl font-bold ${r.score >= 80 ? 'text-emerald-600' : r.score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {r.score}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Results with Answer Comparison */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-dark-900">Detailed Review</h2>
          {results.map((r, idx) => (
            <div key={idx} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-dark-400">Question {idx + 1}</span>
                  <h3 className="font-semibold text-dark-800">{r.question.title}</h3>
                </div>
                <span className={`text-2xl font-bold ${
                  r.score >= 80 ? 'text-emerald-600' : r.score >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {r.score}%
                </span>
              </div>

              {/* Your Answer */}
              <div className="mb-4 p-4 bg-rose-50 rounded-xl">
                <p className="text-sm font-medium text-rose-800 mb-2">Your Answer:</p>
                <p className="text-sm text-rose-700 whitespace-pre-line">{r.userAnswer}</p>
              </div>

              {/* Ideal Answer */}
              {r.question.answer && (
                <div className="mb-4 p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm font-medium text-emerald-800 mb-2">Ideal Answer:</p>
                  <p className="text-sm text-emerald-700 whitespace-pre-line">{r.question.answer}</p>
                </div>
              )}

              {/* AI Comparison */}
              {r.comparison && (
                <div className="p-4 bg-brand-50 rounded-xl">
                  <p className="text-sm font-medium text-brand-800 mb-3">AI Analysis:</p>
                  
                  {r.comparison.strengths && r.comparison.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-emerald-600 mb-1">What you did well:</p>
                      <ul className="text-xs text-dark-600 space-y-1">
                        {r.comparison.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-500">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {r.comparison.missing && r.comparison.missing.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-rose-600 mb-1">What you missed:</p>
                      <ul className="text-xs text-dark-600 space-y-1">
                        {r.comparison.missing.map((m, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-rose-500">✗</span> {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {r.comparison.improvements && r.comparison.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-brand-600 mb-1">Suggestions to improve:</p>
                      <ul className="text-xs text-dark-600 space-y-1">
                        {r.comparison.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-brand-500">→</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Basic Feedback */}
              <div className="mt-4 p-4 bg-dark-50 rounded-xl">
                <p className="text-sm font-medium text-dark-700 mb-1">Feedback:</p>
                <p className="text-sm text-dark-600">{r.feedback}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setCompleted(false);
              setResults([]);
              setCurrentIndex(0);
              setAnswer('');
              setTimeLeft(300);
            }}
            className="btn-secondary flex-1"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex-1"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!inProgress) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-dark-900">AI Mock Interview</h1>
            <p className="text-dark-500 mt-2">Powered by Groq AI - Generate personalized interview questions</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-3">Target Role</label>
              <input
                type="text"
                value={settings.role}
                onChange={(e) => setSettings({ ...settings, role: e.target.value })}
                className="input-field"
                placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-3">Focus Areas</label>
              <div className="grid grid-cols-2 gap-3">
                {['Technical', 'Problem Solving', 'Communication', 'Leadership', 'Behavioral', 'System Design'].map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      const newAreas = settings.focusAreas.includes(area)
                        ? settings.focusAreas.filter(a => a !== area)
                        : [...settings.focusAreas, area];
                      setSettings({ ...settings, focusAreas: newAreas });
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      settings.focusAreas.includes(area)
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-dark-200 hover:border-dark-300 text-dark-600'
                    }`}
                  >
                    {settings.focusAreas.includes(area) && (
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-3">Number of Questions</label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSettings({ ...settings, count: num })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      settings.count === num
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-dark-200 hover:border-dark-300 text-dark-600'
                    }`}
                  >
                    <span className="text-2xl font-bold">{num}</span>
                    <span className="block text-sm">Questions</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-brand-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-brand-700">
                  <p className="font-medium mb-1">AI-Powered Interview:</p>
                  <ul className="list-disc list-inside space-y-1 text-brand-600">
                    <li>Questions are generated in real-time using Groq AI</li>
                    <li>Each question has a 5-minute time limit</li>
                    <li>AI will evaluate your answers with detailed feedback</li>
                    <li>Your total score will be shown at the end</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={fetchQuestions}
              disabled={loading || settings.focusAreas.length === 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating AI Questions...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start AI Interview
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-dark-600">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              timeLeft > 120 ? 'bg-emerald-500' : timeLeft > 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${(timeLeft / 300) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentQuestion.category === 'Technical' ? 'bg-brand-100 text-brand-700' :
            currentQuestion.category === 'Behavioral' ? 'bg-purple-100 text-purple-700' :
            'bg-accent-100 text-accent-700'
          }`}>
            {currentQuestion.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
            currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {currentQuestion.difficulty}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-dark-900 mb-4">{currentQuestion.title}</h2>
        <p className="text-dark-600 mb-4">{currentQuestion.description}</p>
        
        {currentQuestion.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.keywords.map((keyword, idx) => (
              <span key={idx} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Answer */}
      <div className="card p-6">
        <label className="block text-sm font-medium text-dark-700 mb-3">
          Your Answer
          <span className="text-dark-400 font-normal ml-2">({answer.length} characters)</span>
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here... (You have 5 minutes)"
          className="input-field h-48 resize-none"
          disabled={loading}
        />
        
        <div className="flex items-center justify-between mt-4">
          {currentQuestion.answer && (
            <button
              type="button"
              onClick={() => alert(`Hint: ${currentQuestion.answer}`)}
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              Show Answer Hint
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="btn-primary ml-auto"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : answer.trim() ? 'Submit Answer' : 'Please enter an answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
