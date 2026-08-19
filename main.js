const STORAGE_KEY = 'salon_appointments';

// ===== State =====
let appointments = loadAppointments();
let pendingDeleteId = null;
let uploadedPhotoURL = null;

// ===== Simulated AI Recommendations =====
const RECOMMENDATIONS = [
  {
    name: 'Haircut & Blowout',
    desc: 'A fresh trim and blow-dry style to refresh your look and add volume.',
  },
  {
    name: 'Hair Coloring',

    desc: 'Add richness and depth with a full color treatment suited to your tone.',
  },
  {
    name: 'Facial',
    desc: 'Deep cleansing and hydration to restore a healthy, glowing complexion.',
  },
  {
    name: 'Manicure',
    desc: 'Shape, buff, and polish for neat, well-groomed nails.',
  },
  {
    name: 'Eyebrow Threading',
    desc: 'Precise brow shaping to frame your face and enhance symmetry.',
  },
  {
    name: 'Keratin Treatment',
    desc: 'Smoothing therapy to reduce frizz and add shine to your hair.',
  },
];

// ===== DOM References =====
const form          = document.getElementById('appointmentForm');
const editIdInput   = document.getElementById('editId');
const nameInput     = document.getElementById('customerName');
const serviceInput  = document.getElementById('service');
const dateInput     = document.getElementById('date');
const timeInput     = document.getElementById('time');
const submitBtn     = document.getElementById('submitBtn');
const cancelBtn     = document.getElementById('cancelBtn');
const formTitle     = document.getElementById('formTitle');
const listEl        = document.getElementById('appointmentList');
const emptyState    = document.getElementById('emptyState');
const countEl       = document.getElementById('appointmentCount');
const modalOverlay  = document.getElementById('modalOverlay');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete  = document.getElementById('cancelDelete');

// AI section
const uploadBtn      = document.getElementById('uploadBtn');
const photoInput     = document.getElementById('photoInput');
const previewWrap    = document.getElementById('photoPreview');
const previewImg     = document.getElementById('previewImg');
const removePhotoBtn = document.getElementById('removePhoto');
const analyzeBtn     = document.getElementById('analyzeBtn');
const aiLoading      = document.getElementById('aiLoading');
const recSection     = document.getElementById('recommendations');
const recGrid        = document.getElementById('recGrid');

// ===== LocalStorage =====
function loadAppointments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAppointments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

// ===== Validation =====
function validate() {
  let valid = true;

  const fields = [
    { input: nameInput,    errorId: 'err-name',    message: 'Please enter the customer name.' },
    { input: serviceInput, errorId: 'err-service',  message: 'Please select a service.' },
    { input: dateInput,    errorId: 'err-date',     message: 'Please choose a date.' },
    { input: timeInput,    errorId: 'err-time',     message: 'Please choose a time.' },
  ];

  fields.forEach(({ input, errorId, message }) => {
    const errEl = document.getElementById(errorId);
    if (!input.value.trim()) {
      errEl.textContent = message;
      input.classList.add('invalid');
      valid = false;
    } else {
      errEl.textContent = '';
      input.classList.remove('invalid');
    }
  });

  return valid;
}

function clearErrors() {
  ['err-name', 'err-service', 'err-date', 'err-time'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  [nameInput, serviceInput, dateInput, timeInput].forEach(el => el.classList.remove('invalid'));
}

// ===== Render =====
function render() {
  const sorted = [...appointments].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return da - db;
  });

  const count = appointments.length;
  countEl.textContent = count === 1 ? '1 appointment' : `${count} appointments`;

  emptyState.style.display  = count === 0 ? 'block' : 'none';
  listEl.style.display      = count === 0 ? 'none'  : 'flex';

  listEl.innerHTML = '';

  sorted.forEach(appt => {
    const li = document.createElement('li');
    li.className = 'appointment-card';
    li.dataset.id = appt.id;

    li.innerHTML = `
      <div class="card-info">
        <div class="card-name">${escapeHtml(appt.name)}</div>
        <div class="card-service">${escapeHtml(appt.service)}</div>
        <div class="card-datetime">
          <span>${formatDate(appt.date)}</span>
          <span>${formatTime(appt.time)}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-icon btn-edit" data-id="${appt.id}" aria-label="Edit">Edit</button>
        <button class="btn-icon btn-delete" data-id="${appt.id}" aria-label="Delete">Delete</button>
      </div>
    `;

    listEl.appendChild(li);
  });
}

// ===== Helpers =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,'0')} ${period}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  formTitle.textContent = 'New Appointment';
  submitBtn.textContent = 'Add Appointment';
  cancelBtn.style.display = 'none';
  clearErrors();
}

// ===== Form Submit =====
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) return;

  const id = editIdInput.value;

  const appt = {
    id:      id || generateId(),
    name:    nameInput.value.trim(),
    service: serviceInput.value,
    date:    dateInput.value,
    time:    timeInput.value,
  };

  if (id) {
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) appointments[idx] = appt;
  } else {
    appointments.push(appt);
  }

  saveAppointments();
  render();
  resetForm();

  listEl.closest('.list-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ===== Cancel Edit =====
cancelBtn.addEventListener('click', resetForm);

// ===== Edit / Delete (event delegation) =====
listEl.addEventListener('click', e => {
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');

  if (editBtn) {
    const id   = editBtn.dataset.id;
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    editIdInput.value   = appt.id;
    nameInput.value     = appt.name;
    serviceInput.value  = appt.service;
    dateInput.value     = appt.date;
    timeInput.value     = appt.time;

    formTitle.textContent   = 'Edit Appointment';
    submitBtn.textContent   = 'Update Appointment';
    cancelBtn.style.display = 'inline-flex';

    clearErrors();
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (deleteBtn) {
    pendingDeleteId = deleteBtn.dataset.id;
    modalOverlay.classList.add('active');
  }
});

// ===== Delete Confirmation =====
confirmDelete.addEventListener('click', () => {
  if (pendingDeleteId) {
    appointments = appointments.filter(a => a.id !== pendingDeleteId);
    saveAppointments();
    render();

    if (editIdInput.value === pendingDeleteId) resetForm();
    pendingDeleteId = null;
  }
  modalOverlay.classList.remove('active');
});

cancelDelete.addEventListener('click', () => {
  pendingDeleteId = null;
  modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) {
    pendingDeleteId = null;
    modalOverlay.classList.remove('active');
  }
});

// ===== Clear validation on input =====
[nameInput, serviceInput, dateInput, timeInput].forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    const map = {
      customerName: 'err-name',
      service:      'err-service',
      date:         'err-date',
      time:         'err-time',
    };
    const errEl = document.getElementById(map[input.id]);
    if (errEl) errEl.textContent = '';
  });
});

// ===== AI Service Recommendation =====
uploadBtn.addEventListener('click', () => photoInput.click());

photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  if (uploadedPhotoURL) URL.revokeObjectURL(uploadedPhotoURL);
  uploadedPhotoURL = URL.createObjectURL(file);
  previewImg.src = uploadedPhotoURL;

  previewWrap.style.display = 'flex';
  analyzeBtn.disabled = false;
  recSection.style.display = 'none';
});

removePhotoBtn.addEventListener('click', () => {
  if (uploadedPhotoURL) URL.revokeObjectURL(uploadedPhotoURL);
  uploadedPhotoURL = null;
  photoInput.value = '';
  previewImg.src = '';
  previewWrap.style.display = 'none';
  analyzeBtn.disabled = true;
  recSection.style.display = 'none';
});

analyzeBtn.addEventListener('click', () => {
  if (!uploadedPhotoURL) return;

  analyzeBtn.disabled = true;
  aiLoading.style.display = 'flex';
  recSection.style.display = 'none';

  setTimeout(() => {
    aiLoading.style.display = 'none';
    analyzeBtn.disabled = false;
    renderRecommendations();
  }, 1600);
});

function renderRecommendations() {
  recGrid.innerHTML = '';

  RECOMMENDATIONS.forEach(rec => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="rec-name">${escapeHtml(rec.name)}</div>
      <div class="rec-desc">${escapeHtml(rec.desc)}</div>
      <button class="rec-select-btn" data-service="${escapeHtml(rec.name)}">Select</button>
    `;
    recGrid.appendChild(card);
  });

  recSection.style.display = 'block';
  recSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

recGrid.addEventListener('click', e => {
  const btn = e.target.closest('.rec-select-btn');
  if (!btn) return;

  const serviceName = btn.dataset.service;

  // Highlight the selected card
  recGrid.querySelectorAll('.rec-card').forEach(c => c.classList.remove('selected'));
  btn.closest('.rec-card').classList.add('selected');

  // Pre-fill the form's service field
  serviceInput.value = serviceName;
  serviceInput.classList.remove('invalid');
  document.getElementById('err-service').textContent = '';

  // Scroll to the form
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===== Initial Render =====
render();
const uploadBtn = document.getElementById('uploadBtn');
const photoInput = document.getElementById('photoInput');

uploadBtn.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        uploadedPhotoURL = URL.createObjectURL(file);
        console.log('Photo uploaded:', file.name);
    }
});