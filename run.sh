#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 외부 라이브러리를 쓰지 않는 정적 사이트다. 빌드 단계가 없으므로 실행 = 정적 서버.
# Docker 는 쓰지 않는다.
PORT="${PORT:-8000}"

resolve_python() {
  [ -n "$PYTHON" ] && return
  for candidate in python3 python; do
    command -v "$candidate" &>/dev/null && { PYTHON="$candidate"; return; }
  done
  echo "python3 을 찾을 수 없습니다. PYTHON 환경변수로 지정하세요." >&2
  exit 1
}

cmd_run() {
  resolve_python
  if [ ! -f index.html ]; then
    echo "index.html 이 아직 없습니다. 먼저 페이지를 만들어야 합니다." >&2
    exit 1
  fi
  echo "http://localhost:$PORT 에서 확인하세요. (Ctrl-C 로 종료)"
  exec "$PYTHON" -m http.server "$PORT"
}

# 과제 §7 제약 사항은 전부 정적 검사로 잡을 수 있다.
# 실패를 모아서 한 번에 보고한다 — 첫 위반에서 멈추면 나머지를 못 본다.
cmd_test() {
  local failures=0
  local html_files css_files js_files
  html_files=$(find . -name '*.html' -not -path './.git/*' 2>/dev/null)
  css_files=$(find . -name '*.css' -not -path './.git/*' 2>/dev/null)
  js_files=$(find . -name '*.js' -not -path './.git/*' 2>/dev/null)

  if [ -z "$html_files$css_files$js_files" ]; then
    echo "검사 대상 파일이 없습니다 (아직 미착수)."
    return 0
  fi

  check() {  # check <설명> <대상파일목록> <grep 패턴>
    local label="$1" files="$2" pattern="$3"
    [ -z "$files" ] && return 0
    local hits
    hits=$(echo "$files" | xargs grep -nE "$pattern" 2>/dev/null || true)
    if [ -n "$hits" ]; then
      echo "FAIL  $label"
      echo "$hits" | sed 's/^/        /'
      failures=$((failures + 1))
    else
      echo "ok    $label"
    fi
  }

  check "var 미사용 (const/let 만)"        "$js_files"   '(^|[^[:alnum:]_])var[[:space:]]+'
  check "HTML onclick 미사용"              "$html_files" 'on(click|change|submit|input)='
  check "인라인 style 미사용"               "$html_files" 'style="'

  # alt 누락은 "패턴이 있으면 실패" 가 아니라 "패턴이 없으면 실패" 라서 check 로 안 된다.
  # grep -E 에 부정 룩어헤드가 없으므로 <img 줄만 뽑아 alt= 없는 것을 다시 건진다.
  if [ -n "$html_files" ]; then
    local noalt
    noalt=$(echo "$html_files" | xargs grep -nE '<img' 2>/dev/null | grep -v 'alt=' || true)
    if [ -n "$noalt" ]; then
      echo "FAIL  img 에 alt 속성 존재"
      echo "$noalt" | sed 's/^/        /'
      failures=$((failures + 1))
    else
      echo "ok    img 에 alt 속성 존재"
    fi
  fi

  echo
  if [ "$failures" -eq 0 ]; then
    echo "제약 사항 검사 통과"
  else
    echo "$failures 항목 위반"
    return 1
  fi
}

case "${1:-}" in
  run)  cmd_run ;;
  test) cmd_test ;;
  *)    echo "사용법: $0 {run|test}"; exit 1 ;;
esac
