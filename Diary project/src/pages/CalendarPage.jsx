import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import NewEntryForm from './NewEntryForm';
import { diaryAPI } from '../api/api';

const CalendarPage = () => {
  const [entries, setEntries] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 로그인 상태 확인 
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        setIsLoggedIn(true);
        setUser(JSON.parse(savedUser));
      } else {
        setIsLoggedIn(false);
        setUser(null);
        navigate('/login');
      }
    };

    checkLoginStatus();
  }, [navigate]);

  // 다이어리 엔트리 가져오기 (API 호출)
  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    const fetchEntries = async () => {
      try {
        const response = await diaryAPI.getAllEntries();
        setEntries(response.data);
      } catch (error) {
        console.error('Failed to fetch diary entries:', error);
        // 에러 처리, 예: 토큰 만료 시 로그아웃
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [isLoggedIn]);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  // 월 변경 처리
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 감정별 색상
  const moodColors = {
    happy: 'bg-yellow-100',
    sad: 'bg-blue-100',
    angry: 'bg-red-100',
    excited: 'bg-purple-100',
    relaxed: 'bg-green-100',
    focused: 'bg-indigo-100',
    neutral: 'bg-gray-100'
  };

  // 감정 이모지
  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😡',
    excited: '🎉',
    relaxed: '😌',
    focused: '🧐',
    neutral: '😐'
  };

  // 새 일기 추가 처리 - API 호출
  const handleAddEntry = async (entryData) => {
    try {
      // API를 통해 새 일기 등록
      const response = await diaryAPI.createEntry({
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        date: entryData.date
      });
      
      // 성공적으로 추가된 경우, 일기 목록 업데이트
      setEntries(prevEntries => [response.data, ...prevEntries]);
      
      // 폼 닫기
      setShowNewEntryForm(false);
    } catch (error) {
      console.error('Failed to add diary entry:', error);
      alert('일기 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 로그인 화면으로 리디렉션
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6 text-center">
            일기를 보거나 작성하기 위해서는 로그인이 필요합니다.
          </p>
          <div className="flex justify-center">
            <Link
              to="/login"
              className="w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700 transition-colors"
            >
              로그인 하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">달력을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 손글씨 폰트 추가 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-900 font-gaegu">MyDiary</h1>
          <nav className="flex gap-4">
            <Link 
              to="/diary" 
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              일기 목록
            </Link>
            <button 
              onClick={() => setShowNewEntryForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              새 일기
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 사용자 환영 메시지 */}
        <div className="mb-6">
          <h2 className="text-xl font-medium font-gaegu">
            안녕하세요, {user?.name || '사용자'}님! 오늘의 감정을 기록해보세요.
          </h2>
        </div>

        {/* New Entry Form */}
        {showNewEntryForm && (
          <NewEntryForm 
            onSave={handleAddEntry} 
            onCancel={() => setShowNewEntryForm(false)} 
            user={user}
          />
        )}

        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="text-xl font-medium font-gaegu">
              {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* 감정 범례 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <div 
                key={mood} 
                className={`flex items-center px-3 py-1 rounded-full ${moodColors[mood]}`}
              >
                <span className="mr-1">{emoji}</span>
                <span className="capitalize">{mood}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 달력 컴포넌트 */}
        <div className="custom-calendar-container">
          <Calendar 
            currentDate={currentDate} 
            entries={entries} 
            moodColors={moodColors}
            moodEmojis={moodEmojis}
          />
        </div>

        {/* 월별 감정 통계 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-medium mb-4 font-gaegu">이번 달 감정 요약</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(moodEmojis).map(([mood, emoji]) => {
              const count = entries.filter(entry => {
                const entryDate = new Date(entry.date);
                return (
                  entry.mood === mood && 
                  entryDate.getMonth() === currentDate.getMonth() && 
                  entryDate.getFullYear() === currentDate.getFullYear()
                );
              }).length;
              
              return (
                <div key={mood} className={`${moodColors[mood]} p-4 rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-lg font-medium">{count}일</span>
                  </div>
                  <div className="capitalize text-sm text-gray-600">{mood}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 스타일 추가 */}
      <style jsx="true">{`
        .font-gaegu {
          font-family: 'Gaegu', cursive, sans-serif;
        }
        
        .custom-calendar-container {
          max-width: 100%;
          overflow-x: auto;
        }
      `}</style>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500">
          <p>Diary Emotion © 2025 - 당신의 감정을 기록하세요</p>
        </div>
      </footer>
    </div>
  );
};

export default CalendarPage;