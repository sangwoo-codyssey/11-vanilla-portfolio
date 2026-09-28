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

  report() {  # report <설명> <위반 내용> — 위반 내용이 비어 있으면 통과
    local label="$1" hits="$2"
    if [ -n "$hits" ]; then
      echo "FAIL  $label"
      echo "$hits" | sed 's/^/        /'
      failures=$((failures + 1))
    else
      echo "ok    $label"
    fi
  }

  check() {  # check <설명> <대상파일목록> <grep 패턴> — 패턴이 나오면 위반
    local label="$1" files="$2" pattern="$3"
    [ -z "$files" ] && return 0
    report "$label" "$(echo "$files" | xargs grep -nE "$pattern" 2>/dev/null || true)"
  }

  echo "[코드 스타일 — 과제 §7]"
  check "var 미사용 (const/let 만)"        "$js_files"   '(^|[^[:alnum:]_])var[[:space:]]+'
  check "HTML onclick 미사용"              "$html_files" 'on(click|change|submit|input)='
  check "인라인 style 미사용"               "$html_files" 'style="'

  [ -f index.html ] || { report "index.html 존재" "index.html 이 없습니다"; echo; echo "$failures 항목 위반"; return 1; }

  # 아래는 "패턴이 없으면 실패" 인 검사라 check 로 안 된다. 해당 줄을 뽑은 뒤 조건에 안 맞는 것을 다시 건진다.
  echo
  echo "[HTML — 과제 §4]"
  # 페이지 마크업(index.html)만 본다 — tests/ 의 JS 문자열 속 '<img' 까지 태그로 보면 오탐이 난다
  report "img 에 alt 속성 존재" \
    "$(grep -nE '<img' index.html | grep -v 'alt=' || true)"
  report "script 는 defer 로 연결" \
    "$(grep -nE '<script[^>]*src=' index.html | grep -v 'defer' || true)"

  local missing=""
  for id in $(grep -oE 'for="[^"]+"' index.html | sed -E 's/for="([^"]+)"/\1/'); do
    grep -qE "id=\"$id\"" index.html || missing+="label for=\"$id\" 와 짝인 id 가 없음"$'\n'
  done
  report "label for 와 입력칸 id 가 짝을 이룸" "${missing%$'\n'}"

  missing=""
  for target in $(grep -oE 'class="nav__link" href="#[^"]+"' index.html | sed -E 's/.*href="#([^"]+)"/\1/'); do
    grep -qE "id=\"$target\"" index.html || missing+="네비 링크 #$target 이 가리키는 섹션이 없음"$'\n'
  done
  report "네비 앵커가 가리키는 섹션 id 존재" "${missing%$'\n'}"

  # article 은 Projects 카드라 JS 템플릿에서 만들어진다 — HTML 과 JS 를 함께 본다
  missing=""
  for tag in header nav main section article footer; do
    echo "$html_files"$'\n'"$js_files" | xargs grep -qE "<$tag[ >]" 2>/dev/null || missing+="<$tag> 를 쓰지 않음"$'\n'
  done
  report "시맨틱 태그 6종 사용" "${missing%$'\n'}"

  missing=""
  for section in hero about skills projects contact; do
    grep -qE "<section[^>]*id=\"$section\"" index.html || missing+="section#$section 없음"$'\n'
  done
  report "필수 섹션 존재 (Hero·About·Skills·Projects·Contact — Footer 는 시맨틱 태그 검사)" "${missing%$'\n'}"

  echo
  echo "[폴더 구조 — 과제 §4]"
  missing=""
  [ -f css/style.css ] || missing+="css/style.css 없음"$'\n'
  grep -qE 'href="css/style.css"' index.html || missing+="index.html 이 css/style.css 를 연결하지 않음"$'\n'
  ls js/*.js &>/dev/null || missing+="js/ 에 스크립트 없음"$'\n'
  [ -n "$(ls images 2>/dev/null)" ] || missing+="images/ 가 비어 있음"$'\n'
  report "index.html · css/style.css · js/ · images/ 분리" "${missing%$'\n'}"

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
