/* =====================================================================
   네비게이션 — 햄버거 메뉴 · 부드러운 스크롤 · 스크롤하면 배경 바꾸기
   이벤트: 햄버거 click, 섹션 링크 click, window scroll, Esc 키
   상태:   navState.menuOpen, navState.scrolled
   렌더링: 메뉴 .active, 헤더 .scrolled, 햄버거 aria-expanded(→ CSS 가 X 모양으로 바꾼다)
   ===================================================================== */

const NAV_SCROLL_THRESHOLD = 60; // px — 이만큼 내려가면 헤더에 배경이 생긴다 (README 명시)

const siteHeader = document.querySelector('.site-header');
const navMenu = document.querySelector('.nav__menu');
const navToggle = document.querySelector('.nav__toggle');
// 페이지 안의 섹션으로 가는 링크 전부 (본문 건너뛰기 링크는 브라우저 기본 동작이 포커스까지 옮겨 주므로 제외)
const sectionLinks = document.querySelectorAll('a[href^="#"]:not(.skip-link)');

const navState = {
  menuOpen: false,
  scrolled: false,
};

function renderNav() {
  navMenu.classList.toggle('active', navState.menuOpen);
  navToggle.setAttribute('aria-expanded', String(navState.menuOpen));
  navToggle.setAttribute('aria-label', navState.menuOpen ? '메뉴 닫기' : '메뉴 열기');
  siteHeader.classList.toggle('scrolled', navState.scrolled);
}

function setMenuOpen(menuOpen) {
  if (navState.menuOpen === menuOpen) return;
  navState.menuOpen = menuOpen;
  renderNav();
}

function setScrolled(scrolled) {
  // scroll 이벤트는 1초에 수십 번 온다. 값이 실제로 바뀔 때만 렌더링한다.
  if (navState.scrolled === scrolled) return;
  navState.scrolled = scrolled;
  renderNav();
}

function scrollToSection(event) {
  const target = document.querySelector(event.currentTarget.getAttribute('href'));
  if (!target) return;

  event.preventDefault(); // 브라우저의 "순간 이동" 대신 부드럽게 이동한다
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  setMenuOpen(false); // 모바일에서 메뉴를 눌렀으면 닫는다
}

navToggle.addEventListener('click', () => setMenuOpen(!navState.menuOpen));

sectionLinks.forEach((link) => link.addEventListener('click', scrollToSection));

window.addEventListener('scroll', () => setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD), { passive: true });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

// 새로고침했을 때 이미 중간까지 내려와 있을 수 있으므로 현재 위치로 시작한다
navState.scrolled = window.scrollY > NAV_SCROLL_THRESHOLD;
renderNav();
