/* =====================================================================
   다크 모드
   이벤트: 토글 버튼 click
   상태:   themeState.theme ('light' | 'dark') — localStorage 에 저장해 새로고침 후에도 유지
   렌더링: <html data-theme="…"> 를 바꾸면 CSS 변수가 통째로 바뀌어 전체 색이 전환된다
   ===================================================================== */

const THEME_STORAGE_KEY = 'portfolio-theme';

const themeToggle = document.querySelector('.theme-toggle');
const themeToggleLabel = document.querySelector('.theme-toggle__label');

const themeState = {
  theme: readSavedTheme(),
};

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    return 'light'; // 저장소가 막힌 브라우저(시크릿 모드 설정 등)에서도 페이지는 떠야 한다
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // 저장하지 못해도 이번 방문 동안은 전환이 동작한다
  }
}

function renderTheme() {
  const isDark = themeState.theme === 'dark';
  document.documentElement.dataset.theme = themeState.theme;
  // 버튼에는 "누르면 무엇이 되는지"를 보여준다
  themeToggleLabel.textContent = isDark ? '라이트 모드' : '다크 모드';
}

function setTheme(theme) {
  themeState.theme = theme;
  saveTheme(theme);
  renderTheme();
}

themeToggle.addEventListener('click', () => {
  setTheme(themeState.theme === 'dark' ? 'light' : 'dark');
});

renderTheme();
