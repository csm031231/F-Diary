import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

const Header = ({ user, showNewEntryButton = true, onNewEntry }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);

  // 현재 경로 확인
  const isCalendarPage = location.pathname === '/';
  const isDiaryListPage = location.pathname === '/diary';

  // 사용자 프로필 조회
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error('프로필 조회 실패:', err);
    }
  };

  // 프로필 클릭 핸들러
  const handleProfileClick = () => {
    navigate('/mypage');
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
          
          <nav className="flex gap-4 items-center">
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
            
            {/* 프로필 버튼 */}
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                {userProfile?.username ? (
                  <span className="text-sm font-medium text-gray-800">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
              {userProfile?.username && (
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {userProfile.username}
                </span>
              )}
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