/* =====================================================================
   스크롤 탑 버튼
   이벤트: window scroll, 버튼 click
   상태:   scrollTopState.visible
   렌더링: 버튼 .visible
   ===================================================================== */

const SCROLL_TOP_THRESHOLD = 300; // px — 이만큼 내려가면 버튼이 나타난다 (README 명시)

const scrollTopButton = document.querySelector('.scroll-top');

const scrollTopState = {
  visible: false,
};

function renderScrollTop() {
  scrollTopButton.classList.toggle('visible', scrollTopState.visible);
}

function setScrollTopVisible(visible) {
  if (scrollTopState.visible === visible) return;
  scrollTopState.visible = visible;
  renderScrollTop();
}

window.addEventListener('scroll', () => setScrollTopVisible(window.scrollY > SCROLL_TOP_THRESHOLD), { passive: true });

scrollTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
});

scrollTopState.visible = window.scrollY > SCROLL_TOP_THRESHOLD;
renderScrollTop();
