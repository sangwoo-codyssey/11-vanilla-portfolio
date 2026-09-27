# 11 - 나를 소개하는 웹페이지 (Vanilla Portfolio)

> 🚧 **미착수** — 디렉터리·레포 준비만 완료

외부 라이브러리 없이 순수 HTML / CSS / JavaScript 로 만드는 반응형 포트폴리오 웹사이트.
목표는 UI 완성도가 아니라 **"사용자 이벤트 → 상태 변경 → DOM 업데이트"** 흐름을 손으로 익히는 것.

- 배포 URL: _(GitHub Pages, 미배포)_
- 과제 원문: 로컬 `../11-vanilla-portfolio.md`

## 사용 기술

| 영역 | 사용 |
|---|---|
| 마크업 | HTML5 시맨틱 태그 (`header`/`nav`/`main`/`section`/`article`/`footer`) |
| 스타일 | CSS 변수(`:root`), Flexbox(네비), Grid(`auto-fit`+`minmax`, 카드), 모바일 퍼스트 |
| 동작 | Vanilla JS (ES6+) — `querySelector`, `addEventListener`, `classList`, `fetch`+`async/await` |
| 상태 유지 | `localStorage` (다크 모드) |
| 외부 API | GitHub REST API (`/users/{id}/repos`) |
| 배포 | GitHub Pages |

**금지**: React / Vue / jQuery / Bootstrap / Tailwind, 인라인 `style="..."`, HTML `onclick`, `var`
**허용**: Font Awesome, Google Fonts

## 폴더 구조

```
.
├── index.html      # 메인 페이지 (Hero / About / Skills / Projects / Contact / Footer)
├── css/            # 외부 스타일시트 (style.css)
├── js/             # 스크립트 (defer 로 연결)
├── images/         # 프로필 등 이미지 (모두 의미있는 alt)
├── run.sh          # 로컬 서버 · 제약 사항 검사
└── README.md
```

## 실행

```bash
./run.sh run      # 로컬 정적 서버 (기본 8000번 포트) — VS Code Live Server 대체
./run.sh test     # 과제 제약 사항 정적 검사 (var / onclick / 인라인 스타일 / alt 누락)
```

`PORT` 로 포트를, `PYTHON` 으로 인터프리터를 바꿀 수 있다.

## 설정값 (과제가 README 명시를 요구하는 항목)

| 항목 | 값 | 비고 |
|---|---|---|
| 스크롤 탑 버튼 등장 기준 | _미정_ | 권장 300px |
| 네비게이션 배경 변경 기준 | _미정_ | 권장 60px |
| Intersection Observer threshold | _미정_ | 권장 0.2 이상 |
| 반응형 브레이크포인트 | 768px / 1024px | 태블릿 / 데스크톱 |

## 상태 → 렌더링 흐름 (3개 이상 필수)

| # | 이벤트 | 상태 변경 | 화면 변화 |
|---|---|---|---|
| 1 | 다크 모드 토글 클릭 | `theme` | `[data-theme]` 로 전체 색상 교체 + `localStorage` 저장 |
| 2 | 페이지 진입 → GitHub API 호출 | `loading` / `success` / `error` / `empty` | Projects 섹션 렌더링 분기 |
| 3 | Contact 폼 입력·제출 | 필드별 유효성 | 에러 메시지 표시/숨김, 성공 메시지 |

## 스크린샷

_(데스크톱 / 모바일 / 다크모드 — 미작성)_

## 제출물 체크리스트

- [ ] GitHub 저장소 URL
- [ ] 배포된 사이트 URL (GitHub Pages)
- [ ] 데스크톱 / 모바일 / 다크모드 스크린샷
- [ ] README (프로젝트 설명 · 사용 기술 · 배포 URL · 스크린샷)
