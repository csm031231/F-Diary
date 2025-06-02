import React, { useState, useEffect } from 'react';
import { diaryAPI } from '../api/api';

const NotebookEntryForm = ({ onSave, onCancel, user }) => {
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [angerLevel, setAngerLevel] = useState('medium'); // 욕 강도 조절 상태

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Gaegu&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!autoAnalyze || newEntry.content.length < 20) return;

    const timer = setTimeout(() => {
      analyzeEmotion();
    }, 1000);

    return () => clearTimeout(timer);
  }, [newEntry.content, autoAnalyze, angerLevel]);

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😡',
    excited: '🎉',
    relaxed: '😌',
    focused: '🧐',
    neutral: '😐',
  };

  const analyzeEmotion = async () => {
    if (!newEntry.content.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const response = await diaryAPI.analyzeEmotion(newEntry.content, angerLevel);

      setNewEntry((prev) => ({
        ...prev,
        mood: response.data.emotion,
      }));
    } catch (error) {
      console.error('감정 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    onSave({
      ...newEntry,
      date: today,
      userId: user.id,
    });

    setNewEntry({ title: '', content: '', mood: 'neutral' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="relative shadow-lg border border-gray-300 bg-white"
        style={{
          width: '640px',
          height: '900px',
          backgroundImage: `
            repeating-linear-gradient(white 0px, white 24px, #e5e7eb 25px),
            linear-gradient(to right, #fca5a5 1px, transparent 1px)
          `,
          backgroundSize: '100% 25px, 1px 100%',
          backgroundPosition: '32px 0, 72px 0',
          backgroundRepeat: 'repeat',
          fontFamily: "'Gaegu', sans-serif",
          padding: '72px 32px 32px 72px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* 감정 선택 및 분석 */}
        <div className="absolute top-4 right-4 flex flex-col items-end">
          <div className="flex gap-2 mb-2">
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <button
                key={mood}
                onClick={() => setNewEntry({ ...newEntry, mood })}
                className={`text-xl px-2 py-1 rounded-full ${
                  newEntry.mood === mood ? 'bg-indigo-200' : 'hover:bg-gray-100'
                }`}
                title={mood}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* 감정 분석 및 욕 강도 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 flex items-center">
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={() => setAutoAnalyze(!autoAnalyze)}
                className="mr-1"
              />
              자동 감정 분석
            </label>

            <button
              onClick={analyzeEmotion}
              disabled={isAnalyzing || !newEntry.content.trim()}
              className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50"
            >
              {isAnalyzing ? '분석 중...' : 'AI 감정 분석'}
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            욕 강도:
            <select
              value={angerLevel}
              onChange={(e) => setAngerLevel(e.target.value)}
              className="ml-2 border rounded px-1 py-0.5"
            >
              <option value="soft">Soft</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 입력 영역 */}
        <form onSubmit={handleSubmit} className="h-full flex flex-col gap-6">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            className="bg-transparent w-full text-xl placeholder-gray-500 focus:outline-none"
            style={{
              lineHeight: '24px',
              fontSize: '20px',
            }}
          />

          <textarea
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            className="bg-transparent resize-none w-full h-full focus:outline-none"
            placeholder="오늘의 일기를 작성해보세요..."
            style={{
              lineHeight: '24px',
              fontSize: '18px',
            }}
          ></textarea>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotebookEntryForm;
