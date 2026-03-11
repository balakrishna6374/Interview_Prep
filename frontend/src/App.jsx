import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import MockInterview from './pages/MockInterview';
import Analytics from './pages/Analytics';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AdminPanel from './pages/AdminPanel';
import AIQuestionGenerator from './pages/AIQuestionGenerator';
import AIChatbot from './pages/AIChatbot';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/questions" element={
                <PrivateRoute>
                  <Questions />
                </PrivateRoute>
              } />
              
              <Route path="/questions/:id" element={
                <PrivateRoute>
                  <QuestionDetail />
                </PrivateRoute>
              } />
              
              <Route path="/mock-interview" element={
                <PrivateRoute>
                  <MockInterview />
                </PrivateRoute>
              } />
              
              <Route path="/analytics" element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              } />
              
              <Route path="/resume" element={
                <PrivateRoute>
                  <ResumeAnalyzer />
                </PrivateRoute>
              } />
              
              <Route path="/ai-questions" element={
                <PrivateRoute>
                  <AIQuestionGenerator />
                 </PrivateRoute>
              } />
             
              
              <Route path="/chatbot" element={
                <PrivateRoute>
                  <AIChatbot />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
