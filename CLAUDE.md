# 서울페이+ 광역 발행일 알림 사이트

## 프로젝트 개요
서울사랑상품권(서울페이+) 광역 발행일 카운트다운 및 알림 웹사이트.
다음 발행일까지 실시간 카운트다운, 캘린더 뷰, 매진 현황, 브라우저 알림 제공.

## 기술 스택
- **백엔드**: Node.js + Express 5
- **프론트엔드**: 정적 HTML/CSS/JS (public/ 디렉토리)
- **크롤링**: cheerio + node-fetch (서울시 공지사항 30분 간격 자동 스크래핑)

## 프로젝트 구조
```
server.js          # Express 서버, 크롤링 로직, API 엔드포인트
public/
  index.html       # 메인 페이지
  style.css        # 스타일
  app.js           # 프론트엔드 JS (카운트다운, 캘린더, 알림)
package.json
```

## 실행 방법
```bash
npm install
npm start          # http://localhost:3000
```

## 주요 기능
- 다음 발행일까지 실시간 카운트다운 타이머
- 월별 캘린더 뷰 (발행일 표시)
- 서울시 공지사항 자동 크롤링 (30분 간격)
- 발행/매진 현황 표시
- 브라우저 푸시 알림
- 모바일 반응형 레이아웃
- 2026년 실제 데이터 반영 (5% 할인율, 월 30만원 한도)

## Git 브랜치
- 개발 브랜치: `claude/seoul-pay-notification-site-Pr7W5`

## 커밋 히스토리
1. `c3eceb3` feat: 초기 구현
2. `3fd58ee` feat: 매진 여부 확인 기능 추가
3. `b8f0c03` feat: 서버 기반 자동 크롤링으로 전환, 실제 데이터 반영
4. `cc8e12c` fix: 스크래핑 타임아웃 처리 수정 (AbortController 사용)

## 참고사항
- 크롤링 대상: 서울시 공지사항 페이지 (서울사랑상품권 관련)
- AbortController로 타임아웃 처리 (크롤링 실패 시 기본 데이터 사용)
