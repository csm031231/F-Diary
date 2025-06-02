import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diaryAPI } from '../api/api';

const DiaryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await diaryAPI.getEntryById(id);

        if (!response.data) {
          throw new Error('일기를 찾을 수 없습니다.');
        }

        setEntry(response.data);
      } catch (err) {
        console.error('일기 상세 불러오기 실패:', err);
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white font-gaegu">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-indigo-700 text-lg">일기를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 font-gaegu">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-red-400 text-white rounded-xl hover:bg-red-500"
        >
          ← 이전으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 py-10 font-gaegu">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-md p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{entry.title}</h1>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          작성일: {new Date(entry.created_at || entry.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div className="whitespace-pre-wrap text-lg text-gray-800 leading-relaxed mb-8">
          {entry.content}
        </div>

        {entry.empathy_response && (
          <section className="p-4 bg-indigo-50 rounded-2xl mb-6 border border-indigo-200">
            <h2 className="text-2xl text-indigo-700 mb-2">🤖 AI 공감 답변</h2>
            <p className="italic text-indigo-900">{entry.empathy_response}</p>
          </section>
        )}

        {entry.feedback && (
          <section className="p-4 bg-green-50 rounded-2xl border border-green-200">
            <h2 className="text-xl text-green-700 mb-2">💡 피드백</h2>
            <p className="text-green-900">{entry.feedback}</p>
          </section>
        )}

        <div className="mt-8 text-right">
          <button
            onClick={handleBack}
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl"
          >
            ← 뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryDetailPage;
