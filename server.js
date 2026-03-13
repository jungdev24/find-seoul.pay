const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// 정적 파일 서빙
// ========================================
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// 스크래핑 대상 URL 목록
// ========================================
const SCRAPE_SOURCES = [
  {
    name: '서울시 경제정책',
    url: 'https://news.seoul.go.kr/economy/archives/category/small-business-digital-economy-news_c1/seoul-love-giftcard_c1/sales-schedule',
    parser: parseSeoulNews,
  },
  {
    name: '서울사랑상품권 공지',
    url: 'https://www.seoulsarang.kr/front/board/notice/list.do',
    parser: parseSeoulsarang,
  },
];

// ========================================
// 캐시
// ========================================
let cachedData = {
  schedule: null,
  announcements: [],
  lastUpdated: null,
  errors: [],
};

// ========================================
// 스크래핑 함수들
// ========================================
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      return await res.text();
    }
    console.log(`  [${url}] HTTP ${res.status}`);
    return null;
  } catch (err) {
    clearTimeout(timer);
    const msg = err.name === 'AbortError' ? '타임아웃' : err.message;
    console.log(`  [${url}] ${msg}`);
    return null;
  }
}

function parseSeoulNews(html) {
  const $ = cheerio.load(html);
  const announcements = [];

  $('article, .entry, .post, li').each((_, el) => {
    const titleEl = $(el).find('a, h2, h3, .title');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href') || '';

    if (title && (title.includes('상품권') || title.includes('발행') || title.includes('서울페이'))) {
      announcements.push({
        title,
        link: link.startsWith('http') ? link : `https://news.seoul.go.kr${link}`,
        source: '서울시',
      });
    }
  });

  return announcements;
}

function parseSeoulsarang(html) {
  const $ = cheerio.load(html);
  const announcements = [];

  $('tr, li, .board-item').each((_, el) => {
    const titleEl = $(el).find('a, .title, td:nth-child(2)');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href') || '';

    if (title && title.length > 5) {
      announcements.push({
        title,
        link: link.startsWith('http') ? link : `https://www.seoulsarang.kr${link}`,
        source: '서울사랑상품권',
      });
    }
  });

  return announcements.slice(0, 10);
}

// 서울시 경제 뉴스 RSS 시도
async function fetchSeoulRSS() {
  const rssUrls = [
    'https://news.seoul.go.kr/economy/feed',
    'https://mediahub.seoul.go.kr/feed',
  ];

  const announcements = [];

  for (const url of rssUrls) {
    const html = await fetchWithTimeout(url);
    if (!html) continue;

    const $ = cheerio.load(html, { xmlMode: true });
    $('item').each((_, el) => {
      const title = $(el).find('title').text().trim();
      const link = $(el).find('link').text().trim();
      const pubDate = $(el).find('pubDate').text().trim();

      if (title.includes('상품권') || title.includes('서울페이') || title.includes('발행')) {
        announcements.push({
          title,
          link,
          source: '서울시 RSS',
          date: pubDate,
        });
      }
    });
  }

  return announcements;
}

// 통합 스크래핑
async function scrapeAll() {
  console.log(`[${new Date().toLocaleString('ko-KR')}] 스크래핑 시작...`);

  const results = {
    announcements: [],
    errors: [],
  };

  // RSS 피드 시도
  try {
    const rssResults = await fetchSeoulRSS();
    results.announcements.push(...rssResults);
    console.log(`  RSS: ${rssResults.length}건 발견`);
  } catch (err) {
    results.errors.push(`RSS: ${err.message}`);
  }

  // 각 소스 스크래핑
  for (const source of SCRAPE_SOURCES) {
    try {
      const html = await fetchWithTimeout(source.url);
      if (html) {
        const parsed = source.parser(html);
        results.announcements.push(...parsed);
        console.log(`  ${source.name}: ${parsed.length}건 발견`);
      } else {
        results.errors.push(`${source.name}: 접근 불가`);
        console.log(`  ${source.name}: 접근 불가`);
      }
    } catch (err) {
      results.errors.push(`${source.name}: ${err.message}`);
      console.log(`  ${source.name}: ${err.message}`);
    }
  }

  // 중복 제거
  const seen = new Set();
  results.announcements = results.announcements.filter(a => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });

  cachedData = {
    announcements: results.announcements,
    errors: results.errors,
    lastUpdated: new Date().toISOString(),
  };

  console.log(`  완료: ${results.announcements.length}건, 오류: ${results.errors.length}건`);
  return cachedData;
}

// ========================================
// API 라우트
// ========================================

// 최신 공지사항/스크래핑 결과
app.get('/api/announcements', (req, res) => {
  res.json(cachedData);
});

// 수동 새로고침
app.get('/api/refresh', async (req, res) => {
  try {
    const data = await scrapeAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 상태 확인
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    lastUpdated: cachedData.lastUpdated,
    announcementCount: cachedData.announcements.length,
    errorCount: cachedData.errors.length,
  });
});

// ========================================
// 서버 시작
// ========================================
app.listen(PORT, () => {
  console.log(`서울페이+ 알림 서버 실행 중: http://localhost:${PORT}`);

  // 시작시 즉시 스크래핑
  scrapeAll();

  // 30분마다 자동 스크래핑
  setInterval(scrapeAll, 30 * 60 * 1000);
});
