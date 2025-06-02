import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Update with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔍 API 요청 인터셉터:', {
      url: config.url,
      method: config.method,
      hasToken: !!token
    });
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 토큰 헤더 추가됨');
    } else {
      console.log('❌ 토큰이 없음');
    }
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API 응답 에러:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔓 인증 에러 감지, 토큰 제거');
      // 토큰이 만료되거나 유효하지 않은 경우
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      
      // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 페이지가 아닌 경우)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        console.log('🔄 로그인 페이지로 리다이렉트');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API for diary entries
export const diaryAPI = {
  // ✅ 백엔드 경로와 일치하도록 수정
  createEntry: (data) => api.post('/diaries/', {
    title: data.title,
    content: data.content,
    intensity: data.intensity || "medium"
  }),
  updateEntry: (id, data) => api.put(`/diaries/${id}/change`, {
    title: data.title,
    content: data.content,
    intensity: data.intensity || "medium"
  }),
  getAllEntries: () => api.get('/diaries/read'),
  getEntryById: (id) => api.get(`/diaries/${id}/read_Diary`),
  deleteEntry: (id) => api.delete(`/diaries/${id}/del`),
  
  // ✅ 감정 분석 함수 (백엔드에서 자동 처리되므로 간단한 키워드 기반 분석)
  analyzeEmotion: async (content) => {
    const emotionKeywords = {
      happy: ['기쁘', '좋', '행복', '즐거', '웃', '신나', '만족', '사랑'],
      sad: ['슬프', '우울', '힘들', '아프', '외로', '그리', '눈물', '속상'],
      angry: ['화나', '짜증', '분노', '열받', '빡', '싫', '미워', '답답'],
      excited: ['신나', '흥미', '재밌', '놀라', '두근', '기대', '설레'],
      relaxed: ['편안', '평온', '차분', '여유', '휴식', '쉬', '안정'],
      focused: ['집중', '몰입', '생각', '고민', '계획', '목표', '의지'],
      neutral: []
    };

    const lowerContent = content.toLowerCase();
    let maxCount = 0;
    let detectedEmotion = 'neutral';

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (emotion === 'neutral') continue;
      
      const count = keywords.reduce((acc, keyword) => {
        return acc + (lowerContent.includes(keyword) ? 1 : 0);
      }, 0);

      if (count > maxCount) {
        maxCount = count;
        detectedEmotion = emotion;
      }
    }

    return {
      data: {
        emotion: detectedEmotion
      }
    };
  }
};

// API for user management
export const userAPI = {
  register: (userData) => {
    console.log('회원가입 요청 데이터:', userData);
    return api.post('/user/', userData);
  },
  
  deleteUser: () => {
    console.log('🗑️ 계정 삭제 API 호출');
    return api.delete('/user/delete');
  },
  
  updateUser: (userData) => {
    console.log('💾 사용자 정보 업데이트 API 호출:', userData);
    return api.put('/user/update', userData);
  },
  
  getUserProfile: () => {
    console.log('👤 사용자 프로필 조회 API 호출');
    return api.get('/user/profile');
  },

  // ✅ 로그인 - OAuth2PasswordRequestForm 사용에 맞춰 FormData로 전송
  login: (credentials) => {
    console.log('로그인 요청 시작:', { email: credentials.email || credentials.username });
    
    const formData = new FormData();
    // OAuth2PasswordRequestForm은 username 필드를 요구하지만, 실제로는 이메일을 전송
    formData.append('username', credentials.email || credentials.username);
    formData.append('password', credentials.password);

    // FormData 내용 확인 (디버깅용)
    console.log('FormData 내용:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    return axios.post('http://localhost:8000/api/user/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then(response => {
      console.log('로그인 응답 성공:', response.data);
      return response;
    }).catch(error => {
      console.error('로그인 요청 실패:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
  },

  // 로그아웃 함수 추가
  logout: () => {
    console.log('🔓 로그아웃 처리');
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    return Promise.resolve();
  }
};

// API for calendar
export const calendarAPI = {
  getCalendar: (year, month) => api.get(`/calendar/?year=${year}&month=${month}`),
};

export default api;