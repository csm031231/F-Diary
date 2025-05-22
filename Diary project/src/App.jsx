import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DiaryListPage from './pages/DiaryListPage';

// 로그인이 필요한 라우트를 위한 ProtectedRoute 컴포넌트
const ProtectedRoute = ({ children }) => {
  // 실제 토큰 검증으로 변경
  const token = localStorage.getItem('token');
  const isAuthenticated = token !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  // 인증 상태를 확인하기 위한 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <p className="text-indigo-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 메인 페이지 - 로그인 필요 */}
        <Route path="/" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        
        {/* 일기 목록 페이지 - 로그인 필요 */}
        <Route path="/diary" element={
          <ProtectedRoute>
            <DiaryListPage />
          </ProtectedRoute>
        } />
        
        {/* 로그인과 회원가입 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 404 페이지 - 모든 다른 경로를 메인으로 리디렉션 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;