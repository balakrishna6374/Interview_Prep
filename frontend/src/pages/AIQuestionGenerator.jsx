import { useState } from 'react';
import axios from 'axios';

const AIQuestionGenerator = () => {
  const [formData, setFormData] = useState({
    topic: '',
    category: 'Technical',
    difficulty: 'Medium',
    count: 5
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setGeneratedQuestions([]);

    try {
      const response = await axios.post('/api/ai/generate-questions', formData);
      setGeneratedQuestions(response.data.data);
      setSuccess(`Successfully generated ${response.data.data.length} questions!`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (question) => {
    try {
      await axios.post('/api/questions', question);
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  const handleSaveAll = async () => {
    for (const question of generatedQuestions) {
      await handleSaveQuestion(question);
    }
    setSuccess('All questions saved to database!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-dark-900">AI Question Generator</h1>
        <p className="text-dark-500 mt-1">Generate interview questions using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-4">Generate Questions</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="input-field"
                placeholder="e.g., JavaScript, React, System Design"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="System Design">System Design</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="input-field"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Number of Questions</label>
              <select
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={7}>7 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate with AI
                </span>
              )}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-dark-800">Generated Questions</h2>
            {generatedQuestions.length > 0 && (
              <button onClick={handleSaveAll} className="btn-secondary text-sm">
                Save All to Database
              </button>
            )}
          </div>

          {generatedQuestions.length === 0 ? (
            <div className="text-center py-12 text-dark-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No questions generated yet</p>
              <p className="text-sm">Fill the form and click generate</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 bg-dark-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        q.category === 'Behavioral' ? 'bg-purple-100 text-purple-700' :
                        q.category === 'System Design' ? 'bg-accent-100 text-accent-700' :
                        'bg-brand-100 text-brand-700'
                      }`}>
                        {q.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSaveQuestion(q)}
                      className="text-brand-600 hover:text-brand-700 text-sm"
                    >
                      Save
                    </button>
                  </div>
                  <h3 className="font-semibold text-dark-800 mb-1">{q.title}</h3>
                  <p className="text-sm text-dark-500 mb-2">{q.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {q.keywords?.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                  
                  {/* Answer & Explanation */}
                  <button
                    onClick={() => setExpandedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    {expandedAnswers[idx] ? 'Hide Answer & Explanation' : 'Show Answer & Explanation'}
                  </button>
                  
                  {expandedAnswers[idx] && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      {q.answer && (
                        <div className="p-3 bg-emerald-50 rounded-lg">
                          <p className="text-sm font-medium text-emerald-800">Answer:</p>
                          <p className="text-sm text-emerald-700">{q.answer}</p>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="p-3 bg-brand-50 rounded-lg">
                          <p className="text-sm font-medium text-brand-800">Explanation:</p>
                          <p className="text-sm text-brand-700">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
