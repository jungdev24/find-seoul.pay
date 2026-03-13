/**
 * 서울페이+ 광역 발행일 알림 사이트
 *
 * 발행일 데이터는 아래 ISSUE_DATES에서 관리합니다.
 * 서울시 공지사항을 참고하여 매월 업데이트해주세요.
 * 형식: 'YYYY-MM-DD' (발행일 날짜)
 */

// ========================================
// 발행일 데이터 (수동 관리)
// 서울시 공지 기반으로 업데이트 필요
// ========================================
const ISSUE_DATES = [
  // 2026년 1월
  { date: '2026-01-15', round: '1월 1회차', time: '10:00' },
  { date: '2026-01-22', round: '1월 2회차', time: '10:00' },
  // 2026년 2월
  { date: '2026-02-12', round: '2월 1회차', time: '10:00' },
  { date: '2026-02-26', round: '2월 2회차', time: '10:00' },
  // 2026년 3월
  { date: '2026-03-13', round: '3월 1회차', time: '10:00' },
  { date: '2026-03-20', round: '3월 2회차', time: '10:00' },
  { date: '2026-03-27', round: '3월 3회차', time: '10:00' },
  // 2026년 4월
  { date: '2026-04-10', round: '4월 1회차', time: '10:00' },
  { date: '2026-04-17', round: '4월 2회차', time: '10:00' },
  { date: '2026-04-24', round: '4월 3회차', time: '10:00' },
  // 2026년 5월
  { date: '2026-05-14', round: '5월 1회차', time: '10:00' },
  { date: '2026-05-21', round: '5월 2회차', time: '10:00' },
  { date: '2026-05-28', round: '5월 3회차', time: '10:00' },
  // 2026년 6월
  { date: '2026-06-11', round: '6월 1회차', time: '10:00' },
  { date: '2026-06-18', round: '6월 2회차', time: '10:00' },
  { date: '2026-06-25', round: '6월 3회차', time: '10:00' },
  // 2026년 7월
  { date: '2026-07-09', round: '7월 1회차', time: '10:00' },
  { date: '2026-07-16', round: '7월 2회차', time: '10:00' },
  { date: '2026-07-23', round: '7월 3회차', time: '10:00' },
  // 2026년 8월
  { date: '2026-08-13', round: '8월 1회차', time: '10:00' },
  { date: '2026-08-20', round: '8월 2회차', time: '10:00' },
  { date: '2026-08-27', round: '8월 3회차', time: '10:00' },
  // 2026년 9월
  { date: '2026-09-10', round: '9월 1회차', time: '10:00' },
  { date: '2026-09-17', round: '9월 2회차', time: '10:00' },
  { date: '2026-09-24', round: '9월 3회차', time: '10:00' },
  // 2026년 10월
  { date: '2026-10-15', round: '10월 1회차', time: '10:00' },
  { date: '2026-10-22', round: '10월 2회차', time: '10:00' },
  // 2026년 11월
  { date: '2026-11-12', round: '11월 1회차', time: '10:00' },
  { date: '2026-11-19', round: '11월 2회차', time: '10:00' },
  { date: '2026-11-26', round: '11월 3회차', time: '10:00' },
  // 2026년 12월
  { date: '2026-12-10', round: '12월 1회차', time: '10:00' },
  { date: '2026-12-17', round: '12월 2회차', time: '10:00' },
];

// ========================================
// 앱 상태
// ========================================
let currentYear;
let currentMonthIndex;

// ========================================
// 유틸리티 함수
// ========================================
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

function getNextIssueDate() {
  const now = new Date();
  for (const item of ISSUE_DATES) {
    const issueDate = parseDate(item.date);
    const [h, m] = item.time.split(':').map(Number);
    issueDate.setHours(h, m, 0, 0);
    if (issueDate > now) {
      return { ...item, dateObj: issueDate };
    }
  }
  return null;
}

function getIssueDatesForMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return ISSUE_DATES.filter(d => d.date.startsWith(prefix));
}

// ========================================
// 카운트다운
// ========================================
function updateCountdown() {
  const next = getNextIssueDate();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const infoEl = document.getElementById('nextDateInfo');

  if (!next) {
    daysEl.textContent = '--';
    hoursEl.textContent = '--';
    minutesEl.textContent = '--';
    secondsEl.textContent = '--';
    infoEl.innerHTML = '예정된 발행일이 없습니다. 데이터를 업데이트해주세요.';
    return;
  }

  const now = new Date();
  const diff = next.dateObj - now;

  if (diff <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    infoEl.innerHTML = `<strong>지금 발행 중!</strong> ${next.round}`;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');

  const dateObj = parseDate(next.date);
  const monthDay = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[dateObj.getDay()];
  infoEl.innerHTML = `다음 발행: <strong>${monthDay} (${dayName}) ${next.time}</strong> — ${next.round}`;
}

// ========================================
// 캘린더
// ========================================
function renderCalendar(year, month) {
  const cal = document.getElementById('calendar');
  const monthLabel = document.getElementById('currentMonth');
  cal.innerHTML = '';

  monthLabel.textContent = `${year}년 ${month + 1}월`;

  const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
  dayHeaders.forEach((name, i) => {
    const el = document.createElement('div');
    el.className = 'cal-header' + (i === 0 ? ' sun' : '');
    el.textContent = name;
    cal.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const issueDates = getIssueDatesForMonth(year, month);

  // 빈 칸
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    cal.appendChild(el);
  }

  // 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const currentDate = new Date(year, month, d);
    const dayOfWeek = currentDate.getDay();

    let classes = ['cal-day'];

    if (dayOfWeek === 0) classes.push('sunday');

    if (isSameDay(currentDate, today)) {
      classes.push('today');
    }

    const issueMatch = issueDates.find(item => item.date === dateStr);
    if (issueMatch) {
      classes.push('issue-day');
      if (currentDate < today && !isSameDay(currentDate, today)) {
        classes.push('past');
      }
    }

    el.className = classes.join(' ');
    el.innerHTML = `${d}${issueMatch ? `<span class="issue-label">${issueMatch.round.split(' ')[1] || '발행'}</span>` : ''}`;

    if (issueMatch) {
      el.title = `${issueMatch.round} - ${issueMatch.time} 발행`;
    }

    cal.appendChild(el);
  }
}

// ========================================
// 알림 기능
// ========================================
function setupNotification() {
  const btn = document.getElementById('btnNotify');
  const status = document.getElementById('notifyStatus');

  if (!('Notification' in window)) {
    btn.textContent = '이 브라우저는 알림을 지원하지 않습니다';
    btn.disabled = true;
    btn.classList.add('denied');
    return;
  }

  function updateButton() {
    const perm = Notification.permission;
    if (perm === 'granted') {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        알림 설정 완료`;
      btn.classList.add('granted');
      status.textContent = '발행일 전날 알림을 보내드립니다.';
      scheduleNotifications();
    } else if (perm === 'denied') {
      btn.textContent = '알림이 차단되었습니다';
      btn.classList.add('denied');
      status.textContent = '브라우저 설정에서 알림을 허용해주세요.';
    }
  }

  updateButton();

  btn.addEventListener('click', async () => {
    if (Notification.permission === 'granted') return;
    const result = await Notification.requestPermission();
    updateButton();
    if (result === 'granted') {
      new Notification('서울페이+ 알림 설정 완료', {
        body: '발행일 알림을 받을 준비가 되었습니다!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">💳</text></svg>'
      });
    }
  });
}

function scheduleNotifications() {
  if (Notification.permission !== 'granted') return;

  const next = getNextIssueDate();
  if (!next) return;

  const notifyTime = new Date(next.dateObj);
  notifyTime.setDate(notifyTime.getDate() - 1);
  notifyTime.setHours(20, 0, 0, 0);

  const now = new Date();
  const delay = notifyTime - now;

  if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      new Notification('서울페이+ 발행일 알림', {
        body: `내일 ${next.time}에 ${next.round} 발행이 시작됩니다!`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🔔</text></svg>'
      });
    }, delay);
  }
}

// ========================================
// 초기화
// ========================================
function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonthIndex = today.getMonth();

  // 카운트다운 시작
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 캘린더 렌더링
  renderCalendar(currentYear, currentMonthIndex);

  // 월 이동 버튼
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonthIndex--;
    if (currentMonthIndex < 0) {
      currentMonthIndex = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonthIndex);
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonthIndex++;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonthIndex);
  });

  // 알림 설정
  setupNotification();
}

document.addEventListener('DOMContentLoaded', init);
