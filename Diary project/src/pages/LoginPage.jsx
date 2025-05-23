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
      navigate('/', { replace: true });
      return;
    }
    
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('로그인 시도:', credentials.email);
      
      // userAPI.login에서 FormData 생성하므로 credentials 객체를 그대로 전달
      const response = await userAPI.login({
        username: credentials.email,  // 백엔드에서 username 필드를 사용
        password: credentials.password
      });

      console.log('로그인 응답:', response.data);

      const { access_token, token_type } = response.data;
      
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_type', token_type);
      
      // 사용자 정보도 함께 저장 (선택적)
      try {
        const userResponse = await userAPI.getUserProfile();
        localStorage.setItem('user', JSON.stringify({
          id: userResponse.data.id || 1, // 백엔드에서 id를 제공하지 않는 경우 임시값
          name: userResponse.data.nickname || userResponse.data.username,
          email: credentials.email
        }));
      } catch (profileError) {
        // 프로필 가져오기 실패 시에도 기본 정보로 저장
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: credentials.email.split('@')[0], // 이메일의 @ 앞부분을 이름으로 사용
          email: credentials.email
        }));
      }

      console.log('토큰 저장 완료, 메인페이지로 이동');
      
      // replace: true로 뒤로가기 방지
      navigate('/', { replace: true });

    } catch (error) {
      console.error('로그인 실패:', error);
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.status === 401) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
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