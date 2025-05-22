import React, { useEffect, useRef } from 'react';

const Calendar = ({ currentDate, entries, moodColors, moodEmojis }) => {
  // SVG 경로 생성을 위한 refs
  const calendarRef = useRef(null);
  const cellRefs = useRef([]);
  
  // 월의 첫 날과 마지막 날 구하기
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // 월의 첫 날의 요일 (0: 일요일, 1: 월요일, ...)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // 월의 일수
  const daysInMonth = lastDayOfMonth.getDate();
  
  // 요일 배열
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 달력 그리기를 위한 날짜 배열 생성
  const calendarDays = [];
  
  // 이전 달의 마지막 날짜들 (이번 달 첫 주에 표시될 이전 달의 날짜들)
  const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - firstDayOfWeek + i + 1),
      isCurrentMonth: false
    });
  }
  
  // 현재 달의 날짜들
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      isCurrentMonth: true
    });
  }
  
  // 다음 달의 처음 날짜들 (이번 달 마지막 주에 표시될 다음 달의 날짜들)
  const remainingDays = 42 - calendarDays.length; // 6주 x 7일 = 42일 (달력의 전체 칸 수)
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      isCurrentMonth: false
    });
  }
  
  // 특정 날짜에 해당하는 일기 찾기
  const getEntryForDate = (date) => {
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
    const dateDay = String(date.getDate()).padStart(2, '0');
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    return entries.find(entry => entry.date === dateString);
  };
  
  // 오늘 날짜 - 날짜를 문자열로 변환하여 비교 (YYYY-MM-DD 형식)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`; // YYYY-MM-DD 형식
  
  const isToday = (date) => {
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
    const dateDay = String(date.getDate()).padStart(2, '0');
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    return dateString === todayString;
  };
  
  // 구불구불한 경로 생성 함수
  function generateWavyPath(x, y, width, height, waviness = 5, segments = 4, seed = 0) {
    // 간단한 시드 랜덤 함수
    let randSeed = seed;
    const random = () => {
      const x = Math.sin(randSeed++) * 10000;
      return x - Math.floor(x); // 0 ~ 1 사이 값
    };
    const jitter = () => (random() * 2 - 1) * waviness;
  
    let path = `M ${x + jitter()} ${y + jitter()}`;
  
    const topSegmentWidth = width / segments;
    for (let i = 1; i <= segments; i++) {
      const cpX1 = x + topSegmentWidth * (i - 0.7) + jitter();
      const cpY1 = y + jitter() - waviness;
      const cpX2 = x + topSegmentWidth * (i - 0.3) + jitter();
      const cpY2 = y + jitter() + waviness;
      const endX = x + topSegmentWidth * i + jitter();
      const endY = y + jitter();
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX} ${endY}`;
    }
  
    const rightSegmentHeight = height / segments;
    for (let i = 1; i <= segments; i++) {
      const cpX1 = x + width + jitter() + waviness;
      const cpY1 = y + rightSegmentHeight * (i - 0.7) + jitter();
      const cpX2 = x + width + jitter() - waviness;
      const cpY2 = y + rightSegmentHeight * (i - 0.3) + jitter();
      const endX = x + width + jitter();
      const endY = y + rightSegmentHeight * i + jitter();
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX} ${endY}`;
    }
  
    const bottomSegmentWidth = width / segments;
    for (let i = 1; i <= segments; i++) {
      const cpX1 = x + width - bottomSegmentWidth * (i - 0.7) + jitter();
      const cpY1 = y + height + jitter() + waviness;
      const cpX2 = x + width - bottomSegmentWidth * (i - 0.3) + jitter();
      const cpY2 = y + height + jitter() - waviness;
      const endX = x + width - bottomSegmentWidth * i + jitter();
      const endY = y + height + jitter();
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX} ${endY}`;
    }
  
    const leftSegmentHeight = height / segments;
    for (let i = 1; i <= segments; i++) {
      const cpX1 = x + jitter() - waviness;
      const cpY1 = y + height - leftSegmentHeight * (i - 0.7) + jitter();
      const cpX2 = x + jitter() + waviness;
      const cpY2 = y + height - leftSegmentHeight * (i - 0.3) + jitter();
      const endX = x + jitter();
      const endY = y + height - leftSegmentHeight * i + jitter();
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX} ${endY}`;
    }
  
    path += ' Z';
    return path;
  }
  
  
  // 손으로 그린 듯한 SVG 경로 생성 및 추가
  useEffect(() => {
    if (calendarRef.current) {
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const mainSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mainSVG.setAttribute('width', '100%');
      mainSVG.setAttribute('height', '100%');
      mainSVG.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none;');
  
      // 📌 메인 테두리 경로 데이터 생성 (같은 시드로 두 개 생성)
      const mainPathSeed = 1234;
      const outerPath = generateWavyPath(6, 6, calendarRect.width-15, calendarRect.height-15, 8, 8, mainPathSeed);
      const innerPath = generateWavyPath(6, 6, calendarRect.width-15, calendarRect.height-15, 8, 8, mainPathSeed); // 같은 seed
  
      // 배경 패스
      const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      bgPath.setAttribute('d', outerPath);
      bgPath.setAttribute('stroke', '#a5b4fc');
      bgPath.setAttribute('stroke-width', '1');
      bgPath.setAttribute('fill', 'none');
      bgPath.setAttribute('stroke-dasharray', '3 2');
      mainSVG.appendChild(bgPath);
  
      // 메인 패스
      const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainPath.setAttribute('d', innerPath);
      mainPath.setAttribute('stroke', 'black');
      mainPath.setAttribute('stroke-width', '2');
      mainPath.setAttribute('fill', 'none');
      mainSVG.appendChild(mainPath);
  
      // 기존 SVG 제거 후 새로 추가
      const existingSVG = calendarRef.current.querySelector('.main-border');
      if (existingSVG) existingSVG.remove();
      mainSVG.classList.add('main-border');
      calendarRef.current.appendChild(mainSVG);
  
      // 셀 테두리 생성
      cellRefs.current.forEach((cell, index) => {
        if (cell) {
          const cellRect = cell.getBoundingClientRect();
          const cellSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          cellSVG.setAttribute('width', '100%');
          cellSVG.setAttribute('height', '100%');
          cellSVG.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none;');
  
          // 셀 테두리
          const cellPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          cellPath.setAttribute('d', generateWavyPath(1, 1, cellRect.width - 2, cellRect.height - 2, 2, 3, index)); // index로 시드 다르게
          cellPath.setAttribute('stroke', 'black');
          cellPath.setAttribute('stroke-width', '1');
          cellPath.setAttribute('fill', 'none');
          cellSVG.appendChild(cellPath);
  
          // 기존 SVG 제거 후 새로 추가
          const existingCellSVG = cell.querySelector('.cell-border');
          if (existingCellSVG) existingCellSVG.remove();
          cellSVG.classList.add('cell-border');
          cell.appendChild(cellSVG);
  
          // 오늘 날짜에 특별한 테두리 추가
          if (cell.classList.contains('today-cell')) {
            const todayCellPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            todayCellPath.setAttribute('d', generateWavyPath(1, 1, cellRect.width-2, cellRect.height-2, 2, 3, index));
            todayCellPath.setAttribute('stroke', '#818cf8');
            todayCellPath.setAttribute('stroke-width', '2');
            todayCellPath.setAttribute('fill', 'none');
            cellSVG.appendChild(todayCellPath);
          }
        }
      });
    }
  }, [currentDate, entries]);
   // 달력이나 일기가 변경될 때마다 경로 다시 생성
  
  return (
    <div className="bg-white rounded-lg p-6 relative" ref={calendarRef}>
      <div className="grid grid-cols-7 gap-1">
        {/* 요일 헤더 */}
        {daysOfWeek.map((day, index) => (
          <div 
            key={`header-${index}`}
            className={`text-center font-medium p-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
        
        {/* 달력 날짜 */}
        {calendarDays.map((dayObj, index) => {
          const { date, isCurrentMonth } = dayObj;
          const entry = getEntryForDate(date);
          const isDateToday = isToday(date);
          
          // 약간의 랜덤한 회전 각도 (더 적은 범위로 설정)
          const randomRotation = (Math.random() * 0.4 - 0.2).toFixed(2);
          
          // 일요일 여부 확인 (dayOfWeek가 0이면 일요일)
          const isSunday = date.getDay() === 0;
          
          // 일요일일 경우 배경색 설정
          const bgColor = isSunday ? 'bg-red-100' : (!isCurrentMonth ? 'bg-gray-50' : 'bg-white');
          
          return (
            <div 
              key={`day-${index}`}
              ref={el => cellRefs.current[index] = el}
              className={`
                relative min-h-24 p-2 transition-colors
                ${bgColor} 
                ${isDateToday ? 'today-cell' : ''}
                ${entry && !isSunday ? moodColors[entry.mood] : ''}
              `}
              style={{ transform: `rotate(${randomRotation}deg)` }}
            >
              <div className="flex justify-between items-start">
                <span className={`font-medium ${isDateToday ? 'text-indigo-700' : (isSunday ? 'text-red-500' : '')}`}>
                  {date.getDate()}
                </span>
                {entry && (
                  <span className="text-lg" title={entry.mood}>
                    {moodEmojis[entry.mood]}
                  </span>
                )}
              </div>
              
              {/* 일기 내용 미리보기 */}
              {entry && (
                <div className="mt-1">
                  <div className="text-xs font-medium truncate">
                    {entry.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {entry.content.length > 20 
                      ? `${entry.content.substring(0, 20)}...` 
                      : entry.content
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 스타일 추가 */}
      <style jsx="true">{`
        .today-cell {
          box-shadow: inset 0 0 5px rgba(129, 140, 248, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Calendar;