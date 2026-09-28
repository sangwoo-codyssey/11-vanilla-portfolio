/* =====================================================================
   Contact 폼 — 입력 검증
   이벤트: input(입력할 때마다), focusout(칸을 벗어날 때), submit
   상태:   contactState.values(입력값), touched(한 번이라도 벗어난 칸), submitAttempted, submitted
   렌더링: 필드 옆 에러 문구·빨간 테두리·aria-invalid, 제출 성공 문구
   에러 목록은 상태에 저장하지 않는다. 입력값에서 매번 계산한다(validateContact) — 둘이 어긋날 일이 없다.
   ===================================================================== */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 골뱅이 앞뒤에 글자가 있고, 뒤쪽에 점이 하나 이상
const CONTACT_FIELDS = ['name', 'email', 'message'];

const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

const emptyContactValues = () => ({ name: '', email: '', message: '' });
const untouchedContactFields = () => ({ name: false, email: false, message: false });

const contactState = {
  values: emptyContactValues(),
  touched: untouchedContactFields(),
  submitAttempted: false,
  submitted: false,
};

// ---------- 검증 (상태 → 에러 목록) ----------

function validateEmail(email) {
  if (!email.trim()) return '이메일을 입력해 주세요.';
  if (!EMAIL_PATTERN.test(email.trim())) return '이메일 형식이 올바르지 않습니다. (예: name@example.com)';
  return '';
}

function validateContact({ name, email, message }) {
  return {
    name: name.trim() ? '' : '이름을 입력해 주세요.',
    email: validateEmail(email),
    message: message.trim() ? '' : '메시지를 입력해 주세요.',
  };
}

// ---------- 그리기 ----------

function renderContact() {
  const errors = validateContact(contactState.values);

  CONTACT_FIELDS.forEach((field) => {
    const input = contactForm.elements[field];
    const errorText = document.querySelector(`#contact-${field}-error`);
    // 아직 건드리지 않은 칸에는 처음부터 빨간 글씨를 띄우지 않는다
    const showError = contactState.touched[field] || contactState.submitAttempted;
    const message = showError ? errors[field] : '';

    errorText.textContent = message;
    input.classList.toggle('is-invalid', message !== '');
    input.setAttribute('aria-invalid', String(message !== ''));

    // 입력칸의 값도 상태를 따른다. 평소에는 같아서 건드리지 않고, 제출에 성공해 상태를 비웠을 때만 칸이 비워진다
    if (input.value !== contactState.values[field]) {
      input.value = contactState.values[field];
    }
  });

  contactStatus.textContent = contactState.submitted
    ? '메시지를 확인했습니다. 감사합니다! (시연용 폼이라 실제로 전송되지는 않습니다)'
    : '';
}

// ---------- 상태 바꾸기 ----------

function setContactValue(field, value) {
  contactState.values = { ...contactState.values, [field]: value };
  contactState.submitted = false; // 다시 입력하기 시작하면 성공 문구를 지운다
  renderContact();
}

function markContactTouched(field) {
  if (contactState.touched[field]) return;
  contactState.touched = { ...contactState.touched, [field]: true };
  renderContact();
}

function handleContactSubmit(event) {
  event.preventDefault(); // 페이지를 새로고침하며 어딘가로 보내는 폼의 기본 동작을 막는다

  const errors = validateContact(contactState.values);
  const firstInvalidField = CONTACT_FIELDS.find((field) => errors[field] !== '');

  if (firstInvalidField) {
    contactState.submitAttempted = true;
    renderContact();
    contactForm.elements[firstInvalidField].focus(); // 고칠 칸으로 바로 데려간다
    return;
  }

  contactState.values = emptyContactValues();
  contactState.touched = untouchedContactFields();
  contactState.submitAttempted = false;
  contactState.submitted = true;
  renderContact();
}

// ---------- 이벤트 ----------

// 칸마다 따로 걸지 않고 폼 하나에 건다. 어느 칸에서 일어났는지는 event.target 의 name 으로 안다
contactForm.addEventListener('input', (event) => {
  const { name, value } = event.target;
  if (CONTACT_FIELDS.includes(name)) setContactValue(name, value);
});

contactForm.addEventListener('focusout', (event) => {
  const { name } = event.target;
  if (CONTACT_FIELDS.includes(name)) markContactTouched(name);
});

contactForm.addEventListener('submit', handleContactSubmit);

renderContact();
