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

  // 회원가입 페이지에서 리디렉션되었을 때 메시지와 이메일을 받아옵니다
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.registeredEmail) {
      setCredentials(prev => ({
        ...prev,
        email: location.state.registeredEmail
      }));
    }
  }, [location]);

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
      // API 호출하여 로그인 시도
      const response = await userAPI.login({
        email: credentials.email,
        password: credentials.password
      });
      
      // 로그인 성공
      const { token, user } = response.data;
      
      // 토큰 및 사용자 정보 저장
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 메인 페이지로 리디렉션
      navigate('/');
    } catch (error) {
      // 로그인 실패
      console.error('Login failed:', error);
      
      // 기본 오류 메시지
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      // 서버에서 오류 메시지가 있으면 그것을 사용
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
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

        {/* 테스트 계정 정보 */}
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