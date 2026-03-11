import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  const isAIQuestion = location.state?.isAI;

  useEffect(() => {
    if (isAIQuestion && location.state?.question) {
      setQuestion(location.state.question);
      setLoading(false);
    } else {
      fetchQuestion();
    }
  }, [id, isAIQuestion]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`/api/questions/${id}`);
      setQuestion(response.data.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      navigate('/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setExplaining(true);
    try {
      const response = await axios.post('/api/ai/explain-question', {
        question: { title: question.title, description: question.description }
      });
      setExplanation(response.data.data);
    } catch (error) {
      console.error('Error getting explanation:', error);
      if (question.answer || question.explanation) {
        setExplanation(question.answer || question.explanation || 'No explanation available');
      }
    } finally {
      setExplaining(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (isAIQuestion) {
        const response = await axios.post('/api/ai/evaluate-answer', {
          question: { title: question.title, description: question.description },
          answer
        });
        
        setResult({
          score: response.data.data.score,
          feedback: response.data.data.feedback
        });
      } else {
        const startTime = localStorage.getItem(`question_start_${id}`) || Date.now();
        const timeSpent = Math.round((Date.now() - parseInt(startTime)) / 1000);
        
        const response = await axios.post('/api/attempts/submit', {
          questionId: id,
          answer,
          timeSpent
        });
        
        setResult(response.data.data);
      }
      if (!completed) setCompleted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await axios.delete(`/api/questions/${id}/save`);
        setSaved(false);
      } else {
        await axios.post(`/api/questions/${id}/save`);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem(`question_start_${id}`, Date.now());
    return () => localStorage.removeItem(`question_start_${id}`);
  }, [id]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-dark-100 text-dark-700 border-dark-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Technical': return 'bg-brand-100 text-brand-700 border-brand-200';
      case 'Behavioral': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'System Design': return 'bg-accent-100 text-accent-700 border-accent-200';
      default: return 'bg-dark-100 text-dark-700 border-dark-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/questions')}
        className="inline-flex items-center text-dark-500 hover:text-brand-600 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Questions
      </button>

      {/* Question Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(question.category)}`}>
              {question.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              saved 
                ? 'bg-brand-100 text-brand-700' 
                : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
            }`}
          >
            <svg className="w-5 h-5 inline mr-1" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-dark-900 mb-4">{question.title}</h1>
        <p className="text-dark-600 whitespace-pre-line leading-relaxed">{question.description}</p>

        {question.keywords?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-dark-100">
            <p className="text-sm font-medium text-dark-500 mb-3">Key topics to cover:</p>
            <div className="flex flex-wrap gap-2">
              {question.keywords.map((keyword, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Answer & Explanation Buttons */}
        {(question.answer || question.explanation) && (
          <div className="mt-6 pt-4 border-t border-dark-100 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
              <button
                onClick={handleExplain}
                disabled={explaining}
                className="px-4 py-2 bg-brand-100 text-brand-700 rounded-lg font-medium hover:bg-brand-200 transition-colors disabled:opacity-50"
              >
                {explaining ? 'Loading...' : 'Explain with AI'}
              </button>
            </div>

            {showAnswer && question.answer && (
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="font-medium text-emerald-800 mb-2">Answer:</p>
                <p className="text-emerald-700 whitespace-pre-line">{question.answer}</p>
              </div>
            )}

            {showAnswer && question.explanation && (
              <div className="p-4 bg-brand-50 rounded-xl">
                <p className="font-medium text-brand-800 mb-2">Explanation:</p>
                <p className="text-brand-700 whitespace-pre-line">{question.explanation}</p>
              </div>
            )}

            {explanation && (
              <div className="p-4 bg-purple-50 rounded-xl animate-fade-in">
                <p className="font-medium text-purple-800 mb-2">AI Explanation:</p>
                <p className="text-purple-700 whitespace-pre-line">{explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Section */}
      {!result ? (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-4">Your Answer</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="input-field h-64 resize-none"
              required
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-dark-400">{answer.length} characters</p>
              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Results */
        <div className="card p-6 animate-slide-up">
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-dark-500 mb-2">Your Score</p>
            <p className={`text-7xl font-bold ${
              result.score >= 80 ? 'text-emerald-500' :
              result.score >= 60 ? 'text-amber-500' :
              'text-rose-500'
            }`}>
              {result.score}%
            </p>
          </div>
          
          <div className="p-4 bg-dark-50 rounded-xl mb-6">
            <div className="flex items-start space-x-3">
              <svg className={`w-6 h-6 mt-0.5 ${
                result.score >= 80 ? 'text-emerald-500' :
                result.score >= 60 ? 'text-amber-500' :
                'text-rose-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-dark-800 mb-1">Feedback</p>
                <p className="text-dark-600">{result.feedback}</p>
              </div>
            </div>
          </div>

          {question.sampleAnswer && (
            <div className="p-4 bg-brand-50 rounded-xl mb-6">
              <p className="font-medium text-brand-800 mb-2">Sample Answer</p>
              <p className="text-brand-700 whitespace-pre-line">{question.sampleAnswer}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setAnswer('');
                setResult(null);
              }}
              className="btn-secondary flex-1"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/questions')}
              className="btn-primary flex-1"
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
