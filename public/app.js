/**
 * 서울페이+ 광역 발행일 알림 사이트
 *
 * 발행일 데이터는 아래 ISSUE_DATES에서 관리합니다.
 * 서울시 공지사항을 참고하여 매월 업데이트해주세요.
 *
 * status 값:
 *   'scheduled' - 발행 예정
 *   'on_sale'   - 판매 중
 *   'sold_out'  - 매진
 */

// ========================================
// 발행일 데이터 (수동 관리)
// 서울시 공지 기반으로 업데이트 필요
// ========================================
const ISSUE_DATES = [
  // 2026년 1월
  { date: '2026-01-15', round: '1월 1회차', time: '10:00', status: 'sold_out' },
  { date: '2026-01-22', round: '1월 2회차', time: '10:00', status: 'sold_out' },
  // 2026년 2월
  { date: '2026-02-12', round: '2월 1회차', time: '10:00', status: 'sold_out' },
  { date: '2026-02-26', round: '2월 2회차', time: '10:00', status: 'sold_out' },
  // 2026년 3월
  { date: '2026-03-13', round: '3월 1회차', time: '10:00', status: 'on_sale' },
  { date: '2026-03-20', round: '3월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-03-27', round: '3월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 4월
  { date: '2026-04-10', round: '4월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-04-17', round: '4월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-04-24', round: '4월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 5월
  { date: '2026-05-14', round: '5월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-05-21', round: '5월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-05-28', round: '5월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 6월
  { date: '2026-06-11', round: '6월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-06-18', round: '6월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-06-25', round: '6월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 7월
  { date: '2026-07-09', round: '7월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-07-16', round: '7월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-07-23', round: '7월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 8월
  { date: '2026-08-13', round: '8월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-08-20', round: '8월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-08-27', round: '8월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 9월
  { date: '2026-09-10', round: '9월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-09-17', round: '9월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-09-24', round: '9월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 10월
  { date: '2026-10-15', round: '10월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-10-22', round: '10월 2회차', time: '10:00', status: 'scheduled' },
  // 2026년 11월
  { date: '2026-11-12', round: '11월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-11-19', round: '11월 2회차', time: '10:00', status: 'scheduled' },
  { date: '2026-11-26', round: '11월 3회차', time: '10:00', status: 'scheduled' },
  // 2026년 12월
  { date: '2026-12-10', round: '12월 1회차', time: '10:00', status: 'scheduled' },
  { date: '2026-12-17', round: '12월 2회차', time: '10:00', status: 'scheduled' },
];

// 상태 표시 텍스트/색상 매핑
const STATUS_MAP = {
  scheduled: { text: '발행 예정', badge: 'badge-scheduled' },
  on_sale:   { text: '판매 중',   badge: 'badge-on-sale' },
  sold_out:  { text: '매진',      badge: 'badge-sold-out' },
};

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
// 매진 제보 (localStorage 기반)
// ========================================
function getReports() {
  try {
    return JSON.parse(localStorage.getItem('soldOutReports') || '{}');
  } catch {
    return {};
  }
}

function saveReport(dateStr) {
  const reports = getReports();
  if (!reports[dateStr]) {
    reports[dateStr] = { count: 0, lastReported: null };
  }
  reports[dateStr].count++;
  reports[dateStr].lastReported = new Date().toISOString();
  localStorage.setItem('soldOutReports', JSON.stringify(reports));
}

function getReportCount(dateStr) {
  const reports = getReports();
  return reports[dateStr]?.count || 0;
}

function hasUserReported(dateStr) {
  try {
    const reported = JSON.parse(localStorage.getItem('userReported') || '[]');
    return reported.includes(dateStr);
  } catch {
    return false;
  }
}

function markUserReported(dateStr) {
  try {
    const reported = JSON.parse(localStorage.getItem('userReported') || '[]');
    if (!reported.includes(dateStr)) {
      reported.push(dateStr);
      localStorage.setItem('userReported', JSON.stringify(reported));
    }
  } catch {
    localStorage.setItem('userReported', JSON.stringify([dateStr]));
  }
}

// 실제 상태 결정 (데이터 status + 사용자 제보)
function getEffectiveStatus(item) {
  // 데이터에 명시된 상태가 sold_out이면 그대로
  if (item.status === 'sold_out') return 'sold_out';

  // 사용자 제보가 3건 이상이면 매진 가능성 표시
  const reportCount = getReportCount(item.date);
  if (reportCount >= 3) return 'reported_sold_out';

  return item.status;
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

  const statusInfo = STATUS_MAP[next.status] || STATUS_MAP.scheduled;
  const statusBadge = `<span class="status-badge ${statusInfo.badge}">${statusInfo.text}</span>`;

  if (diff <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    if (next.status === 'sold_out') {
      infoEl.innerHTML = `${statusBadge} ${next.round} — 이미 매진되었습니다`;
    } else {
      infoEl.innerHTML = `${statusBadge} <strong>지금 발행 중!</strong> ${next.round}`;
    }
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
  infoEl.innerHTML = `${statusBadge} 다음 발행: <strong>${monthDay} (${dayName}) ${next.time}</strong> — ${next.round}`;
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
      const effectiveStatus = getEffectiveStatus(issueMatch);
      classes.push('issue-day');

      if (effectiveStatus === 'sold_out') {
        classes.push('sold-out');
      } else if (effectiveStatus === 'reported_sold_out') {
        classes.push('reported-sold-out');
      } else if (effectiveStatus === 'on_sale') {
        classes.push('on-sale');
      } else if (currentDate < today && !isSameDay(currentDate, today)) {
        classes.push('past');
      }
    }

    el.className = classes.join(' ');

    if (issueMatch) {
      const effectiveStatus = getEffectiveStatus(issueMatch);
      let label = issueMatch.round.split(' ')[1] || '발행';
      if (effectiveStatus === 'sold_out') label = '매진';
      else if (effectiveStatus === 'reported_sold_out') label = '매진?';
      else if (effectiveStatus === 'on_sale') label = '판매중';

      el.innerHTML = `${d}<span class="issue-label">${label}</span>`;

      const statusText = STATUS_MAP[issueMatch.status]?.text || '예정';
      el.title = `${issueMatch.round} - ${issueMatch.time} 발행 (${statusText})`;
    } else {
      el.textContent = d;
    }

    cal.appendChild(el);
  }
}

// ========================================
// 판매 현황 목록
// ========================================
function renderStatusList() {
  const container = document.getElementById('statusList');
  if (!container) return;

  const now = new Date();
  const relevantDates = ISSUE_DATES.filter(item => {
    const d = parseDate(item.date);
    const diffDays = (d - now) / (1000 * 60 * 60 * 24);
    return diffDays >= -7 && diffDays <= 30;
  });

  if (relevantDates.length === 0) {
    container.innerHTML = '<p class="no-data">표시할 일정이 없습니다.</p>';
    return;
  }

  container.innerHTML = relevantDates.map(item => {
    const d = parseDate(item.date);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dateText = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
    const effectiveStatus = getEffectiveStatus(item);
    const reportCount = getReportCount(item.date);
    const alreadyReported = hasUserReported(item.date);
    const isPast = d < now && !isSameDay(d, now);

    let statusHtml;
    if (effectiveStatus === 'sold_out') {
      statusHtml = '<span class="status-badge badge-sold-out">매진</span>';
    } else if (effectiveStatus === 'reported_sold_out') {
      statusHtml = `<span class="status-badge badge-reported">매진 추정 (${reportCount}건 제보)</span>`;
    } else if (effectiveStatus === 'on_sale') {
      statusHtml = '<span class="status-badge badge-on-sale">판매 중</span>';
    } else {
      statusHtml = '<span class="status-badge badge-scheduled">발행 예정</span>';
    }

    const canReport = !isPast && item.status !== 'sold_out' && !alreadyReported;
    const reportBtn = canReport
      ? `<button class="btn-report" data-date="${item.date}" title="매진 제보하기">매진 제보</button>`
      : (alreadyReported && item.status !== 'sold_out' ? '<span class="reported-text">제보 완료</span>' : '');

    return `
      <div class="status-row ${isPast ? 'past-row' : ''}">
        <div class="status-info">
          <span class="status-date">${dateText}</span>
          <span class="status-round">${item.round} ${item.time}</span>
        </div>
        <div class="status-actions">
          ${statusHtml}
          ${reportBtn}
        </div>
      </div>
    `;
  }).join('');

  // 제보 버튼 이벤트
  container.querySelectorAll('.btn-report').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateStr = btn.dataset.date;
      saveReport(dateStr);
      markUserReported(dateStr);
      renderStatusList();
      renderCalendar(currentYear, currentMonthIndex);
    });
  });
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

  // 판매 현황 렌더링
  renderStatusList();

  // 알림 설정
  setupNotification();
}

document.addEventListener('DOMContentLoaded', init);
