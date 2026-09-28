/* =====================================================================
   스크롤 애니메이션 (Intersection Observer)
   이벤트: 요소가 화면에 threshold 비율 이상 들어옴
   상태:   요소마다 "이미 나타났는가" — .reveal--pending 클래스가 붙어 있으면 아직
   렌더링: .reveal--pending 을 떼면 CSS transition 으로 나타난다
   ===================================================================== */

const REVEAL_THRESHOLD = 0.2; // 요소의 20% 가 보이면 나타난다 (README 명시)

const revealTargets = document.querySelectorAll('.reveal');

// 관찰할 수 없거나 움직임을 줄이고 싶은 환경이면 숨기지 않는다 → 내용은 처음부터 보인다
if ('IntersectionObserver' in window && !prefersReducedMotion()) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.remove('reveal--pending');
      observer.unobserve(target); // 한 번 나타난 요소는 더 지켜볼 필요가 없다
    });
  }, { threshold: REVEAL_THRESHOLD });

  revealTargets.forEach((element) => {
    element.classList.add('reveal--pending');
    revealObserver.observe(element);
  });
}
