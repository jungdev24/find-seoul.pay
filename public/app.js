/**
 * 서울페이+ 광역 발행일 알림 사이트
 *
 * 발행일 데이터는 아래 ISSUE_DATES에서 기본 관리합니다.
 * 서버가 서울시 공지사항을 자동 크롤링하여 최신 정보를 가져옵니다.
 *
 * status 값:
 *   'scheduled' - 발행 예정
 *   'on_sale'   - 판매 중
 *   'sold_out'  - 매진
 */

// ========================================
// 발행일 데이터 (기본값, 서버 데이터로 보완)
// 실제 일정은 서울시 공지 기준이며,
// 아래는 확인된 일정 + 예상 일정입니다.
// ========================================
const ISSUE_DATES = [
  // 2026년 2월 (확인된 일정)
  { date: '2026-02-11', round: '2월 광역 1차', time: '10:00', status: 'sold_out',
    note: '1,000억원 규모, 홀짝 2부제 적용' },
  // 이후 일정은 서울시 공지 확인 필요 (아래는 예상)
  { date: '2026-05-13', round: '5월 광역 (예상)', time: '10:00', status: 'scheduled' },
  { date: '2026-08-12', round: '8월 광역 (예상)', time: '10:00', status: 'scheduled' },
  { date: '2026-11-11', round: '11월 광역 (예상)', time: '10:00', status: 'scheduled' },
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
// 서버 API 연동
// ========================================
async function fetchAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function refreshFromServer() {
  const btn = document.getElementById('btnRefresh');
  const statusEl = document.getElementById('refreshStatus');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '확인 중...';
  }

  try {
    const res = await fetch('/api/refresh');
    if (!res.ok) throw new Error('서버 응답 오류');
    const data = await res.json();

    renderAnnouncements(data);

    if (statusEl) {
      const time = new Date(data.lastUpdated).toLocaleTimeString('ko-KR');
      statusEl.textContent = `마지막 확인: ${time}`;
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = '서버 연결 실패 - 기본 데이터를 사용합니다';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '새로고침';
    }
  }
}

function renderAnnouncements(data) {
  const container = document.getElementById('announcementList');
  if (!container) return;

  if (!data || !data.announcements || data.announcements.length === 0) {
    const errorMsg = data?.errors?.length
      ? '서울시 공지 접근이 차단되어 자동 확인이 불가합니다.'
      : '새로운 공지사항이 없습니다.';

    container.innerHTML = `
      <div class="no-data">
        <p>${errorMsg}</p>
        <p class="fallback-links">
          직접 확인:
          <a href="https://news.seoul.go.kr/economy/archives/category/small-business-digital-economy-news_c1/seoul-love-giftcard_c1/sales-schedule" target="_blank" rel="noopener">서울시 경제정책</a> |
          <a href="https://www.seoulsarang.kr" target="_blank" rel="noopener">서울사랑상품권</a>
        </p>
      </div>`;
    return;
  }

  container.innerHTML = data.announcements.map(a => `
    <a href="${a.link}" target="_blank" rel="noopener" class="announcement-item">
      <span class="announcement-source">${a.source}</span>
      <span class="announcement-title">${a.title}</span>
      ${a.date ? `<span class="announcement-date">${new Date(a.date).toLocaleDateString('ko-KR')}</span>` : ''}
    </a>
  `).join('');
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
    infoEl.innerHTML = '확인된 발행 일정이 없습니다. 서울시 공지를 확인해주세요.';
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

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    cal.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const currentDate = new Date(year, month, d);
    const dayOfWeek = currentDate.getDay();

    let classes = ['cal-day'];
    if (dayOfWeek === 0) classes.push('sunday');
    if (isSameDay(currentDate, today)) classes.push('today');

    const issueMatch = issueDates.find(item => item.date === dateStr);
    if (issueMatch) {
      classes.push('issue-day');
      if (issueMatch.status === 'sold_out') {
        classes.push('sold-out');
      } else if (issueMatch.status === 'on_sale') {
        classes.push('on-sale');
      } else if (currentDate < today && !isSameDay(currentDate, today)) {
        classes.push('past');
      }
    }

    el.className = classes.join(' ');

    if (issueMatch) {
      let label = '발행';
      if (issueMatch.status === 'sold_out') label = '매진';
      else if (issueMatch.status === 'on_sale') label = '판매중';

      el.innerHTML = `${d}<span class="issue-label">${label}</span>`;

      const statusText = STATUS_MAP[issueMatch.status]?.text || '예정';
      el.title = `${issueMatch.round} - ${issueMatch.time} (${statusText})${issueMatch.note ? '\n' + issueMatch.note : ''}`;
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

  if (ISSUE_DATES.length === 0) {
    container.innerHTML = '<p class="no-data">등록된 일정이 없습니다.</p>';
    return;
  }

  container.innerHTML = ISSUE_DATES.map(item => {
    const d = parseDate(item.date);
    const now = new Date();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dateText = `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
    const isPast = d < now && !isSameDay(d, now);

    let statusHtml;
    if (item.status === 'sold_out') {
      statusHtml = '<span class="status-badge badge-sold-out">매진</span>';
    } else if (item.status === 'on_sale') {
      statusHtml = '<span class="status-badge badge-on-sale">판매 중</span>';
    } else {
      statusHtml = '<span class="status-badge badge-scheduled">발행 예정</span>';
    }

    return `
      <div class="status-row ${isPast ? 'past-row' : ''}">
        <div class="status-info">
          <span class="status-date">${dateText}</span>
          <span class="status-round">${item.round} ${item.time}</span>
          ${item.note ? `<span class="status-note">${item.note}</span>` : ''}
        </div>
        <div class="status-actions">
          ${statusHtml}
        </div>
      </div>
    `;
  }).join('');
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
        body: '발행일 알림을 받을 준비가 되었습니다!'
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
        body: `내일 ${next.time}에 ${next.round} 발행이 시작됩니다!`
      });
    }, delay);
  }
}

// ========================================
// 초기화
// ========================================
async function init() {
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

  // 새로고침 버튼
  const btnRefresh = document.getElementById('btnRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', refreshFromServer);
  }

  // 알림 설정
  setupNotification();

  // 서버에서 최신 공지사항 가져오기
  const data = await fetchAnnouncements();
  if (data) {
    renderAnnouncements(data);
    const statusEl = document.getElementById('refreshStatus');
    if (statusEl && data.lastUpdated) {
      const time = new Date(data.lastUpdated).toLocaleTimeString('ko-KR');
      statusEl.textContent = `마지막 확인: ${time}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
