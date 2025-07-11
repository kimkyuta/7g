// -------------------------------
// 나눔의 교회 7초 게임 JS 코드
// -------------------------------

// 타이머 관련 변수
let timer = 0; // 현재 시간(초)
let interval = null; // setInterval을 저장할 변수
let running = false; // 타이머가 동작 중인지 여부
let history = []; // 시도 기록을 저장하는 배열

// DOM 요소 가져오기
const timerEl = document.getElementById('timer'); // 전자시계 숫자
const btn = document.getElementById('startStopBtn'); // 시작/멈추기 버튼
const resultBox = document.getElementById('result-box'); // 결과 박스
const historyBox = document.getElementById('history'); // 기록 리스트
const confettiCanvas = document.getElementById('confetti-canvas'); // 폭죽/꽃가루 캔버스

// 버튼 색상 클래스 관리
function updateButton() {
  if (!running) {
    btn.textContent = '시작';
    btn.classList.remove('stop');
    btn.classList.add('start');
  } else {
    btn.textContent = '멈추기';
    btn.classList.remove('start');
    btn.classList.add('stop');
  }
}

// 타이머를 0.01초 단위로 업데이트하는 함수
function startTimer() {
  timer = 0;
  timerEl.textContent = '0.00';
  interval = setInterval(() => {
    timer += 0.01;
    timerEl.textContent = timer.toFixed(2);
  }, 10); // 10ms마다 실행(0.01초)
}

// 타이머를 멈추는 함수
function stopTimer() {
  clearInterval(interval);
}

// 등수 판정 함수 (초 단위)
function getRank(time) {
  const diff = Math.abs(time - 7.00);
  if (diff < 0.005) return 1; // 7.00초 정확히
  if (diff <= 0.05) return 2; // 0.05초 이내
  if (diff <= 0.2) return 3; // 0.2초 이내
  if (diff <= 0.5) return 4; // 0.5초 이내
  if (diff <= 1.0) return 5; // 1초 이내
  return 0; // 나머지(꽝)
}

// 등수별 메시지 함수
function getRankMessage(rank) {
  if (rank === 1) return '정확히 7초! 1등! 잘했어요!';
  if (rank === 2) return '2등! 0.05초 이내! 잘했어요!';
  if (rank === 3) return '3등! 0.2초 이내! 잘했어요!';
  if (rank === 4) return '4등! 0.5초 이내! 잘했어요!';
  if (rank === 5) return '5등! 1초 이내! 잘했어요!';
  return '꽝!!! 다음 기회에!';
}

// 등수별 텍스트 함수
function getRankText(rank) {
  if (rank === 1) return '1등';
  if (rank === 2) return '2등';
  if (rank === 3) return '3등';
  if (rank === 4) return '4등';
  if (rank === 5) return '5등';
  return '꽝';
}

// 결과 박스를 화면에 3초간 크게 띄우는 함수
function showResultBox(rank, time) {
  // 등수, 기록, 메시지를 순서대로 크게 보여줍니다
  resultBox.innerHTML = `
    <div style="font-size:2.5rem; margin-bottom:12px;">${getRankText(rank)}</div>
    <div style="font-size:2.2rem; margin-bottom:12px;">${time.toFixed(2)}초</div>
    <div style="font-size:1.6rem;">${getRankMessage(rank)}</div>
  `;
  // 등수별로 박스 테두리 색상 강조
  resultBox.style.borderColor = rank >= 1 && rank <= 5 ? '#ffe066' : '#adb5bd';
  resultBox.style.display = 'flex';
  // 4등 이내면 폭죽/꽃가루 효과 실행
  if (rank >= 1 && rank <= 4) {
    launchConfetti();
  }
  // 3초 후 결과 박스 숨김, 기록은 남김
  setTimeout(() => {
    resultBox.style.display = 'none';
    drawHistory();
    clearConfetti();
  }, 3000);
}

// 기록 리스트를 그리는 함수
function drawHistory() {
  if (history.length === 0) {
    historyBox.innerHTML = '';
    return;
  }
  // 최근 기록 1개만 보여줍니다
  const last = history[history.length - 1];
  historyBox.innerHTML = `<div style="margin-top:16px; padding:16px; background:#f1f3f5; border-radius:16px; font-size:1.3rem; text-align:center;">
    <b>${getRankText(last.rank)}</b> - <b>${last.time.toFixed(2)}초</b> (${getRankMessage(last.rank)})
  </div>`;
}

// 버튼 클릭 이벤트 처리
btn.addEventListener('click', () => {
  if (!running) {
    // 타이머 시작
    running = true;
    updateButton();
    startTimer();
    resultBox.style.display = 'none'; // 결과 박스 숨김
  } else {
    // 타이머 멈춤
    running = false;
    updateButton();
    stopTimer();
    // 등수 판정
    const rank = getRank(timer);
    // 기록 저장
    history.push({ rank, time: timer });
    // 결과 박스 띄우기
    showResultBox(rank, timer);
    // 타이머 리셋
    timer = 0;
    timerEl.textContent = '0.00';
  }
});

// 처음 버튼 상태 설정
updateButton();

// -------------------------------
// 폭죽/꽃가루 효과 구현 (간단 버전)
// -------------------------------
const ctx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiTimer = null;

// 창 크기에 맞게 캔버스 크기 조정
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 파스텔톤 색상 배열
const pastelColors = [
  '#ffe066', '#fab1a0', '#a5d8ff', '#b2f2bb', '#e7c6ff', '#ffd6e0', '#fff9db', '#d0ebff', '#f3d9fa'
];

// 폭죽/꽃가루 파티클 생성 함수
function createConfettiParticle() {
  // 위/아래에서 터지는 효과를 위해 방향 랜덤
  const fromBottom = Math.random() < 0.5;
  const x = Math.random() * confettiCanvas.width;
  const y = fromBottom ? confettiCanvas.height + 10 : -10;
  const angle = fromBottom ? -Math.PI / 2 + (Math.random() - 0.5) : Math.PI / 2 + (Math.random() - 0.5);
  const speed = 6 + Math.random() * 6; // 더 크게 팡팡
  const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  return {
    x, y,
    vx: speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
    color,
    size: 16 + Math.random() * 16,
    alpha: 1.0,
    gravity: 0.25 + Math.random() * 0.15
  };
}

// 폭죽/꽃가루 애니메이션 시작
function launchConfetti() {
  confettiParticles = [];
  // 80개 이상 크게 팡팡
  for (let i = 0; i < 80; i++) {
    confettiParticles.push(createConfettiParticle());
  }
  if (confettiTimer) clearInterval(confettiTimer);
  confettiTimer = setInterval(drawConfetti, 16);
}

// 폭죽/꽃가루 애니메이션 그리기
function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let p of confettiParticles) {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    ctx.fillStyle = p.color;
    ctx.fill();
    // 위치 업데이트
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.alpha -= 0.012;
  }
  // 살아있는 파티클만 남김
  confettiParticles = confettiParticles.filter(p => p.alpha > 0);
  if (confettiParticles.length === 0) {
    clearInterval(confettiTimer);
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// 폭죽/꽃가루 효과 종료
function clearConfetti() {
  if (confettiTimer) clearInterval(confettiTimer);
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles = [];
} 