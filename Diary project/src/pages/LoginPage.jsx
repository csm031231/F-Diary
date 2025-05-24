import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userAPI } from '../api/api';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 이미 로그인된 경우 메인페이지로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('이미 로그인됨, 메인페이지로 이동');
      navigate('/', { replace: true });
      return;
    }
    
    // 회원가입 후 리다이렉트된 경우 성공 메시지 표시
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.registeredEmail) {
      setCredentials(prev => ({
        ...prev,
        email: location.state.registeredEmail
      }));
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    
    // 입력 시 에러 메시지 초기화
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // 폼 유효성 검사
    if (!credentials.email || !credentials.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🚀 로그인 시도 시작:', {
        email: credentials.email,
        passwordLength: credentials.password.length
      });
      
      // userAPI.login 호출
      const response = await userAPI.login({
        email: credentials.email,
        password: credentials.password
      });

      console.log('✅ 로그인 응답 성공:', {
        access_token: response.data.access_token ? '토큰 받음' : '토큰 없음',
        token_type: response.data.token_type
      });

      const { access_token, token_type } = response.data;
      
      if (!access_token) {
        throw new Error('서버에서 토큰을 반환하지 않았습니다.');
      }
      
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_type', token_type || 'bearer');
      
      console.log('💾 토큰 저장 완료');

      // 사용자 프로필 정보 가져오기
      try {
        console.log('👤 사용자 프로필 가져오기 시도');
        const userResponse = await userAPI.getUserProfile();
        console.log('✅ 사용자 프로필 응답:', userResponse.data);
        
        const userData = {
          id: userResponse.data.id || 1,
          name: userResponse.data.username || credentials.email.split('@')[0],
          email: userResponse.data.email || credentials.email,
          username: userResponse.data.username
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 사용자 정보 저장 완료:', userData);
        
      } catch (profileError) {
        console.warn('⚠️ 프로필 가져오기 실패, 기본 정보로 저장:', profileError);
        
        // 프로필 가져오기 실패 시에도 기본 정보로 저장
        const fallbackUserData = {
          id: 1,
          name: credentials.email.split('@')[0],
          email: credentials.email
        };
        localStorage.setItem('user', JSON.stringify(fallbackUserData));
      }

      console.log('🎉 로그인 완료, 메인페이지로 이동');
      
      // 성공 메시지 표시 후 리다이렉트
      setSuccessMessage('로그인 성공! 메인페이지로 이동합니다...');
      
      // 약간의 지연 후 리다이렉트 (사용자가 성공 메시지를 볼 수 있도록)
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);

    } catch (error) {
      console.error('❌ 로그인 실패:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.status === 401) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.response?.status === 422) {
        errorMessage = '입력 데이터 형식이 올바르지 않습니다.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-900">Diary</h1>
        <h2 className="text-xl font-medium text-center mb-6">로그인</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="이메일 주소를 입력하세요"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800">
                비밀번호 찾기
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800">
              회원가입
            </Link>
          </p>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500 text-center">
            테스트 계정: test@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;