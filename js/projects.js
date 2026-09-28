/* =====================================================================
   Projects — GitHub API 로 저장소 목록을 가져와 카드로 그린다
   이벤트: 페이지 진입(자동 호출), 에러 상태의 "다시 시도" click
   상태:   projectsState.status ('loading' | 'success' | 'error' | 'empty'), repos, errorMessage
   렌더링: status 에 맞는 화면으로 Projects 영역을 통째로 다시 그린다
   ===================================================================== */

const GITHUB_USERNAME = 'sangwoo-codyssey';
const REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

const projectsView = document.querySelector('#projects-view');

let projectsState = {
  status: 'loading',
  repos: [],
  errorMessage: '',
};

// 상태는 고치지 않고 새 객체로 바꾼다 — 바뀐 값만 넘기면 나머지는 그대로 이어받는다
function setProjectsState(nextState) {
  projectsState = { ...projectsState, ...nextState };
  renderProjects();
}

// ---------- 데이터 가져오기 ----------

async function loadProjects() {
  setProjectsState({ status: 'loading', errorMessage: '' });

  try {
    const response = await fetch(REPOS_URL, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) {
      throw new Error(describeHttpError(response)); // fetch 는 404·403 에도 성공으로 끝나므로 직접 실패로 바꾼다
    }

    const data = await response.json();
    const repos = data
      .filter(({ fork }) => !fork) // 다른 사람 저장소를 복사(fork)해 온 것은 뺀다
      .map(toProject);

    setProjectsState({ status: repos.length > 0 ? 'success' : 'empty', repos });
  } catch (error) {
    setProjectsState({ status: 'error', errorMessage: toErrorMessage(error) });
  }
}

function describeHttpError({ status, headers }) {
  // 인증 없이 부르면 시간당 60회까지. 넘으면 403 과 함께 남은 횟수 0 이 온다
  if (status === 403 && headers.get('X-RateLimit-Remaining') === '0') {
    const resetAt = new Date(Number(headers.get('X-RateLimit-Reset')) * 1000);
    const resetTime = resetAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return `GitHub API 요청 한도(시간당 60회)를 넘었습니다. ${resetTime} 이후에 다시 시도해 주세요.`;
  }
  if (status === 404) {
    return `GitHub 에서 ${GITHUB_USERNAME} 사용자를 찾을 수 없습니다.`;
  }
  return `GitHub 가 오류로 응답했습니다. (HTTP ${status})`;
}

function toErrorMessage(error) {
  // 서버에 닿지도 못하면 fetch 가 TypeError 로 실패한다 (오프라인, 차단 등)
  if (error.name === 'TypeError') {
    return '네트워크에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.';
  }
  return error.message;
}

// API 응답에서 카드에 필요한 값만 꺼내 이름을 정리한다 (구조분해 할당 + 이름 바꾸기)
const toProject = ({
  name,
  description,
  html_url: url,
  language,
  stargazers_count: stars,
  updated_at: updatedAt,
}) => ({ name, description, url, language, stars, updatedAt });

// ---------- 그리기 ----------

const formatDate = (isoString) => new Date(isoString).toLocaleDateString('ko-KR');

// 저장소 이름·설명은 외부 데이터라 escapeHtml 을 거쳐 넣는다 (js/utils.js)
const projectCard = ({ name, description, url, language, stars, updatedAt }) => `
  <article class="card">
    <h3 class="card__title">
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>
    </h3>
    <p class="card__desc">${description ? escapeHtml(description) : '설명이 없습니다.'}</p>
    <ul class="card__meta">
      ${language ? `<li>${escapeHtml(language)}</li>` : ''}
      <li aria-label="스타 ${stars}개">★ ${stars}</li>
      <li><time datetime="${escapeHtml(updatedAt)}">${formatDate(updatedAt)} 업데이트</time></li>
    </ul>
  </article>`;

function renderProjects() {
  const { status, repos, errorMessage } = projectsState;
  projectsView.setAttribute('aria-busy', String(status === 'loading'));

  switch (status) {
    case 'loading':
      projectsView.innerHTML = `
        <div class="status status--loading">
          <span class="spinner" aria-hidden="true"></span>
          <p class="status__text">로딩 중...</p>
        </div>`;
      break;

    case 'error':
      projectsView.innerHTML = `
        <div class="status status--error">
          <p class="status__text">프로젝트를 불러올 수 없습니다.</p>
          <p class="status__detail">${escapeHtml(errorMessage)}</p>
          <button class="button" type="button" data-action="retry">다시 시도</button>
        </div>`;
      break;

    case 'empty':
      projectsView.innerHTML = `
        <div class="status status--empty">
          <p class="status__text">표시할 프로젝트가 없습니다.</p>
        </div>`;
      break;

    default: // 'success'
      projectsView.innerHTML = `
        <p class="projects__summary">공개 저장소 ${repos.length}개 · 최근 업데이트 순</p>
        <div class="projects__grid">${repos.map(projectCard).join('')}</div>`;
  }
}

// ---------- 이벤트 ----------

// "다시 시도" 버튼은 렌더링할 때마다 새로 만들어진다.
// 그래서 버튼이 아니라 늘 그 자리에 있는 부모(projectsView)에 한 번만 걸어 두고, 눌린 게 버튼인지 확인한다 (이벤트 위임)
projectsView.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="retry"]')) {
    loadProjects();
  }
});

// 시연용: 주소 끝에 ?state=loading | error | empty 를 붙이면 API 를 부르지 않고 그 상태를 그린다 (README 명시)
const DEMO_STATES = {
  loading: { status: 'loading' },
  error: { status: 'error', errorMessage: '시연용 에러 상태입니다(?state=error). "다시 시도"를 누르면 실제로 불러옵니다.' },
  empty: { status: 'empty', repos: [] },
};
const demoKey = new URLSearchParams(window.location.search).get('state');

if (Object.hasOwn(DEMO_STATES, demoKey)) {
  setProjectsState(DEMO_STATES[demoKey]);
} else {
  loadProjects();
}
