import { useState, useEffect } from 'react';
import axios from 'axios';

const ResumeAnalyzer = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchHistory();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/resumes/skills');
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/resumes');
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      return;
    }
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !selectedRole) {
      setError('Please select a file and target role');
      return;
    }

    setAnalyzing(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', selectedRole);

    try {
      const response = await axios.post('/api/resumes/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing resume');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-dark-900">Resume Analyzer</h1>
        <p className="text-dark-500 mt-1">Upload your resume to get skill matching and recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-6">Upload Resume</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Target Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Resume (PDF)</label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                file ? 'border-brand-300 bg-brand-50' : 'border-dark-200 hover:border-brand-300'
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  required
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="font-medium text-dark-800">{file.name}</p>
                      <p className="text-sm text-dark-500 mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="font-medium text-dark-700">Click to upload PDF</p>
                      <p className="text-sm text-dark-400 mt-1">Maximum file size: 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={analyzing || !file || !selectedRole}
              className="btn-primary w-full"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Analyze Resume
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-brand-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-brand-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-brand-700">
                <p className="font-medium mb-1">Tips for best results:</p>
                <ul className="list-disc list-inside space-y-1 text-brand-600">
                  <li>Use a well-formatted PDF resume</li>
                  <li>Include technical skills relevant to your target role</li>
                  <li>List skills in a clear, scannable format</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-6">Analysis Result</h2>
          
          {result ? (
            <div className="space-y-6">
              {/* Match Percentage */}
              <div className="text-center p-6 bg-gradient-to-br from-brand-50 to-accent-50 rounded-2xl">
                <p className="text-sm text-dark-500 mb-2">Match Percentage</p>
                <p className={`text-6xl font-bold ${
                  result.matchPercentage >= 70 ? 'text-emerald-500' :
                  result.matchPercentage >= 50 ? 'text-amber-500' :
                  'text-rose-500'
                }`}>
                  {result.matchPercentage}%
                </p>
                <p className="text-dark-600 mt-2">{result.targetRole}</p>
              </div>

              {/* Identified Skills */}
              <div>
                <p className="font-medium text-dark-700 mb-3">Identified Skills ({result.identifiedSkills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {result.identifiedSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {result.missingSkills?.length > 0 && (
                <div>
                  <p className="font-medium text-dark-700 mb-3">Skills to Add ({result.missingSkills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="font-medium text-amber-800 mb-3">Recommendations</p>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-amber-700 flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-dark-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-dark-500">Upload a resume to see analysis results</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-dark-100">
            <h2 className="text-xl font-semibold text-dark-800">Analysis History</h2>
          </div>
          <div className="divide-y divide-dark-100">
            {history.map((item) => (
              <div key={item._id} className="p-4 hover:bg-dark-50 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-dark-800">{item.fileName}</p>
                    <p className="text-sm text-dark-500">{item.targetRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    item.matchPercentage >= 70 ? 'text-emerald-600' :
                    item.matchPercentage >= 50 ? 'text-amber-600' :
                    'text-rose-600'
                  }`}>
                    {item.matchPercentage}%
                  </p>
                  <p className="text-xs text-dark-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
