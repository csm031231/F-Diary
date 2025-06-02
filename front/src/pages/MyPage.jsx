import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Trash2, Edit, Save, Eye, EyeOff } from 'lucide-react';
import { userAPI, diaryAPI } from '../api/api';

const MyPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [diaryStats, setDiaryStats] = useState({ 
    totalDiaries: 0,
    thisMonthDiaries: 0,
    emotionStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 프로필 수정 모달 관련 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [originalData, setOriginalData] = useState({
    username: '',
    email: ''
  });

  // 사용자 프로필 조회
  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getUserProfile();
      console.log('프로필 조회 성공:', response.data);
      setUserProfile(response.data);
      
      // 프로필 수정 폼 데이터 초기화
      setEditFormData({
        username: response.data.username || '',
        email: response.data.email || '',
        password: '',
        confirmPassword: ''
      });
      setOriginalData({
        username: response.data.username || '',
        email: response.data.email || ''
      });
    } catch (err) {
      console.error('프로필 조회 실패:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.detail || '프로필 정보를 가져올 수 없습니다');
    }
  };

  // 일기 통계 조회 및 계산
  const fetchDiaryStats = async () => {
    try {
      const response = await diaryAPI.getAllEntries();
      const diaries = response.data;
      
      const now = new Date();
      const thisMonthDiaries = diaries.filter(diary => {
        const diaryDate = new Date(diary.created_at);
        return diaryDate.getMonth() === now.getMonth() && 
               diaryDate.getFullYear() === now.getFullYear();
      });

      const emotionStats = {};
      diaries.forEach(diary => {
        if (diary.emotion_tag) {
          emotionStats[diary.emotion_tag] = (emotionStats[diary.emotion_tag] || 0) + 1;
        }
      });

      setDiaryStats({
        totalDiaries: diaries.length,
        thisMonthDiaries: thisMonthDiaries.length,
        emotionStats
      });

    } catch (err) {
      console.error('일기 통계 조회 실패:', err);
      setDiaryStats({ 
        totalDiaries: 0,
        thisMonthDiaries: 0,
        emotionStats: {}
      });
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작...');
      await userAPI.logout();
      console.log('로그아웃 성공');
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 실패:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      console.log('회원탈퇴 시작...');
      await userAPI.deleteUser();
      console.log('회원탈퇴 성공');
      
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/login');
    } catch (err) {
      console.error('회원탈퇴 실패:', err);
      alert(err.response?.data?.detail || '회원탈퇴 중 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // 프로필 수정 모달 열기
  const handleEditProfile = () => {
    setShowEditModal(true);
    setEditError('');
    setEditSuccess('');
    // 현재 프로필 데이터로 폼 초기화
    setEditFormData({
      username: userProfile?.username || '',
      email: userProfile?.email || '',
      password: '',
      confirmPassword: ''
    });
  };

  // 프로필 수정 입력값 변경
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (editError) setEditError('');
    if (editSuccess) setEditSuccess('');
  };

  // 프로필 수정 유효성 검사
  const validateEditForm = () => {
    if (!editFormData.username.trim()) {
      setEditError('사용자명을 입력해주세요');
      return false;
    }

    if (!editFormData.email.trim()) {
      setEditError('이메일을 입력해주세요');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      setEditError('올바른 이메일 형식을 입력해주세요');
      return false;
    }

    if (editFormData.password) {
      if (editFormData.password.length < 6) {
        setEditError('비밀번호는 최소 6자 이상이어야 합니다');
        return false;
      }

      if (editFormData.password !== editFormData.confirmPassword) {
        setEditError('비밀번호가 일치하지 않습니다');
        return false;
      }
    }

    return true;
  };

  // 프로필 수정 저장
  const handleSaveProfile = async () => {
    if (!validateEditForm()) return;

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const updateData = {};
      
      if (editFormData.username !== originalData.username) {
        updateData.username = editFormData.username;
      }
      
      if (editFormData.email !== originalData.email) {
        updateData.email = editFormData.email;
      }
      
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      if (Object.keys(updateData).length === 0) {
        setEditSuccess('변경사항이 없습니다');
        return;
      }

      const response = await userAPI.updateUser(updateData);
      console.log('프로필 업데이트 성공:', response.data);
      
      setEditSuccess('프로필이 성공적으로 업데이트되었습니다');
      
      // 원본 데이터 업데이트
      setOriginalData({
        username: editFormData.username,
        email: editFormData.email
      });
      
      // 사용자 프로필 상태 업데이트
      setUserProfile(prev => ({
        ...prev,
        username: editFormData.username,
        email: editFormData.email
      }));
      
      // 비밀번호 필드 초기화
      setEditFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      // 2초 후 모달 닫기
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 2000);

    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      setEditError(err.response?.data?.detail || '프로필 업데이트에 실패했습니다');
    } finally {
      setEditLoading(false);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchDiaryStats()
        ]);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 가입일로부터 지난 일수 계산
  const getDaysCount = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 사용자명의 첫 글자 또는 이모지 반환
  const getProfileIcon = (username) => {
    if (!username) return '😊';
    const firstChar = username.charAt(0);
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(firstChar) ? firstChar : firstChar.toUpperCase();
  };

  // 가장 많은 감정 태그 찾기
  const getMostCommonEmotion = () => {
    const emotions = diaryStats.emotionStats;
    if (!emotions || Object.keys(emotions).length === 0) return null;
    
    const sortedEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
    return sortedEmotions[0];
  };

  // 감정 한글 변환
  const getEmotionKorean = (emotion) => {
    const emotionMap = {
      happy: '행복',
      sad: '슬픔',
      angry: '화남',
      excited: '신남',
      relaxed: '편안',
      focused: '집중',
      neutral: '평온'
    };
    return emotionMap[emotion] || emotion;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-purple-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-lg shadow-sm max-w-sm mx-4">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              navigate('/login');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  const mostCommonEmotion = getMostCommonEmotion();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-50">
      {/* 헤더 */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button onClick={handleBack} className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Setting</h1>
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="px-6 pt-32 py-8 flex justify-center">
        <div 
          className="bg-white p-10 w-full max-w-md"
          style={{
            border: '1px solid #333',
            borderRadius: '25px 20px 30px 18px',
            transform: 'rotate(-0.5deg)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
          }}
        >
          {/* 프로필 섹션 */}
          <div className="text-center mb-8">
            <div 
              className="w-20 h-20 bg-yellow-300 flex items-center justify-center mx-auto mb-4"
              style={{
                border: '1px solid #333',
                borderRadius: '50% 45% 50% 48%',
                transform: 'rotate(2deg)'
              }}
            >
              <span className="text-2xl font-bold text-gray-800">
                {getProfileIcon(userProfile?.username)}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {userProfile?.username || 'MyDiary User'}
            </h2>
            <p className="text-gray-700 text-sm mb-1">{userProfile?.email}</p>
            <p className="text-gray-600 text-xs mb-6">Persistence is a virtue</p>
            
            {/* 통계 정보 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {getDaysCount(userProfile?.created_at)}
                </div>
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {diaryStats.totalDiaries}
                </div>
                <div className="text-xs text-gray-600">Diaries</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {diaryStats.thisMonthDiaries}
                </div>
                <div className="text-xs text-gray-600">This Month</div>
              </div>
            </div>
            
            {/* 가장 많은 감정 표시 */}
            {mostCommonEmotion && (
              <div 
                className="inline-block px-4 py-2 bg-white/60 mb-6"
                style={{
                  borderRadius: '15px 20px 18px 22px',
                  border: '1px solid #333'
                }}
              >
                <span className="text-sm text-gray-700">
                  Most Common: <span className="font-medium text-purple-700">
                    {getEmotionKorean(mostCommonEmotion[0])} ({mostCommonEmotion[1]}회)
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* 버튼 섹션 */}
          <div className="space-y-4">
            {/* 프로필 수정 버튼 */}
            <button
              onClick={handleEditProfile}
              className="w-full py-3 px-4 text-gray-800 hover:bg-blue-100 transition-colors font-medium"
              style={{
                border: '1px solid #333',
                borderRadius: '15px 18px 14px 16px',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                transform: 'rotate(0.2deg)'
              }}
            >
              <div className="flex items-center justify-center">
                <Edit className="w-4 h-4 mr-2" />
                <span>프로필 수정</span>
              </div>
            </button>

            {/* 로그아웃 버튼 */}
            <button 
              onClick={handleLogout}
              className="w-full py-3 px-4 text-red-700 hover:bg-red-100 transition-colors font-medium"
              style={{
                border: '1px solid #333',
                borderRadius: '20px 16px 22px 18px',
                background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                transform: 'rotate(-0.2deg)'
              }}
            >
              <div className="flex items-center justify-center">
                <LogOut className="w-4 h-4 mr-2" />
                <span>로그아웃</span>
              </div>
            </button>

            {/* 회원탈퇴 버튼 */}
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-4 font-medium transition-colors text-red-800 hover:bg-red-200"
              style={{
                border: '1px solid #333',
                borderRadius: '16px 24px 18px 20px',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                transform: 'rotate(0.1deg)'
              }}
            >
              <div className="flex items-center justify-center">
                <Trash2 className="w-4 h-4 mr-2" />
                <span>회원탈퇴</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">프로필 수정</h3>
            
            {/* 에러/성공 메시지 */}
            {editError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {editError}
              </div>
            )}
            
            {editSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                {editSuccess}
              </div>
            )}

            <div className="space-y-4">
              {/* 사용자명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자명
                </label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="사용자명을 입력하세요"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호 (선택사항)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="새 비밀번호 (변경하지 않으려면 비워두세요)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 */}
              {editFormData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={editFormData.confirmPassword}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-1" />
                {editLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4">
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 여백 */}
      <div className="h-12"></div>
    </div>
  );
};

export default MyPage;