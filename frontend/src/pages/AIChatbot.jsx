import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Career Coach specializing in behavioral interviews.\n\nI can help you with:\n• Behavioral questions with STAR method answers\n• Interview preparation tips\n• Career guidance\n• Resume advice\n\nClick on any behavioral question on the right to see the ideal answer with STAR method!\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [behavioralQuestions, setBehavioralQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchBehavioralQuestions();
  }, []);

  const fetchBehavioralQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await axios.get('/api/ai/behavioral-questions');
      if (response.data.success) {
        setBehavioralQuestions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching behavioral questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await axios.post('/api/ai/chat', {
        message: userMessage,
        history
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.data.message 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const handleViewAnswer = (idx) => {
    setExpandedAnswer(expandedAnswer === idx ? null : idx);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-dark-900">AI Career Coach</h1>
        <p className="text-dark-500 mt-1">Master behavioral interviews with STAR method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-4 h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white'
                        : 'bg-dark-100 text-dark-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-100 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                      <span className="text-dark-500 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about interviews..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary px-6"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-dark-800">Behavioral Questions</h3>
              <button 
                onClick={fetchBehavioralQuestions}
                disabled={loadingQuestions}
                className="text-brand-600 hover:text-brand-700 text-xs"
              >
                {loadingQuestions ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loadingQuestions ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              </div>
            ) : behavioralQuestions.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {behavioralQuestions.map((bq, idx) => (
                  <div key={idx} className="border border-dark-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleViewAnswer(idx)}
                      disabled={loading}
                      className="w-full text-left p-3 text-sm bg-dark-50 hover:bg-brand-50 transition-colors disabled:opacity-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-dark-700 line-clamp-2">{bq.question}</span>
                      <svg 
                        className={`w-4 h-4 text-dark-400 flex-shrink-0 transition-transform ${expandedAnswer === idx ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedAnswer === idx && (
                      <div className="p-3 bg-white border-t border-dark-100 space-y-3 animate-fade-in">
                        {bq.answer && (
                          <div>
                            <p className="text-xs font-semibold text-brand-600 mb-1">STAR Answer:</p>
                            <p className="text-xs text-dark-600 whitespace-pre-line">{bq.answer}</p>
                          </div>
                        )}
                        {bq.keyPoints && bq.keyPoints.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-emerald-600 mb-1">Key Points:</p>
                            <div className="flex flex-wrap gap-1">
                              {bq.keyPoints.map((point, i) => (
                                <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {bq.whatLookFor && (
                          <div>
                            <p className="text-xs font-semibold text-purple-600 mb-1">What Interviewer Looks For:</p>
                            <p className="text-xs text-dark-600">{bq.whatLookFor}</p>
                          </div>
                        )}
                        {bq.tips && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 mb-1">Tips:</p>
                            <p className="text-xs text-dark-600">{bq.tips}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-dark-400 text-sm">
                Click refresh to load questions
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-dark-800 mb-3">Quick Ask</h3>
            <div className="space-y-2">
              {[
                'How to answer "Tell me about yourself"?',
                'What is STAR method?',
                'How to handle "What is your weakness"?',
                'Questions to ask interviewer'
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  disabled={loading}
                  className="w-full text-left p-2 text-sm bg-dark-50 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
