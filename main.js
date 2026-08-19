const STORAGE_KEY = 'salon_appointments';
const CUSTOMER_KEY = 'salon_verified_customer';
const REF_COUNTER_KEY = 'salon_ref_counter';

// ===== State =====
let appointments = loadAppointments();
let pendingDeleteId = null;
let pendingCancelId = null;
let pendingRescheduleId = null;
let activeTab = 'upcoming';
let generatedOTP = null;
let registeredCustomer = null;
let verifiedCustomer = loadVerifiedCustomer();

// ===== Simulated AI Recommendations (by beauty goal) =====
const BEAUTY_GOALS = {
  hair: [
    { name: 'Haircut & Blowout', desc: 'A fresh cut and blow-dry to refresh your look and add volume.', duration: 60, price: 150 },
    { name: 'Keratin Treatment', desc: 'Smoothing therapy to reduce frizz and add shine to your hair.', duration: 90, price: 350 },
    { name: 'Hair Coloring', desc: 'Add richness and depth with a full color treatment suited to your tone.', duration: 120, price: 280 },
    { name: 'Highlights', desc: 'Brighten your look with strategically placed highlights.', duration: 105, price: 320 },
  ],
  nails: [
    { name: 'Manicure', desc: 'Shape, buff, and polish for neat, well-groomed nails.', duration: 45, price: 80 },
    { name: 'Pedicure', desc: 'Relaxing foot care with exfoliation, massage, and polish.', duration: 60, price: 120 },
    { name: 'Gel Nails', desc: 'Long-lasting gel polish for a flawless finish that lasts weeks.', duration: 75, price: 150 },
  ],
  makeup: [
    { name: 'Full Makeup Look', desc: 'A complete makeup application for a special occasion or event.', duration: 60, price: 200 },
    { name: 'Eyebrow Threading', desc: 'Precise brow shaping to frame your face and enhance symmetry.', duration: 20, price: 50 },
    { name: 'Makeup Tutorial', desc: 'Learn professional techniques with a personalized makeup lesson.', duration: 90, price: 250 },
  ],
  facial: [
    { name: 'Facial', desc: 'Deep cleansing and hydration to restore a healthy, glowing complexion.', duration: 60, price: 180 },
    { name: 'Deep Cleansing Facial', desc: 'Intensive treatment targeting pores and blemishes for clearer skin.', duration: 75, price: 220 },
    { name: 'Gold Glow Facial', desc: 'Luxurious gold-infused facial for radiant, rejuvenated skin.', duration: 90, price: 300 },
  ],
  spa: [
    { name: 'Full Body Massage', desc: 'Relaxing full-body massage to relieve tension and stress.', duration: 60, price: 250 },
    { name: 'Waxing', desc: 'Smooth, long-lasting hair removal for soft, clean skin.', duration: 45, price: 100 },
    { name: 'Aromatherapy Spa', desc: 'Essential oils and warm therapy for a deeply calming experience.', duration: 75, price: 280 },
  ],
};

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
const modalTitle    = document.getElementById('modalTitle');
const modalBody     = document.getElementById('modalBody');

// Reschedule modal
const rescheduleOverlay   = document.getElementById('rescheduleOverlay');
const rescheduleDateInput = document.getElementById('rescheduleDate');
const rescheduleTimeInput = document.getElementById('rescheduleTime');
const confirmReschedule  = document.getElementById('confirmReschedule');
const cancelReschedule   = document.getElementById('cancelReschedule');

// Confirmation & My Appointments
const confirmationSection  = document.getElementById('confirmationSection');
const confirmationDetails  = document.getElementById('confirmationDetails');
const viewAppointmentsBtn  = document.getElementById('viewAppointmentsBtn');
const bookAnotherBtn       = document.getElementById('bookAnotherBtn');
const myAppointmentsSection= document.getElementById('myAppointmentsSection');
const tabBar               = document.getElementById('tabBar');
const emptyStateText       = document.getElementById('emptyStateText');
const bookFirstBtn         = document.getElementById('bookFirstBtn');

// AI section
const uploadBtn       = document.getElementById('uploadBtn');
const photoInput      = document.getElementById('photoInput');
const previewWrap     = document.getElementById('photoPreview');
const previewImg      = document.getElementById('previewImg');
const removePhotoBtn  = document.getElementById('removePhoto');
const changePhotoBtn  = document.getElementById('changePhotoBtn');
const goalStep        = document.getElementById('goalStep');
const goalGrid        = document.getElementById('goalGrid');
const analyzeStep     = document.getElementById('analyzeStep');
const analyzeBtn      = document.getElementById('analyzeBtn');
const aiLoading       = document.getElementById('aiLoading');
const recSection      = document.getElementById('recommendations');
const recGrid         = document.getElementById('recGrid');
const beautyPlan      = document.getElementById('beautyPlan');
const planEmpty       = document.getElementById('planEmpty');
const planItems       = document.getElementById('planItems');
const planTotals      = document.getElementById('planTotals');
const planActions     = document.getElementById('planActions');
const planTotalDuration = document.getElementById('planTotalDuration');
const planTotalPrice    = document.getElementById('planTotalPrice');
const continueToBookingBtn = document.getElementById('continueToBookingBtn');
const clearPlanBtn    = document.getElementById('clearPlanBtn');

// Registration section
const registerSection  = document.getElementById('registerSection');
const registerBadge    = document.getElementById('registerBadge');
const registerStep     = document.getElementById('registerStep');
const otpStep          = document.getElementById('otpStep');
const verifiedStep     = document.getElementById('verifiedStep');
const registerForm     = document.getElementById('registerForm');
const regNameInput     = document.getElementById('regName');
const regPhoneInput    = document.getElementById('regPhone');
const regEmailInput    = document.getElementById('regEmail');
const sendCodeBtn      = document.getElementById('sendCodeBtn');
const otpBoxesEl       = document.getElementById('otpBoxes');
const otpPhoneDisplay  = document.getElementById('otpPhoneDisplay');
const demoCodeEl       = document.getElementById('demoCode');
const otpDemoNote      = document.getElementById('otpDemoNote');
const verifyBtn        = document.getElementById('verifyBtn');
const resendBtn        = document.getElementById('resendBtn');
const backToRegisterBtn= document.getElementById('backToRegister');
const changeNumberBtn  = document.getElementById('changeNumberBtn');
const verifiedCustomerInfo = document.getElementById('verifiedCustomerInfo');
const bookingCustomerBanner = document.getElementById('bookingCustomerBanner');
const bookingCustomerInfo   = document.getElementById('bookingCustomerInfo');

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
  const customerAppts = getCustomerAppointments();

  // Count by tab
  const counts = { upcoming: 0, completed: 0, cancelled: 0 };
  customerAppts.forEach(a => {
    const cat = classifyAppointment(a);
    counts[cat]++;
  });

  const totalActive = counts[activeTab];
  countEl.textContent = totalActive === 1 ? '1 appointment' : `${totalActive} appointments`;

  // Update tab counts
  tabBar.querySelectorAll('.tab-btn').forEach(btn => {
    const tab = btn.dataset.tab;
    btn.textContent = `${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
    const badge = counts[tab] > 0 ? ` (${counts[tab]})` : '';
    btn.textContent = `${tab.charAt(0).toUpperCase() + tab.slice(1)}${badge}`;
  });

  // Filter by active tab
  const filtered = customerAppts
    .filter(a => classifyAppointment(a) === activeTab)
    .sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`);
      const db = new Date(`${b.date}T${b.time}`);
      return activeTab === 'completed' ? db - da : da - db;
    });

  emptyState.style.display  = filtered.length === 0 ? 'block' : 'none';
  listEl.style.display      = filtered.length === 0 ? 'none'  : 'flex';

  // Empty state text
  const emptyTexts = {
    upcoming:  'No upcoming appointments',
    completed: 'No completed appointments',
    cancelled: 'No cancelled appointments',
  };
  emptyStateText.textContent = emptyTexts[activeTab];

  // Show/hide bookFirstBtn only on upcoming tab
  bookFirstBtn.style.display = (activeTab === 'upcoming' && filtered.length === 0) ? 'inline-flex' : 'none';

  listEl.innerHTML = '';

  filtered.forEach(appt => {
    const li = document.createElement('li');
    li.className = 'appointment-card';
    li.dataset.id = appt.id;

    const cat = classifyAppointment(appt);
    const statusLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
    const statusClass = `status-${cat}`;
    const services = appt.services ? appt.services.join(', ') : appt.service;

    let actionsHtml = '';
    if (cat === 'upcoming') {
      actionsHtml = `
        <button class="btn-icon btn-edit" data-action="reschedule" data-id="${appt.id}">Reschedule</button>
        <button class="btn-icon btn-delete" data-action="cancel" data-id="${appt.id}">Cancel</button>
      `;
    }

    li.innerHTML = `
      <div class="card-info">
        <div class="appt-card-top">
          <span class="appt-card-ref">${escapeHtml(appt.ref || '')}</span>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="card-name">${escapeHtml(appt.name)}</div>
        <div class="card-service">${escapeHtml(services)}</div>
        <div class="card-datetime">
          <span>${formatDate(appt.date)}</span>
          <span>${formatTime(appt.time)}</span>
        </div>
        ${appt.totalPrice ? `<div class="card-datetime"><span>${appt.totalPrice} SAR</span><span>${appt.totalDuration || ''} min</span></div>` : ''}
      </div>
      <div class="card-actions">
        ${actionsHtml}
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

// ===== Booking Reference Generator =====
function generateBookingRef() {
  let counter = parseInt(localStorage.getItem(REF_COUNTER_KEY) || '0', 10);
  counter += 1;
  localStorage.setItem(REF_COUNTER_KEY, String(counter));
  const year = new Date().getFullYear();
  return `LS-${year}-${String(counter).padStart(4, '0')}`;
}

// ===== Service Lookup (for price/duration) =====
const ALL_SERVICES = {};
Object.values(BEAUTY_GOALS).forEach(recs => {
  recs.forEach(r => { ALL_SERVICES[r.name] = r; });
});

function getServiceInfo(name) {
  return ALL_SERVICES[name] || { name, price: 0, duration: 0 };
}

// ===== Customer-scoped appointments =====
function getCustomerAppointments() {
  if (!verifiedCustomer) return [];
  return appointments.filter(a => a.customerPhone === verifiedCustomer.phone);
}

function classifyAppointment(appt) {
  if (appt.status === 'cancelled') return 'cancelled';
  if (appt.status === 'completed') return 'completed';
  const now = new Date();
  const apptDateTime = new Date(`${appt.date}T${appt.time}`);
  if (apptDateTime < now) return 'completed';
  return 'upcoming';
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

  // Build services array from beauty plan or single service
  let services = [];
  let totalPrice = 0;
  let totalDuration = 0;

  if (selectedServices.length > 0) {
    services = selectedServices.map(s => s.name);
    totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  } else {
    services = [serviceInput.value];
    const info = getServiceInfo(serviceInput.value);
    totalPrice = info.price;
    totalDuration = info.duration;
  }

  if (id) {
    // Editing existing — update in place
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      appointments[idx].name    = nameInput.value.trim();
      appointments[idx].service = serviceInput.value;
      appointments[idx].services = services;
      appointments[idx].date    = dateInput.value;
      appointments[idx].time    = timeInput.value;
      appointments[idx].totalPrice = totalPrice;
      appointments[idx].totalDuration = totalDuration;
    }
  } else {
    // New appointment
    const appt = {
      id:            generateId(),
      ref:           generateBookingRef(),
      name:          nameInput.value.trim(),
      customerPhone: verifiedCustomer ? verifiedCustomer.phone : '',
      service:       serviceInput.value,
      services:      services,
      date:          dateInput.value,
      time:          timeInput.value,
      totalPrice:    totalPrice,
      totalDuration: totalDuration,
      status:        'confirmed',
      createdAt:     new Date().toISOString(),
    };
    appointments.push(appt);

    // Show confirmation
    showConfirmation(appt);
  }

  saveAppointments();
  render();
  resetForm();

  if (!id) {
    confirmationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    listEl.closest('.list-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// ===== Booking Confirmation =====
function showConfirmation(appt) {
  const phone = appt.customerPhone || (verifiedCustomer ? verifiedCustomer.phone : '');
  const services = appt.services ? appt.services.join(', ') : appt.service;

  confirmationDetails.innerHTML = `
    <div class="conf-full">
      <div class="conf-label">Booking Reference</div>
      <div class="conf-value conf-ref">${escapeHtml(appt.ref)}</div>
    </div>
    <div>
      <div class="conf-label">Customer Name</div>
      <div class="conf-value">${escapeHtml(appt.name)}</div>
    </div>
    <div>
      <div class="conf-label">Verified Phone</div>
      <div class="conf-value">${escapeHtml(phone)}</div>
    </div>
    <div class="conf-full">
      <div class="conf-label">Selected Services</div>
      <div class="conf-value conf-services">${escapeHtml(services)}</div>
    </div>
    <div>
      <div class="conf-label">Date</div>
      <div class="conf-value">${formatDate(appt.date)}</div>
    </div>
    <div>
      <div class="conf-label">Time</div>
      <div class="conf-value">${formatTime(appt.time)}</div>
    </div>
    <div>
      <div class="conf-label">Total Price</div>
      <div class="conf-value">${appt.totalPrice || 0} SAR</div>
    </div>
    <div>
      <div class="conf-label">Estimated Duration</div>
      <div class="conf-value">${appt.totalDuration || 0} min</div>
    </div>
    <div class="conf-full">
      <div class="conf-label">Status</div>
      <div class="conf-value"><span class="status-badge status-confirmed">Confirmed</span></div>
    </div>
  `;

  confirmationSection.style.display = 'block';
}

viewAppointmentsBtn.addEventListener('click', () => {
  confirmationSection.style.display = 'none';
  activeTab = 'upcoming';
  tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'upcoming'));
  render();
  myAppointmentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

bookAnotherBtn.addEventListener('click', () => {
  confirmationSection.style.display = 'none';
  resetForm();
  selectedServices = [];
  syncRecCardStates();
  updateBeautyPlan();
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

bookFirstBtn.addEventListener('click', () => {
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===== Tab Switching =====
tabBar.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  activeTab = btn.dataset.tab;
  tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
  render();
});

// ===== Cancel Edit =====
cancelBtn.addEventListener('click', resetForm);

// ===== Appointment Actions (event delegation) =====
listEl.addEventListener('click', e => {
  const rescheduleBtn = e.target.closest('[data-action="reschedule"]');
  const cancelApptBtn = e.target.closest('[data-action="cancel"]');

  if (rescheduleBtn) {
    const id = rescheduleBtn.dataset.id;
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    pendingRescheduleId = id;
    rescheduleDateInput.value = appt.date;
    rescheduleTimeInput.value = appt.time;
    rescheduleDateInput.classList.remove('invalid');
    rescheduleTimeInput.classList.remove('invalid');
    document.getElementById('err-reschedule').textContent = '';
    rescheduleOverlay.classList.add('active');
  }

  if (cancelApptBtn) {
    pendingCancelId = cancelApptBtn.dataset.id;
    modalTitle.textContent = 'Cancel Appointment?';
    modalBody.textContent = 'Your appointment will be marked as cancelled. This cannot be undone.';
    confirmDelete.textContent = 'Yes, Cancel';
    modalOverlay.classList.add('active');
  }
});

// ===== Cancel Appointment Confirmation =====
confirmDelete.addEventListener('click', () => {
  if (pendingCancelId) {
    const idx = appointments.findIndex(a => a.id === pendingCancelId);
    if (idx !== -1) {
      appointments[idx].status = 'cancelled';
      saveAppointments();
      render();
    }
    pendingCancelId = null;
  } else if (pendingDeleteId) {
    appointments = appointments.filter(a => a.id !== pendingDeleteId);
    saveAppointments();
    render();
    if (editIdInput.value === pendingDeleteId) resetForm();
    pendingDeleteId = null;
  }
  modalOverlay.classList.remove('active');
});

cancelDelete.addEventListener('click', () => {
  pendingCancelId = null;
  pendingDeleteId = null;
  modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) {
    pendingCancelId = null;
    pendingDeleteId = null;
    modalOverlay.classList.remove('active');
  }
});

// ===== Reschedule Confirmation =====
confirmReschedule.addEventListener('click', () => {
  const dateVal = rescheduleDateInput.value;
  const timeVal = rescheduleTimeInput.value;
  const errEl = document.getElementById('err-reschedule');

  if (!dateVal || !timeVal) {
    errEl.textContent = 'Please select a new date and time.';
    if (!dateVal) rescheduleDateInput.classList.add('invalid');
    if (!timeVal) rescheduleTimeInput.classList.add('invalid');
    return;
  }

  const idx = appointments.findIndex(a => a.id === pendingRescheduleId);
  if (idx !== -1) {
    appointments[idx].date = dateVal;
    appointments[idx].time = timeVal;
    appointments[idx].status = 'confirmed';
    saveAppointments();
    render();
  }

  pendingRescheduleId = null;
  rescheduleOverlay.classList.remove('active');
});

cancelReschedule.addEventListener('click', () => {
  pendingRescheduleId = null;
  rescheduleOverlay.classList.remove('active');
});

rescheduleOverlay.addEventListener('click', e => {
  if (e.target === rescheduleOverlay) {
    pendingRescheduleId = null;
    rescheduleOverlay.classList.remove('active');
  }
});

// Clear reschedule validation on input
[rescheduleDateInput, rescheduleTimeInput].forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    document.getElementById('err-reschedule').textContent = '';
  });
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

// ===== AI Beauty Consultation =====
let uploadedPhotoURL = null;
let selectedGoals = new Set();
let selectedServices = [];

uploadBtn.addEventListener('click', () => photoInput.click());

changePhotoBtn.addEventListener('click', () => photoInput.click());

photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowed.includes(file.type)) {
    alert('Please upload a JPG, JPEG, or PNG image.');
    return;
  }

  if (uploadedPhotoURL) URL.revokeObjectURL(uploadedPhotoURL);
  uploadedPhotoURL = URL.createObjectURL(file);
  previewImg.src = uploadedPhotoURL;

  previewWrap.style.display = 'flex';
  changePhotoBtn.style.display = 'inline-flex';
  uploadBtn.style.display = 'none';

  // Show goal step
  goalStep.style.display = 'block';
  recSection.style.display = 'none';
  beautyPlan.style.display = 'none';
  selectedServices = [];
  updateAnalyzeStep();
  updateBeautyPlan();
});

removePhotoBtn.addEventListener('click', () => {
  resetPhoto();
});

function resetPhoto() {
  if (uploadedPhotoURL) URL.revokeObjectURL(uploadedPhotoURL);
  uploadedPhotoURL = null;
  photoInput.value = '';
  previewImg.src = '';
  previewWrap.style.display = 'none';
  changePhotoBtn.style.display = 'none';
  uploadBtn.style.display = 'inline-flex';
  goalStep.style.display = 'none';
  analyzeStep.style.display = 'none';
  recSection.style.display = 'none';
  beautyPlan.style.display = 'none';
  selectedGoals.clear();
  selectedServices = [];
  document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
  updateBeautyPlan();
}

// ===== Goal Selection =====
goalGrid.addEventListener('click', e => {
  const card = e.target.closest('.goal-card');
  if (!card) return;

  const goal = card.dataset.goal;
  if (selectedGoals.has(goal)) {
    selectedGoals.delete(goal);
    card.classList.remove('selected');
  } else {
    selectedGoals.add(goal);
    card.classList.add('selected');
  }

  document.getElementById('err-goals').textContent = '';
  updateAnalyzeStep();
});

function updateAnalyzeStep() {
  if (uploadedPhotoURL && selectedGoals.size > 0) {
    analyzeStep.style.display = 'block';
  } else {
    analyzeStep.style.display = 'none';
  }
}

// ===== Analyze =====
analyzeBtn.addEventListener('click', () => {
  if (!uploadedPhotoURL) {
    document.getElementById('err-goals').textContent = 'Please upload a photo first.';
    return;
  }

  if (selectedGoals.size === 0) {
    document.getElementById('err-goals').textContent = 'Please select at least one beauty goal.';
    return;
  }

  analyzeBtn.disabled = true;
  aiLoading.style.display = 'flex';
  recSection.style.display = 'none';
  beautyPlan.style.display = 'none';
  updateBeautyPlan();

  setTimeout(() => {
    aiLoading.style.display = 'none';
    analyzeBtn.disabled = false;
    renderRecommendations();
  }, 1800);
});

function renderRecommendations() {
  recGrid.innerHTML = '';
  selectedServices = [];

  const allRecs = [];
  selectedGoals.forEach(goal => {
    const recs = BEAUTY_GOALS[goal] || [];
    recs.forEach(rec => allRecs.push(rec));
  });

  // Limit to 4 recommendations max, picking 2 per goal
  const picks = [];
  const goalsArray = [...selectedGoals];
  goalsArray.forEach(goal => {
    const recs = BEAUTY_GOALS[goal] || [];
    recs.slice(0, 2).forEach(r => picks.push(r));
  });
  const finalRecs = picks.slice(0, 4);

  finalRecs.forEach((rec, idx) => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.dataset.idx = idx;
    card.innerHTML = `
      <div class="rec-name">${escapeHtml(rec.name)}</div>
      <div class="rec-desc">${escapeHtml(rec.desc)}</div>
      <div class="rec-meta">
        <span>⏱ ${rec.duration} min</span>
        <span>💰 ${rec.price} SAR</span>
      </div>
      <button class="rec-select-btn" data-idx="${idx}">Select</button>
    `;
    recGrid.appendChild(card);
  });

  recSection.style.display = 'block';

  // Show beauty plan with empty state
  beautyPlan.style.display = 'block';
  updateBeautyPlan();

  recSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== Select / Deselect Recommendation =====
recGrid.addEventListener('click', e => {
  const btn = e.target.closest('.rec-select-btn');
  if (!btn) return;

  const idx = parseInt(btn.dataset.idx, 10);
  const card = btn.closest('.rec-card');
  const rec = getFinalRecs()[idx];

  const existingIdx = selectedServices.findIndex(s => s.name === rec.name);

  if (existingIdx !== -1) {
    selectedServices.splice(existingIdx, 1);
    card.classList.remove('selected');
    btn.classList.remove('selected');
    btn.textContent = 'Select';
  } else {
    selectedServices.push(rec);
    card.classList.add('selected');
    btn.classList.add('selected');
    btn.textContent = '✓ Selected';
  }

  updateBeautyPlan();
});

// ===== Beauty Plan Summary =====
function updateBeautyPlan() {
  if (selectedServices.length === 0) {
    planEmpty.style.display = 'block';
    planItems.innerHTML = '';
    planTotals.style.display = 'none';
    planActions.style.display = 'none';
    clearPlanBtn.style.display = 'none';
    return;
  }

  planEmpty.style.display = 'none';
  planItems.innerHTML = '';
  clearPlanBtn.style.display = 'inline-flex';

  selectedServices.forEach((svc, idx) => {
    const item = document.createElement('div');
    item.className = 'plan-item';
    item.innerHTML = `
      <span class="plan-item-check">&#10003;</span>
      <div class="plan-item-info">
        <div class="plan-item-name">${escapeHtml(svc.name)}</div>
        <div class="plan-item-meta">${svc.price} SAR · ${svc.duration} min</div>
      </div>
      <button class="plan-remove-btn" data-idx="${idx}" aria-label="Remove" title="Remove">&#10005;</button>
    `;
    planItems.appendChild(item);
  });

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  planTotalDuration.textContent = `${totalDuration} min`;
  planTotalPrice.textContent = `${totalPrice} SAR`;

  planTotals.style.display = 'block';
  planActions.style.display = 'flex';
}

// ===== Remove service from plan =====
planItems.addEventListener('click', e => {
  const btn = e.target.closest('.plan-remove-btn');
  if (!btn) return;

  const idx = parseInt(btn.dataset.idx, 10);
  const removed = selectedServices[idx];
  selectedServices.splice(idx, 1);

  // Sync recommendation card state
  syncRecCardStates();

  updateBeautyPlan();
});

// ===== Clear All =====
clearPlanBtn.addEventListener('click', () => {
  selectedServices = [];
  syncRecCardStates();
  updateBeautyPlan();
});

// ===== Sync recommendation card selection state =====
function syncRecCardStates() {
  const cards = recGrid.querySelectorAll('.rec-card');
  cards.forEach(card => {
    const idx = parseInt(card.dataset.idx, 10);
    const rec = getFinalRecs()[idx];
    if (!rec) return;

    const isSelected = selectedServices.some(s => s.name === rec.name);
    const btn = card.querySelector('.rec-select-btn');

    if (isSelected) {
      card.classList.add('selected');
      btn.classList.add('selected');
      btn.textContent = '✓ Selected';
    } else {
      card.classList.remove('selected');
      btn.classList.remove('selected');
      btn.textContent = 'Select';
    }
  });
}

function getFinalRecs() {
  const picks = [];
  [...selectedGoals].forEach(goal => {
    const recs = BEAUTY_GOALS[goal] || [];
    recs.slice(0, 2).forEach(r => picks.push(r));
  });
  return picks.slice(0, 4);
}

// ===== Continue to Booking =====
continueToBookingBtn.addEventListener('click', () => {
  if (selectedServices.length === 0) return;

  // Fill the first selected service into the form's dropdown
  const firstService = selectedServices[0].name;
  serviceInput.value = firstService;
  serviceInput.classList.remove('invalid');
  document.getElementById('err-service').textContent = '';

  // Hide confirmation if visible
  confirmationSection.style.display = 'none';

  // Scroll to booking form
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===== Customer Registration & Phone Verification =====

function loadVerifiedCustomer() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || null;
  } catch {
    return null;
  }
}

function saveVerifiedCustomer() {
  if (verifiedCustomer) {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(verifiedCustomer));
  } else {
    localStorage.removeItem(CUSTOMER_KEY);
  }
}

// Saudi mobile: 05XXXXXXXX (10 digits starting with 05) or +9665XXXXXXXX / 9665XXXXXXXX
function isValidSaudiPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(05\d{8}|9665\d{8}|\+9665\d{8})$/.test(cleaned);
}

function normalizeSaudiPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+966')) return '0' + cleaned.slice(4);
  if (cleaned.startsWith('966'))  return '0' + cleaned.slice(3);
  return cleaned;
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function showRegisterStep() {
  registerStep.style.display  = 'block';
  otpStep.style.display       = 'none';
  verifiedStep.style.display  = 'none';
  registerBadge.textContent   = 'Step 1 of 2';
}

function showOTPStep() {
  registerStep.style.display  = 'none';
  otpStep.style.display       = 'block';
  verifiedStep.style.display  = 'none';
  registerBadge.textContent   = 'Step 2 of 2';
  otpPhoneDisplay.textContent = normalizeSaudiPhone(regPhoneInput.value);
  demoCodeEl.textContent       = generatedOTP;
  clearOTPInputs();
  otpBoxesEl.querySelector('.otp-input').focus();
}

function showVerifiedStep() {
  registerStep.style.display  = 'none';
  otpStep.style.display       = 'none';
  verifiedStep.style.display  = 'block';
  registerBadge.textContent   = 'Verified';
  verifiedCustomerInfo.textContent = `${verifiedCustomer.name} — ${verifiedCustomer.phone}`;
  updateBookingBanner();
}

function updateBookingBanner() {
  if (verifiedCustomer) {
    bookingCustomerBanner.style.display = 'flex';
    bookingCustomerInfo.textContent = `${verifiedCustomer.name} — ${verifiedCustomer.phone}`;
    // Pre-fill the customer name field
    nameInput.value = verifiedCustomer.name;
  } else {
    bookingCustomerBanner.style.display = 'none';
    bookingCustomerInfo.textContent = '';
  }
}

function validateRegistration() {
  let valid = true;

  // Name
  if (!regNameInput.value.trim()) {
    document.getElementById('err-reg-name').textContent = 'Please enter your full name.';
    regNameInput.classList.add('invalid');
    valid = false;
  } else {
    document.getElementById('err-reg-name').textContent = '';
    regNameInput.classList.remove('invalid');
  }

  // Phone
  if (!regPhoneInput.value.trim()) {
    document.getElementById('err-reg-phone').textContent = 'Please enter your mobile number.';
    regPhoneInput.classList.add('invalid');
    valid = false;
  } else if (!isValidSaudiPhone(regPhoneInput.value)) {
    document.getElementById('err-reg-phone').textContent = 'Enter a valid Saudi number (e.g. 0551234567).';
    regPhoneInput.classList.add('invalid');
    valid = false;
  } else {
    document.getElementById('err-reg-phone').textContent = '';
    regPhoneInput.classList.remove('invalid');
  }

  // Email (optional, but validate format if provided)
  const emailVal = regEmailInput.value.trim();
  if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    document.getElementById('err-reg-email').textContent = 'Please enter a valid email address.';
    regEmailInput.classList.add('invalid');
    valid = false;
  } else {
    document.getElementById('err-reg-email').textContent = '';
    regEmailInput.classList.remove('invalid');
  }

  return valid;
}

function clearOTPInputs() {
  otpBoxesEl.querySelectorAll('.otp-input').forEach(input => {
    input.value = '';
    input.classList.remove('invalid');
  });
  document.getElementById('err-otp').textContent = '';
}

function getOTPValue() {
  return Array.from(otpBoxesEl.querySelectorAll('.otp-input'))
    .map(i => i.value)
    .join('');
}

// ===== Registration Form Submit =====
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateRegistration()) return;

  registeredCustomer = {
    name:  regNameInput.value.trim(),
    phone: normalizeSaudiPhone(regPhoneInput.value),
    email: regEmailInput.value.trim(),
  };

  generatedOTP = generateOTP();
  showOTPStep();
});

// ===== OTP Input Behavior =====
otpBoxesEl.addEventListener('input', e => {
  const input = e.target;
  if (!input.classList.contains('otp-input')) return;

  input.value = input.value.replace(/\D/g, '').slice(0, 1);

  if (input.value && input.nextElementSibling) {
    input.nextElementSibling.focus();
  }

  input.classList.remove('invalid');
  document.getElementById('err-otp').textContent = '';
});

otpBoxesEl.addEventListener('keydown', e => {
  if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling) {
    e.target.previousElementSibling.focus();
  }
});

otpBoxesEl.addEventListener('paste', e => {
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
  const inputs = otpBoxesEl.querySelectorAll('.otp-input');
  pasted.split('').forEach((digit, i) => {
    if (inputs[i]) inputs[i].value = digit;
  });
  if (inputs[pasted.length - 1]) inputs[pasted.length - 1].focus();
});

// ===== Verify OTP =====
verifyBtn.addEventListener('click', () => {
  const entered = getOTPValue();

  if (entered.length !== 6) {
    document.getElementById('err-otp').textContent = 'Please enter all 6 digits.';
    otpBoxesEl.querySelectorAll('.otp-input').forEach(i => i.classList.add('invalid'));
    return;
  }

  if (entered !== generatedOTP) {
    document.getElementById('err-otp').textContent = 'Incorrect code. Please try again.';
    otpBoxesEl.querySelectorAll('.otp-input').forEach(i => i.classList.add('invalid'));
    return;
  }

  // Success
  verifiedCustomer = registeredCustomer;
  saveVerifiedCustomer();
  generatedOTP = null;
  showVerifiedStep();
});

// ===== Resend Code =====
resendBtn.addEventListener('click', () => {
  generatedOTP = generateOTP();
  demoCodeEl.textContent = generatedOTP;
  clearOTPInputs();
  otpBoxesEl.querySelector('.otp-input').focus();
});

// ===== Back to Registration =====
backToRegisterBtn.addEventListener('click', () => {
  generatedOTP = null;
  showRegisterStep();
});

// ===== Change Number =====
changeNumberBtn.addEventListener('click', () => {
  verifiedCustomer = null;
  registeredCustomer = null;
  saveVerifiedCustomer();
  registerForm.reset();
  showRegisterStep();
  updateBookingBanner();
  confirmationSection.style.display = 'none';
  render();
});

// ===== Clear validation on input =====
[regNameInput, regPhoneInput, regEmailInput].forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    const map = { regName: 'err-reg-name', regPhone: 'err-reg-phone', regEmail: 'err-reg-email' };
    const errEl = document.getElementById(map[input.id]);
    if (errEl) errEl.textContent = '';
  });
});

// ===== Initialize Registration State =====
if (verifiedCustomer) {
  showVerifiedStep();
} else {
  showRegisterStep();
}

// ===== Initial Render =====
render();
