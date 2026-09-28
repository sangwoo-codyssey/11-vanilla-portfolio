/* =====================================================================
   여러 기능이 함께 쓰는 도우미 함수
   defer 로 불러오는 일반 스크립트는 파일끼리 전역 이름을 공유한다.
   그래서 이 파일을 가장 먼저 불러오고, 기능 파일의 이름에는 기능 접두어(themeState, navState …)를 붙인다.
   ===================================================================== */

// 운영체제에서 "동작 줄이기"를 켠 사용자에게는 부드러운 스크롤·애니메이션을 끈다.
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 외부 데이터(GitHub 저장소 설명 등)를 innerHTML 에 넣기 전에 HTML 특수문자를 바꾼다.
// 설명에 <img onerror=...> 같은 문자열이 들어 있어도 태그가 아니라 글자로 보이게 한다.
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
