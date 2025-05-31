import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NewEntryForm from './NewEntryForm';
import { diaryAPI } from '../api/api';

const DiaryListPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  // 감정 태그를 mood로 변환하는 함수
  const emotionToMood = (emotion) => {
    const emotionMap = {
      'happy': 'happy',
      'joy': 'happy',
      'excited': 'excited',
      'sad': 'sad',
      'depressed': 'sad',
      'angry': 'angry',
      'frustrated': 'angry',
      'relaxed': 'relaxed',
      'calm': 'relaxed',
      'focused': 'focused',
      'concentrated': 'focused',
      'neutral': 'neutral'
    };
    return emotionMap[emotion?.toLowerCase()] || 'neutral';
  };

  // 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // 로그인되어 있지 않으면 로그인 페이지로 리디렉션
      navigate('/login');
    }
  }, [navigate]);

  // 사용자의 일기 목록 가져오기 (API 호출)
  useEffect(() => {
    if (!user) return;

    const fetchDiaries = async () => {
      try {
        const response = await diaryAPI.getAllEntries();
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedEntries = response.data.map(entry => ({
          ...entry,
          mood: emotionToMood(entry.emotion_tag || 'neutral'),
          date: entry.created_at || entry.updated_at || entry.date,
          // 백엔드에서 제공하는 empathy_response와 feedback 활용
          aiResponse: entry.empathy_response,
          feedback: entry.feedback
        }));
        
        setEntries(transformedEntries);
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

    fetchDiaries();
  }, [user]);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 새 일기 추가 처리 - API 호출
  const handleAddEntry = async (entryData) => {
    try {
      // API를 통해 새 일기 등록
      const response = await diaryAPI.createEntry({
        title: entryData.title,
        content: entryData.content,
        intensity: entryData.intensity || "medium"
      });
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedEntry = {
        ...response.data,
        mood: emotionToMood(response.data.emotion_tag || 'neutral'),
        date: response.data.created_at || response.data.date,
        aiResponse: response.data.empathy_response,
        feedback: response.data.feedback
      };
      
      // 성공적으로 추가된 경우, 일기 목록 업데이트
      setEntries(prevEntries => [transformedEntry, ...prevEntries]);
      
      // 폼 닫기
      setShowNewEntryForm(false);
    } catch (error) {
      console.error('Failed to add diary entry:', error);
      
      // 오늘 이미 일기를 작성했다는 에러 처리
      if (error.response && error.response.status === 400) {
        alert(error.response.data.detail || '일기 추가에 실패했습니다.');
      } else {
        alert('일기 추가에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 일기 삭제 함수 추가
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('정말로 이 일기를 삭제하시겠습니까?')) return;
    
    try {
      await diaryAPI.deleteEntry(id);
      // 성공적으로 삭제된 경우, 일기 목록 업데이트
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete diary entry:', error);
      alert('일기 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 필터링된 일기 목록
  const filteredEntries = activeFilter === 'all' 
    ? entries 
    : entries.filter(entry => entry.mood === activeFilter);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">일기를 불러오는 중...</p>
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

      {/* Header 컴포넌트 사용 */}
      <Header 
        user={user} 
        onNewEntry={() => setShowNewEntryForm(true)}
      />
      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-medium font-gaegu mb-2">내 일기 목록</h2>
          <p className="text-gray-600">
            {user?.name}님의 일기 모음입니다. 총 {entries.length}개의 일기가 있습니다.
          </p>
        </div>

        {/* New Entry Form */}
        {showNewEntryForm && (
          <NewEntryForm 
            onSave={handleAddEntry} 
            onCancel={() => setShowNewEntryForm(false)} 
            user={user}
          />
        )}

        {/* 필터 버튼 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              모든 감정
            </button>
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <button
                key={mood}
                onClick={() => setActiveFilter(mood)}
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  activeFilter === mood
                    ? 'bg-indigo-600 text-white'
                    : `${moodColors[mood]} text-gray-700 hover:bg-opacity-80`
                }`}
              >
                <span className="mr-2">{emoji}</span>
                <span className="capitalize">{mood}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 일기 목록 */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">해당하는 일기가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 일기를 작성해보세요</p>
            <button
              onClick={() => setShowNewEntryForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              일기 작성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map(entry => (
              <div 
                key={entry.id} 
                className={`${moodColors[entry.mood]} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-medium">{entry.title}</h3>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{moodEmojis[entry.mood]}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(entry.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 font-gaegu">
                  {entry.content.length > 150 
                    ? `${entry.content.substring(0, 150)}...` 
                    : entry.content
                  }
                </p>
                <div className="flex justify-between">
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    삭제
                  </button>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    onClick={() => {
                      // 일기 상세 보기 구현 (아직 구현되지 않음)
                      // navigate(`/diary/${entry.id}`);
                      alert('일기 상세 보기 기능은 아직 구현되지 않았습니다.');
                    }}
                  >
                    전체 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 스타일 추가 */}
      <style jsx="true">{`
        .font-gaegu {
          font-family: 'Gaegu', cursive, sans-serif;
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

export default DiaryListPage;