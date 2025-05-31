import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ user, showNewEntryButton = true, onNewEntry }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로 확인
  const isCalendarPage = location.pathname === '/';
  const isDiaryListPage = location.pathname === '/diary';

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Google Font 로드 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap" rel="stylesheet" />

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold text-indigo-900 font-gaegu hover:underline cursor-pointer">
              MyDiary
            </h1>
          </Link>
          
          <nav className="flex gap-4">
            {/* 캘린더 페이지에서는 일기 목록만 표시 */}
            {isCalendarPage && (
              <Link 
                to="/diary" 
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                일기 목록
              </Link>
            )}
            
            {/* 일기 목록 페이지에서는 달력 보기만 표시 */}
            {isDiaryListPage && (
              <Link 
                to="/" 
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                달력 보기
              </Link>
            )}
            
            {showNewEntryButton && onNewEntry && (
              <button 
                onClick={onNewEntry}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                새 일기
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* 스타일 추가 */}
      <style jsx="true">{`
        .font-gaegu {
          font-family: 'Gaegu', cursive, sans-serif;
        }
      `}</style>
    </>
  );
};

export default Header;