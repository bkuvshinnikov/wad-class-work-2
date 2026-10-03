const form = document.querySelector('#mars-application');
const responseBox = document.querySelector('#form-response');
const risk = document.querySelector('#risk');
const riskValue = document.querySelector('#risk-value');
const nameInput = document.querySelector('#full-name');
const specialty = document.querySelector('#specialty');
const colorInput = document.querySelector('#suit-color');
const motivation = document.querySelector('#why-mars');
const portrait = document.querySelector('#portrait');
const dependents = document.querySelector('#crew-size');
const previewName = document.querySelector('#preview-name');
const previewAvatar = document.querySelector('#preview-avatar');
const previewDetail = document.querySelector('#preview-detail');
const previewSwatch = document.querySelector('#preview-swatch');
const progressBar = document.querySelector('#progress-bar');
const progressText = document.querySelector('#progress-text');
const characterCount = document.querySelector('#character-count');
const slides = [...document.querySelectorAll('.brochure-slide')];
const dots = [...document.querySelectorAll('.carousel-dot')];
const slideCount = document.querySelector('#slide-count');
const video = document.querySelector('#log-video');
const videoPlaceholder = document.querySelector('#video-placeholder');
const cameraButton = document.querySelector('#camera-button');
const recordButton = document.querySelector('#record-button');
const downloadLog = document.querySelector('#download-log');
const recordingStatus = document.querySelector('#recording-status');
let currentSlide = 0;
let cameraStream = null;
let mediaRecorder = null;
let recordingChunks = [];
let recordingUrl = null;

function stopCamera() {
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  video.srcObject = null;
  videoPlaceholder.hidden = false;
  videoPlaceholder.style.display = '';
  cameraButton.textContent = 'TURN ON CAMERA ◉';
  recordButton.disabled = true;
  recordButton.textContent = '●  RECORD LOG';
  recordButton.classList.remove('is-recording');
  recordingStatus.textContent = 'STANDBY';
  document.querySelector('.video-hud').classList.remove('recording');
}

function showSlide(index) {
  const nextIndex = (index + slides.length) % slides.length;
  if (currentSlide !== nextIndex && cameraStream) stopCamera();
  currentSlide = nextIndex;
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.hidden = !active;
    slide.classList.toggle('active', active);
  });
  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === currentSlide;
    dot.classList.toggle('selected', active);
    dot.setAttribute('aria-selected', String(active));
  });
  slideCount.innerHTML = `0${currentSlide + 1} <i>/</i> 0${slides.length}`;
}

document.querySelector('#previous-slide').addEventListener('click', () => showSlide(currentSlide - 1));
document.querySelector('#next-slide').addEventListener('click', () => showSlide(currentSlide + 1));
dots.forEach((dot) => dot.addEventListener('click', () => showSlide(Number(dot.dataset.go))));

cameraButton.addEventListener('click', async () => {
  if (cameraStream) {
    stopCamera();
    return;
  }
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access needs a secure page, like localhost or HTTPS.');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (currentSlide !== 2) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    cameraStream = stream;
    video.srcObject = cameraStream;
    video.muted = true;
    videoPlaceholder.hidden = true;
    videoPlaceholder.style.display = 'none';
    await video.play();
    cameraButton.textContent = 'TURN OFF CAMERA ×';
    recordButton.disabled = !window.MediaRecorder;
    recordingStatus.textContent = 'CAMERA READY';
  } catch (error) {
    recordingStatus.textContent = 'CAMERA UNAVAILABLE';
    videoPlaceholder.hidden = false;
    videoPlaceholder.style.display = '';
    videoPlaceholder.querySelector('small').textContent = error.name === 'NotAllowedError'
      ? 'Camera or microphone access was blocked. Your secret potato diary is safe.'
      : error.message;
    cameraStream?.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    video.srcObject = null;
  }
});

recordButton.addEventListener('click', () => {
  if (!cameraStream) return;
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
    recordButton.textContent = '●  RECORD AGAIN';
    recordButton.classList.remove('is-recording');
    recordingStatus.textContent = 'LOG SAVED';
    document.querySelector('.video-hud').classList.remove('recording');
    return;
  }
  recordingChunks = [];
  mediaRecorder = new MediaRecorder(cameraStream);
  mediaRecorder.addEventListener('dataavailable', (event) => {
    if (event.data.size) recordingChunks.push(event.data);
  });
  mediaRecorder.addEventListener('stop', () => {
    if (!recordingChunks.length) return;
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    recordingUrl = URL.createObjectURL(new Blob(recordingChunks, { type: mediaRecorder.mimeType || 'video/webm' }));
    downloadLog.href = recordingUrl;
    downloadLog.hidden = false;
  });
  mediaRecorder.start();
  recordButton.textContent = '■  STOP RECORDING';
  recordButton.classList.add('is-recording');
  recordingStatus.textContent = 'RECORDING';
  document.querySelector('.video-hud').classList.add('recording');
});

document.querySelector('#log-script').addEventListener('input', (event) => {
  const opening = event.target.value.trim();
  videoPlaceholder.querySelector('small').textContent = opening || 'Camera on when you’re ready, Commander.';
});

const potatoHouse = document.querySelector('#potato-greenhouse');
const waterButton = document.querySelector('#water-potato');
const potatoStatus = document.querySelector('#potato-status');
const waterCountLabel = document.querySelector('#water-count');
const waterProgress = document.querySelector('#water-progress');
const harvestCountLabel = document.querySelector('#harvest-count');
let waterCount = 0;
let harvestCount = 0;

const weatherCard = document.querySelector('.weather-card');
const weatherDate = document.querySelector('#weather-date');
const weatherRefresh = document.querySelector('#weather-refresh');

async function loadMarsWeather() {
  weatherCard.classList.add('is-loading');
  weatherCard.classList.remove('is-error');
  weatherRefresh.disabled = true;
  weatherDate.textContent = 'Checking the old weather station…';
  try {
    const response = await fetch('https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0', { cache: 'no-store' });
    if (!response.ok) throw new Error(`NASA API returned ${response.status}`);
    const data = await response.json();
    const sol = data.sol_keys?.at(-1);
    const observation = sol && data[sol];
    if (!observation?.AT || !observation?.HWS || !observation?.PRE || !observation?.Last_UTC) {
      throw new Error('No complete weather readings are available.');
    }
    document.querySelector('#mars-temp').innerHTML = `${observation.AT.av.toFixed(1)}<small> °C</small>`;
    document.querySelector('#mars-wind').innerHTML = `${observation.HWS.av.toFixed(1)}<small> m/s</small>`;
    document.querySelector('#mars-pressure').innerHTML = `${Math.round(observation.PRE.av)}<small> Pa</small>`;
    const date = new Date(observation.Last_UTC);
    weatherDate.textContent = `Last observation: ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date)}`;
    document.querySelector('#weather-sol').textContent = `SOL ${sol}`;
  } catch (error) {
    weatherCard.classList.add('is-error');
    weatherDate.textContent = 'Could not reach the archive. Give NASA a moment and try again.';
  } finally {
    weatherCard.classList.remove('is-loading');
    weatherRefresh.disabled = false;
  }
}

weatherRefresh.addEventListener('click', loadMarsWeather);
loadMarsWeather();

waterButton.addEventListener('click', () => {
  if (waterCount >= 3) return;
  waterCount += 1;
  waterCountLabel.textContent = `${waterCount} / 3`;
  waterProgress.style.width = `${waterCount / 3 * 100}%`;
  potatoHouse.classList.remove('growth-1', 'growth-2', 'ripe');

  if (waterCount === 1) {
    potatoHouse.classList.add('growth-1');
    potatoStatus.textContent = 'A TINY SPROUT! PROMISING.';
  } else if (waterCount === 2) {
    potatoHouse.classList.add('growth-2');
    potatoStatus.textContent = 'GETTING BIG. STAY HUMBLE.';
  } else {
    potatoHouse.classList.add('ripe');
    potatoStatus.textContent = 'RIPE! THE FARMER DID IT.';
    harvestCount += 1;
    harvestCountLabel.textContent = `HARVESTS: ${harvestCount} · THIS IS AGRICULTURE NOW`;
    waterButton.disabled = true;
    waterButton.innerHTML = 'HARVESTED! RESETTING… <span>🥔</span>';
    window.setTimeout(() => {
      waterCount = 0;
      waterCountLabel.textContent = '0 / 3';
      waterProgress.style.width = '0%';
      potatoHouse.classList.remove('growth-1', 'growth-2', 'ripe');
      potatoStatus.textContent = 'THIRSTY LITTLE SPUD';
      waterButton.disabled = false;
      waterButton.innerHTML = 'WATER THE POTATO <span>💧</span>';
    }, 1100);
  }
});

function updateReadiness() {
  riskValue.textContent = `${risk.value} / 10`;
  const score = Number(risk.value);
  const mood = score < 4 ? 'Still negotiating with Earth.' : score < 8 ? 'Brave, with sensible questions.' : 'Already mentally on the spaceship.';
  const discipline = specialty.value || 'Specialty pending';
  const extra = Number(dependents.value) > 0 ? ` · ${dependents.value} tiny co-pilot(s)` : '';
  const photo = portrait.files.length ? ' · photo acquired' : '';
  previewDetail.textContent = `${discipline} · ${mood}${extra}${photo}`;
}

function updatePreview() {
  const name = nameInput.value.trim();
  previewName.textContent = name || 'Future Mars Resident';
  previewAvatar.textContent = name ? name.charAt(0).toUpperCase() : '?';
  previewAvatar.style.backgroundColor = `${colorInput.value}33`;
  previewAvatar.style.borderColor = colorInput.value;
  previewAvatar.style.color = colorInput.value;
  previewSwatch.style.backgroundColor = colorInput.value;
  updateReadiness();
}

function updateProgress() {
  const required = [...form.querySelectorAll('[required]')];
  const groups = new Map();
  for (const field of required) {
    const key = field.type === 'radio' ? `radio:${field.name}` : field.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(field);
  }
  const complete = [...groups.values()].filter((fields) => fields[0].type === 'radio'
    ? fields.some((field) => field.checked)
    : fields[0].type === 'checkbox' ? fields[0].checked : fields[0].value.trim() !== '').length;
  const percent = Math.round(complete / groups.size * 100);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${percent}% COMPLETE`;
}

form.addEventListener('input', (event) => {
  if (event.target === motivation) characterCount.textContent = `${motivation.value.length} / 280`;
  updateProgress();
  updatePreview();
});
form.addEventListener('change', () => { updateProgress(); updatePreview(); });
document.querySelector('#referral').addEventListener('input', updateProgress);
updateProgress();
updatePreview();

form.addEventListener('submit', (event) => {
  // Keep the form's native GET and POST button attributes intact while making
  // the fictional beacon endpoint work as an in-page interaction for the lab.
  event.preventDefault();
  const submitter = event.submitter;
  const data = new FormData(form);
  const name = data.get('fullName')?.trim() || 'future Martian';
  responseBox.hidden = false;
  responseBox.textContent = submitter?.value === 'beacon'
    ? `MAYDAY BEACON SENT, ${name.toUpperCase()}. Earth has received your dramatic flare. Please remain calm and avoid eating the emergency potatoes.`
    : `APPLICATION RECEIVED, ${name.toUpperCase()}. You're one step closer to Mars, a new life, and becoming the most interesting person at every reunion.`;
  responseBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
