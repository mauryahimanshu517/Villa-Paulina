/* ==========================================================
   Villa Paulina — Booking flow (production)
   All data is fetched from the live booking API.
   ========================================================== */

/* ==========================================================
   I18N
   ========================================================== */
const I18N = {
  nl: {
    step_count_1: "Stap 1 van 3",
    step_count_2: "Stap 2 van 3",
    step_count_3: "Stap 3 van 3",
    quote_request: "Offerte <em>aanvraag</em>",
    paulina_experience: "Paulina <em>experience</em>",
    hero_title: "Jouw Caribische <em>droom</em>",
    hero_sub: "Zon, zee en rust op Curaçao — boek je verblijf in Villa Paulina.",
    add_date: "Datum",
    search: "Zoeken",
    edit: "Wijzig",
    clear: "Wissen",
    stay: "Verblijf",
    arrival: "Aankomst",
    departure: "Vertrek",
    guests: "Gasten",
    adults: "Volwassenen",
    adults_sub: "Volwassenen & oudere kinderen",
    children: "Kinderen (t/m 3)",
    children_sub: "Tot 3 jaar oud",
    bedrooms: "Slaapkamers",
    bedrooms_hint: "Minimaal 1 slaapkamer.",
    checkout_std: "Standaard checkout (10:00 uur)",
    checkout_late: "Late checkout (19:00 uur)",
    transfer: "Transfer aantal personen (v.a. 6 jaar)",
    next: "Volgende stap",
    prev: "Vorige stap",
    submit: "Vraag offerte aan",
    car_rental: "Auto huren",
    car_desc: "Met je eigen auto verken je Curaçao moeiteloos — verborgen baaitjes, lokale markten, zonsondergangsplekken. Kies de auto die bij je plannen past, of sla over als je liever met taxi's gaat.",
    nocar: "Geen auto",
    first_name: "Voornaam", last_name: "Achternaam",
    address: "Adres", zip: "Postcode", city: "Plaats", country: "Land",
    phone: "Telefoonnummer", email: "E-mailadres", comment: "Opmerkingen (optioneel)",
    agree_text: "Ik begrijp dat de aanbetaling ter plaatse wordt betaald (creditcard of contant), en ga akkoord met het ontvangen van een vrijblijvende offerte.",
    thanks: "Bedankt!",
    hope_to_welcome: "Wij hopen u snel te mogen ontvangen",
    ty_body: "U krijgt binnen 24 uur een reactie van ons. Houdt uw mailbox in de gaten.",
    ref_id: "Referentie",
    summary: "Verblijf",
    summary_head: "Prijsoverzicht",
    summary_empty_dates: "Selecteer je data voor prijsberekening.",
    summary_empty: "Je prijs verschijnt hier zodra je je verblijf samenstelt.",
    total: "Totaal incl. btw",
    deposit_note: "💡 De aanbetaling wordt ter plaatse voldaan met creditcard of contant — geen online betaling nodig.",
    cal_title: "Selecteer je data",
    cal_sub: "Minimumverblijf is 7 nachten. Grijze dagen zijn niet beschikbaar.",
    cal_pick_arrival: "Kies een aankomstdatum",
    cal_pick_departure: "Kies een vertrekdatum",
    cal_nights: "nachten",
    cal_loading: "Beschikbaarheid laden…",
    confirm_dates: "Bevestigen",
    avail: "Beschikbaar", unavail: "Niet beschikbaar", sel: "Geselecteerd",
    alt_title: "Deze data zijn niet meer beschikbaar",
    alt_sub: "We vonden vergelijkbare verblijven — klik om verder te gaan:",
    min_bedrooms_for: "Voor {n} gasten zijn minimaal {b} slaapkamers vereist.",
    line_villa: "Verblijf villa",
    line_low_season_nights: "Overnachting laagseizoen",
    line_high_season_nights: "Overnachting hoogseizoen",
    line_cleaning: "Eindschoonmaak",
    line_transfer: "Transfer",
    line_car: "Huurauto",
    line_late_checkout: "Late checkout",
    subtotal: "Subtotaal",
    tax: "BTW",
    err_generic: "Er ging iets mis. Probeer opnieuw.",
    err_dates_required: "Selecteer eerst je data.",
    err_form_incomplete: "Vul alle verplichte velden in.",
    err_min_stay: "Minimumverblijf is 7 nachten.",
    err_unavailable: "Deze data zijn niet beschikbaar. Kies een andere periode.",
    err_network: "Verbindingsprobleem. Controleer je internet en probeer opnieuw.",
    booking_failed: "Boeking mislukt. Probeer opnieuw.",
    guest_word: "gast", guests_word: "gasten",
    bedroom_word: "slaapkamer", bedrooms_word: "slaapkamers",
    weekdays_short: ["Ma","Di","Wo","Do","Vr","Za","Zo"],
    months: ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],
  }
};

let lang = 'nl';
const t = (key) => I18N[lang][key] ?? key;

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang][key] != null) el.innerHTML = I18N[lang][key];
  });
  document.documentElement.lang = lang;
  renderCalendarWeekdays();
  renderCalendar();
  renderSummary();
  updateBedroomsHint();
  updateCarGrid(state.cars);
  updateSearchBarLabels();
  applyDateInputs();
}

/* ==========================================================
   API LAYER
   ========================================================== */
const API_BASE ='https://sentive.nl/api/public/endpoints';

console.log('[VP] API_BASE =', API_BASE);

async function api(path, { method = 'GET', params = null, body = null, signal = null } = {}){
  let url = `${API_BASE}${path}`;
  if (params){
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );
    const qs = new URLSearchParams(clean).toString();
    if (qs) url += '?' + qs;
  }

  const opts = {
    method,
    headers: { 'Accept': 'application/json' },
    signal,
  };
  if (body){
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  console.log(`[VP] → ${method} ${url}`, body || params || '');

  let res;
  try {
    res = await fetch(url, opts);
    
  } catch (networkErr){
    if (networkErr.name === 'AbortError') throw networkErr;
    console.error(`[VP] ✗ network error: ${url}`, networkErr);
    const err = new Error(t('err_network'));
    err.cause = networkErr;
    throw err;
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr){
    console.error(`[VP] ✗ non-JSON response (HTTP ${res.status}) from ${url}:`, text.slice(0, 500));
    throw new Error(`Server returned an invalid response (HTTP ${res.status}).`);
  }

  console.log(`[VP] ← ${res.status} ${url}`, data);

  if (!res.ok || data.status !== 'success'){
    const msg = data.message || `Request failed (HTTP ${res.status})`;
    const err = new Error(msg);
    err.payload = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ==========================================================
   STATE
   ========================================================== */
const state = {
  step: 1,
  checkin: null,             // Date
  checkout: null,            // Date
  guests: 2,
  children: 0,
  bedrooms: 1,
  lateCheckout: false,
  transfer: 0,
  carId: 0,                  // 0 = none
  cars: [],
  customer: {},
  priceLines: null,
  totals: null,
  villaId: null,             // set after /availability call (recommended_villa)
  datesValidated: false,     // true only after a successful /availability check
  minimumStayNights: 7,      // updated from API
  availabilityByDate: new Map(),     // 'YYYY-MM-DD' -> { available, min_stay }
  loadedRanges: [],                  // [{start: Date, end: Date}]
  inflight: { availability: null, price: null }, // AbortControllers
};

/* ==========================================================
   DATE UTILITIES
   ========================================================== */
function isoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}
function parseISODate(s){
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n){ const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function stripTime(d){ const r = new Date(d); r.setHours(0,0,0,0); return r; }
function daysBetween(a, b){ return Math.round((stripTime(b) - stripTime(a)) / 86400000); }
function formatDate(d){
  if (!d) return '';
  return new Intl.DateTimeFormat(lang === 'nl' ? 'nl-NL' : 'en-GB',
    { day:'numeric', month:'short', year:'numeric'}).format(d);
}
function formatDateShort(d){
  if (!d) return '';
  return new Intl.DateTimeFormat(lang === 'nl' ? 'nl-NL' : 'en-GB',
    { day:'numeric', month:'short'}).format(d);
}
function fmtMoney(n){
  if (n == null || isNaN(n)) return '€ —';
  return '€' + Number(n).toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
}

/* ==========================================================
   SELINE TRACKING
   ========================================================== */
function track(name, payload = {}){
  try {
    if (window.seline && typeof window.seline.track === 'function'){
      window.seline.track(name, payload);
    }
    console.log(`[seline] ${name}`, payload);
  } catch(_) { /* noop */ }
}

/* ==========================================================
   STEP NAVIGATION
   ========================================================== */
function goToStep(n){
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('step' + n);
  if (!el) return;
  el.classList.add('active');
  state.step = n;
  document.getElementById('progressFill').style.width = (n * 25) + '%';
  const panelInner = document.querySelector('.panel-inner');
  if (panelInner) panelInner.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('aside').style.display = (n === 4) ? 'none' : '';
}

/* ==========================================================
   PANEL OPEN / CLOSE
   ========================================================== */
function openPanel(){
  document.getElementById('panel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('open');
  document.body.classList.add('panel-open');
  document.getElementById('panel').setAttribute('aria-hidden', 'false');
  syncStaySummary();
}
function closePanel(){
  document.getElementById('panel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('open');
  document.body.classList.remove('panel-open');
  document.getElementById('panel').setAttribute('aria-hidden', 'true');
}

/* ==========================================================
   BEDROOM MINIMUM ENFORCEMENT
   ========================================================== */
function minBedroomsFor(guests){ return Math.max(1, Math.ceil(guests / 2)); }

function updateBedroomOptions(){
  const sel = document.getElementById('bedroomsSel');
  const min = minBedroomsFor(state.guests);
  [...sel.options].forEach(opt => {
    const v = parseInt(opt.value, 10);
    opt.disabled = v < min;
    opt.hidden = v < min;
  });
  if (parseInt(sel.value, 10) < min) sel.value = String(min);
  if (state.bedrooms < min) state.bedrooms = min;
  sel.value = String(state.bedrooms);
  if (sel.__cddSync) sel.__cddSync();
  document.getElementById('stepBedrooms').textContent = state.bedrooms;
  updateBedroomsHint();
  updateSearchBarLabels();
  updateStepperButtons();
}
function updateBedroomsHint(){
  const min = minBedroomsFor(state.guests);
  const text = state.guests <= 2
    ? t('bedrooms_hint')
    : t('min_bedrooms_for').replace('{n}', state.guests).replace('{b}', min);
  const a = document.getElementById('bedroomsHint');
  const b = document.getElementById('bedroomsHintInline');
  if (a) a.textContent = text;
  if (b) b.textContent = text;
}

/* ==========================================================
   STEP-1 VALIDATION  (panel)
   ========================================================== */
function validateStep1(){
  const ok = state.checkin
    && state.checkout
    && daysBetween(state.checkin, state.checkout) >= state.minimumStayNights
    && state.datesValidated;
  document.getElementById('toStep2').disabled = !ok;
}

/* ==========================================================
   CALENDAR
   ========================================================== */
const cal = {
  view: stripTime(new Date()),
  draft: { start: null, end: null },
  loading: false,
  pickingMode: 'arrival',   // 'arrival' | 'departure'
};

function renderCalendarWeekdays(){
  ['calWeekdays1','calWeekdays2'].forEach(id => {
    const row = document.getElementById(id);
    if (!row) return;
    row.innerHTML = '';
    I18N[lang].weekdays_short.forEach(w => {
      const el = document.createElement('span');
      el.textContent = w;
      row.appendChild(el);
    });
  });
}

function rangeAlreadyLoaded(start, end){
  return state.loadedRanges.some(r => start >= r.start && end <= r.end);
}

async function ensureAvailabilityLoaded(fromDate, monthsAhead = 3){
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end   = new Date(fromDate.getFullYear(), fromDate.getMonth() + monthsAhead, 0);
  if (rangeAlreadyLoaded(start, end)) return;

  cal.loading = true;
  renderCalendar();

  try {
    const data = await api('/daily-availability.php', {
      params: { villa_id: state.villaId, start_date: isoDate(start), end_date: isoDate(end) }
    });
    if (data.minimum_stay_nights) state.minimumStayNights = data.minimum_stay_nights;

    (data.days || []).forEach(d => {
      const villas = d.villas || [];
      const anyAvailable = villas.some(v => v.available);
      const anyMinStay   = villas.some(v => v.available && v.min_stay_possible);
      state.availabilityByDate.set(d.date, {
        available: anyAvailable,
        min_stay: anyMinStay,
      });
    });
    state.loadedRanges.push({ start, end });
  } catch (err){
    console.error('availability load failed', err);
    showToast(err.message || t('err_generic'), true);
  } finally {
    cal.loading = false;
    renderCalendar();
  }
}

function renderMonthPanel(viewDate, monthLabelId, daysGridId){
  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const labelEl = document.getElementById(monthLabelId);
  if (!labelEl) return;
  labelEl.textContent = `${I18N[lang].months[month]} ${year}`;

  const firstOfMonth = new Date(year, month, 1);
  const startDow = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = stripTime(new Date());

  const grid = document.getElementById(daysGridId);
  grid.innerHTML = '';

  for (let i = 0; i < startDow; i++){
    const spacer = document.createElement('div');
    spacer.className = 'cal-day empty';
    grid.appendChild(spacer);
  }

  for (let d = 1; d <= daysInMonth; d++){
    const date = new Date(year, month, d);
    const iso = isoDate(date);
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;

    if (date < today){
      el.classList.add('past');
    } else {
      const avail = state.availabilityByDate.get(iso);
      const pickingArrival = cal.pickingMode === 'arrival' || !cal.draft.start || (cal.draft.start && cal.draft.end);

      if (avail && avail.available){
        el.classList.add('available');
        if (pickingArrival && !avail.min_stay){
          el.classList.add('no-min-stay');
          el.title = t('err_min_stay');
        }
        el.addEventListener('click', () => selectDay(date));
      } else {
        el.classList.add('unavailable');
      }
    }

    const { start, end } = cal.draft;
    if (start && end && date >= start && date <= end){
      el.classList.add('in-range');
      if (date.getTime() === start.getTime()) el.classList.add('range-start');
      if (date.getTime() === end.getTime()) el.classList.add('range-end');
    } else if (start && !end && date.getTime() === start.getTime()){
      el.classList.add('in-range', 'range-start', 'range-end', 'range-single');
    }

    grid.appendChild(el);
  }
}

function renderCalendar(){
  const today = stripTime(new Date());

  renderMonthPanel(cal.view, 'calMonth1', 'calDays1');
  const nextMonth = new Date(cal.view.getFullYear(), cal.view.getMonth() + 1, 1);
  renderMonthPanel(nextMonth, 'calMonth2', 'calDays2');

  const prev = new Date(cal.view.getFullYear(), cal.view.getMonth() - 1, 1);
  const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevBtn = document.getElementById('calPrev');
  if (prevBtn) prevBtn.disabled = prev < firstOfThisMonth;

  const sel = document.getElementById('calSelection');
  if (!sel) return;

  if (cal.loading){
    sel.textContent = t('cal_loading');
    return;
  }

  if (!cal.draft.start){
    sel.textContent = t('cal_pick_arrival');
  } else if (!cal.draft.end){
    sel.innerHTML = `<strong>${formatDate(cal.draft.start)}</strong> → ${t('cal_pick_departure')}`;
  } else {
    const n = daysBetween(cal.draft.start, cal.draft.end);
    sel.innerHTML = `<strong>${formatDate(cal.draft.start)}</strong> → <strong>${formatDate(cal.draft.end)}</strong> · ${n} ${t('cal_nights')}`;
  }
}

function selectDay(date){
  const iso = isoDate(date);
  const avail = state.availabilityByDate.get(iso);
  if (!avail || !avail.available) return;

  const commitArrival = (d) => {
    cal.draft.start = d;
    cal.draft.end = null;
    state.checkin = d;
    state.checkout = null;
    state.datesValidated = false;
    cal.pickingMode = 'departure';
    setActiveSegment('departure');
    applyDateInputs();
    updateSearchBarLabels();
    validateStep1();
  };

  const commitDeparture = (d) => {
    cal.draft.end = d;
    state.checkout = d;
    applyDateInputs();
    updateSearchBarLabels();
    track('booking_dates_selected', { start: isoDate(state.checkin), end: isoDate(state.checkout) });
    validateDates();
    renderCalendar();
    // After committing the departure, close the calendar after a beat.
    setTimeout(() => {
      closeAllPops();
      setActiveSegment(null);
    }, 250);
  };

  // DEPARTURE MODE — user explicitly opened the calendar to change the
  // check-out date. Don't reset the existing arrival; just update departure.
  // (Standard booking-app behaviour.)
  if (cal.pickingMode === 'departure' && cal.draft.start){
    if (date <= cal.draft.start){
      // Clicked a day <= the existing arrival: re-interpret as new arrival.
      if (!avail.min_stay){ showToast(t('err_min_stay'), true); return; }
      commitArrival(date);
      renderCalendar();
      return;
    }
    const nights = daysBetween(cal.draft.start, date);
    if (nights < state.minimumStayNights){
      showToast(t('err_min_stay'), true);
      return;
    }
    commitDeparture(date);
    return;
  }

  // ARRIVAL MODE / FRESH STATE — original flow.
  if (!cal.draft.start || (cal.draft.start && cal.draft.end)){
    if (!avail.min_stay){ showToast(t('err_min_stay'), true); return; }
    commitArrival(date);
  } else {
    if (date <= cal.draft.start){
      if (!avail.min_stay){ showToast(t('err_min_stay'), true); return; }
      commitArrival(date);
    } else {
      const nights = daysBetween(cal.draft.start, date);
      if (nights < state.minimumStayNights){
        showToast(t('err_min_stay'), true);
        return;
      }
      commitDeparture(date);
      return;
    }
  }
  renderCalendar();
}

async function openCalendarFor(mode){
  cal.pickingMode = mode;
  closeAllPops();
  document.getElementById('popCal').classList.add('open');
  setActiveSegment(mode);
  positionPopCal(mode);
  const today = stripTime(new Date());
  const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const anchor = state.checkin || cal.view || today;
  cal.view = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  if (cal.view < firstOfThisMonth) cal.view = firstOfThisMonth;
  cal.draft.start = state.checkin;
  cal.draft.end = state.checkout;
  renderCalendar();
  await ensureAvailabilityLoaded(cal.view);
}

/* On mobile any search-bar popover is anchored just below the *clicked*
 * segment so the rest of the stacked bar stays visually behind it.
 * On desktop the inline top is cleared so the CSS default takes over. */
function positionPop(popId, seg){
  const pop = document.getElementById(popId);
  if (!pop) return;
  if (window.innerWidth > 720){
    pop.style.top = '';
    return;
  }
  const wrap = document.querySelector('.search-wrap');
  const segId = 'seg' + seg.charAt(0).toUpperCase() + seg.slice(1);
  const segEl = document.getElementById(segId);
  if (!wrap || !segEl) return;
  const wrapRect = wrap.getBoundingClientRect();
  const segRect  = segEl.getBoundingClientRect();
  pop.style.top = ((segRect.bottom - wrapRect.top) + 8) + 'px';
}
function positionPopCal(seg){ positionPop('popCal', seg); }

/* ==========================================================
   AVAILABILITY VALIDATION + ALTERNATIVES
   ========================================================== */
async function validateDates(){
  if (!state.checkin || !state.checkout) return;

  if (state.inflight.availability) state.inflight.availability.abort();
  const ctrl = new AbortController();
  state.inflight.availability = ctrl;

  state.datesValidated = false;
  validateStep1();

  try {
    const data = await api('/availability.php', {
      params: {
        villa_id: state.villaId,
        start_date: isoDate(state.checkin),
        end_date: isoDate(state.checkout),
      },
      signal: ctrl.signal,
    });

    track('booking_availability_checked', { available: data.available });

    if (data.available){
      state.villaId = data.recommended_villa
        || (data.available_villas && data.available_villas[0])
        || null;
      state.datesValidated = true;
      hideAltBanner();
      validateStep1();
      refreshPrice();
    } else {
      state.villaId = null;
      state.totals = null;
      state.priceLines = null;
      renderSummary();
      validateStep1();
      showAltBanner(data.alternatives);
      track('booking_alternative_shown', { alts: data.alternatives });
      showToast(t('err_unavailable'), true);
    }
  } catch (err){
    if (err.name === 'AbortError') return;
    console.error('availability check failed', err);
    showToast(err.message || t('err_generic'), true);
  }
}

function showAltBanner(alts){
  const banner = document.getElementById('altBanner');
  const grid = document.getElementById('altGrid');
  grid.innerHTML = '';
  const today = stripTime(new Date());
  // Drop any alternative whose start date is already in the past — the
  // user cannot book a stay starting before today, regardless of what
  // the API returned.
  const options = [alts && alts.closest_exact_match, alts && alts.closest_shorter_match]
    .filter(Boolean)
    .filter(opt => {
      const startD = parseISODate(opt.start_date);
      return startD >= today;
    });
  if (!options.length){ banner.classList.remove('show'); return; }

  options.forEach(opt => {
    const el = document.createElement('div');
    el.className = 'alt-option';
    const startD = parseISODate(opt.start_date);
    const endD = parseISODate(opt.end_date);
    el.innerHTML = `
      <div>
        <div class="alt-option-main">${formatDate(startD)} → ${formatDate(endD)}</div>
        <div class="alt-option-sub">${opt.nights_total} ${t('cal_nights')} · ${opt.label || ''}</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    `;
    el.addEventListener('click', async () => {
      state.checkin = startD;
      state.checkout = endD;
      if (opt.villa_id) state.villaId = opt.villa_id;
      applyDateInputs();
      updateSearchBarLabels();
      hideAltBanner();
      await validateDates();
    });
    grid.appendChild(el);
  });
  banner.classList.add('show');
}
function hideAltBanner(){ document.getElementById('altBanner').classList.remove('show'); }

/* ==========================================================
   PRICE SUMMARY
   ========================================================== */
let priceDebounceTimer = null;
function refreshPrice(){
  clearTimeout(priceDebounceTimer);
  priceDebounceTimer = setTimeout(doRefreshPrice, 250);
}

async function doRefreshPrice(){
  if (!state.checkin || !state.checkout
      || daysBetween(state.checkin, state.checkout) < state.minimumStayNights
      || !state.datesValidated
      || !state.villaId){
    state.totals = null; state.priceLines = null;
    renderSummary();
    return;
  }

  if (state.inflight.price) state.inflight.price.abort();
  const ctrl = new AbortController();
  state.inflight.price = ctrl;

  const body = {
    villa_id: state.villaId,
    start_date: isoDate(state.checkin),
    end_date: isoDate(state.checkout),
    bedrooms: state.bedrooms,
    guests: state.guests,
    children_under_4: state.children,
    transfer_people: state.transfer,
    late_checkout: state.lateCheckout,
    selected_cars: state.carId
      ? [{ car_id: state.carId, days: daysBetween(state.checkin, state.checkout) }]
      : [],
  };

  try {
    const data = await api('/calculate-price.php', { method: 'POST', body, signal: ctrl.signal });
    state.totals = data.totals || null;
    state.priceLines = data.line_items || [];
    renderSummary();
  } catch (err){
    if (err.name === 'AbortError') return;
    console.error('price calc failed', err);
    showToast(err.message || t('err_generic'), true);
  }
}

function lineLabel(line){
  const map = {
    villa: 'line_villa',
    low_season_nights: 'line_low_season_nights',
    high_season_nights: 'line_high_season_nights',
    cleaning: 'line_cleaning',
    transfer: 'line_transfer',
    car: 'line_car',
    late_checkout: 'line_late_checkout',
  };
  const key = map[line.type];
  if (key && I18N[lang][key]) return I18N[lang][key];
  return line.title || line.label || line.type || '';
}

/* Ensure the selected car shows up in the summary even if the API
 * doesn't return a 'car' line. We compute price_per_day × nights from
 * the cars list and append/repair the line + totals locally.
 *
 * If no car is selected, strip any stale 'car' line locally so the
 * summary updates instantly on deselect, and lower totals to match.
 * The next /calculate-price response will overwrite either way.
 */
function reconcileCarLine(){
  if (!state.carId){
    if (Array.isArray(state.priceLines)){
      const removed = state.priceLines.find(l => l.type === 'car');
      state.priceLines = state.priceLines.filter(l => l.type !== 'car');
      if (removed && state.totals){
        const amt = Number(removed.subtotal_excl_tax || removed.amount_excl_tax || 0);
        const subPrev = Number(state.totals.subtotal_excl_tax || 0);
        const sub = Math.max(0, subPrev - amt);
        const taxRate = subPrev > 0 ? Number(state.totals.tax_total || 0) / subPrev : 0;
        const tax = Math.max(0, Number(state.totals.tax_total || 0) - amt * taxRate);
        state.totals = { ...state.totals, subtotal_excl_tax: sub, tax_total: tax, total_incl_tax: sub + tax };
      }
    }
    return;
  }
  if (!state.checkin || !state.checkout) return;
  const car = (state.cars || []).find(c => Number(c.id) === Number(state.carId));
  if (!car || car.price_per_day == null) return;

  const nights = daysBetween(state.checkin, state.checkout);
  const days = nights > 0 ? nights : 1;
  const expected = Number(car.price_per_day) * days;

  if (!Array.isArray(state.priceLines)) state.priceLines = [];
  let carLine = state.priceLines.find(l => l.type === 'car');

  if (!carLine){
    carLine = {
      type: 'car',
      title: car.title,
      quantity: days,
      subtotal_excl_tax: expected,
      amount_excl_tax: expected,
    };
    state.priceLines.push(carLine);

    if (state.totals){
      const sub = Number(state.totals.subtotal_excl_tax || 0) + expected;
      const taxRate = state.totals.subtotal_excl_tax
        ? Number(state.totals.tax_total || 0) / Number(state.totals.subtotal_excl_tax)
        : 0;
      const tax = Number(state.totals.tax_total || 0) + expected * taxRate;
      state.totals = {
        ...state.totals,
        subtotal_excl_tax: sub,
        tax_total: tax,
        total_incl_tax: sub + tax,
      };
    }
  } else {
    // Title comes from the cars API so the user sees the actual car name.
    carLine.title = car.title;
  }
}

function renderSummary(){
  reconcileCarLine();

  const dates = document.getElementById('summaryDates');
  const lines = document.getElementById('summaryLines');
  const div = document.getElementById('summaryDivider');
  const totalBox = document.getElementById('summaryTotal');
  const totalVal = document.getElementById('summaryTotalValue');
  const preview = document.getElementById('totalPreview');
  if (!dates) return;

  if (state.checkin && state.checkout){
    const n = daysBetween(state.checkin, state.checkout);
    dates.textContent = `${formatDate(state.checkin)} → ${formatDate(state.checkout)} · ${n} ${t('cal_nights')}`;
  } else {
    dates.textContent = t('summary_empty_dates');
  }

  if (!state.priceLines || !state.priceLines.length || !state.totals){
    lines.innerHTML = `<div class="summary-empty">${t('summary_empty')}</div>`;
    div.style.display = 'none';
    totalBox.style.display = 'none';
    preview.textContent = '€ —';
    return;
  }

  lines.innerHTML = state.priceLines.map(l => {
    const amount = l.subtotal_excl_tax != null ? l.subtotal_excl_tax : l.amount_excl_tax;
    const qty = l.quantity > 1 ? ` <span class="qty">× ${l.quantity}</span>` : '';
    return `
      <div class="summary-line">
        <span class="label">${lineLabel(l)}${qty}</span>
        <span class="value">${fmtMoney(amount)}</span>
      </div>`;
  }).join('') + `
    <div class="summary-line">
      <span class="label">${t('subtotal')}</span>
      <span class="value">${fmtMoney(state.totals.subtotal_excl_tax)}</span>
    </div>
    <div class="summary-line">
      <span class="label">${t('tax')}</span>
      <span class="value">${fmtMoney(state.totals.tax_total)}</span>
    </div>`;

  div.style.display = 'block';
  totalBox.style.display = 'flex';
  const total = fmtMoney(state.totals.total_incl_tax);
  totalVal.textContent = total;
  preview.textContent = total;
}

/* ==========================================================
   CAR GRID — real photos
   Priority: 1) image_url from the API (specific to this car)
             2) keyword-matched stock photo (sedan / SUV / etc.)
             3) index-based fallback so all 4 cards stay distinct
   ========================================================== */
const CAR_IMAGES = [
  // Distinct REAL car photos for the index-based fallback.
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80', // hatchback
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // sedan
  'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80', // SUV
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80', // convertible
];

const NOCAR_ICON = `
  <svg class="nocar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
`;

function carImageFor(car, index){
  // 1) Use whatever the API returned for this specific car.
  const fromApi = car.image_url || car.photo_url || car.image || car.photo || car.thumbnail;
  if (fromApi) return fromApi;

  // 2) Keyword match against the title — common Curaçao rentals included.
  const t = (car.title || '').toLowerCase();
  if (/\b(jeep|suv|wrangler|rav|x-?trail|patrol|land\s?cruiser|landcruiser|jimny|duster|vitara|terios)\b/.test(t)) return CAR_IMAGES[2];
  if (/\b(convertible|cabrio|spider|roadster|mustang|miata|sport)\b/.test(t)) return CAR_IMAGES[3];
  if (/\b(sedan|corolla|civic|accent|elantra|altima|camry|swift\s?dzire|city|cerato)\b/.test(t)) return CAR_IMAGES[1];
  if (/\b(compact|hatch|hatchback|picanto|aygo|panda|i10|i20|up|swift|alto|celerio|yaris|fit)\b/.test(t)) return CAR_IMAGES[0];

  // 3) Index fallback so each of the 4 cards still shows a different photo.
  return CAR_IMAGES[index % CAR_IMAGES.length];
}

function updateCarGrid(cars){
  const grid = document.getElementById('carGrid');
  if (!grid) return;
  grid.innerHTML = '';
  grid.appendChild(carCard({ id: 0, title: t('nocar'), price_per_day: null, nocar: true }, -1));
  (cars || []).forEach((c, i) => grid.appendChild(carCard(c, i)));
  grid.querySelectorAll('.car-card').forEach(card => {
    card.classList.toggle('selected', Number(card.dataset.id) === state.carId);
  });
}

function carCard(c, index){
  const card = document.createElement('div');
  card.className = 'car-card' + (c.nocar ? ' nocar' : '');
  card.dataset.id = c.id;
  const priceTxt = c.price_per_day != null
    ? fmtMoney(c.price_per_day) + ' / ' + (lang === 'nl' ? 'dag' : 'day')
    : '—';
  const imgUrl = c.nocar ? '' : carImageFor(c, index);
  card.innerHTML = `
    <div class="car-img">
      ${c.nocar ? NOCAR_ICON : `<img src="${imgUrl}" alt="${c.title || ''}" loading="lazy" />`}
    </div>
    <div class="car-name">${c.title}</div>
    <div class="car-price">${priceTxt}</div>
    <div class="car-check">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  `;
  card.addEventListener('click', () => {
    // Toggle: clicking the selected car deselects it (falls back to id 0,
    // i.e. the "no car" tile). Clicking "no car" always commits to no car.
    if (c.nocar){
      state.carId = 0;
    } else {
      state.carId = (state.carId === c.id) ? 0 : c.id;
    }
    updateCarGrid(state.cars);
    refreshPrice();
    renderSummary();
  });
  return card;
}

async function loadCars(){
  try {
    const data = await api('/cars.php');
    state.cars = data.cars || [];
    updateCarGrid(state.cars);
  } catch (err){
    console.error('cars load failed', err);
    showToast(err.message || t('err_generic'), true);
  }
}

/* ==========================================================
   SUBMISSION (Step 3 → Step 4)
   ========================================================== */
async function submitBooking(){
  const btn = document.getElementById('submitBooking');
  const agree = document.querySelector('.check-row[data-agree]').classList.contains('selected');
  const phoneCountry = document.getElementById('phoneCountry').value;
  const phoneLocal   = document.getElementById('phone').value.trim();
  const c = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName:  document.getElementById('lastName').value.trim(),
    addr:      document.getElementById('addr').value.trim(),
    zip:       document.getElementById('zip').value.trim(),
    city:      document.getElementById('city').value.trim(),
    country:   document.getElementById('country').value.trim(),
    phone:     phoneLocal ? `${phoneCountry} ${phoneLocal}` : '',
    email:     document.getElementById('email').value.trim(),
    comment:   document.getElementById('comment').value.trim(),
  };

  const required = ['firstName','lastName','addr','zip','city','phone','email'];
  let valid = true;
  required.forEach(k => {
    const id = (k === 'phone') ? 'phone' : k;
    const el = document.getElementById(id);
    el.closest('.field').classList.toggle('error', !c[k]);
    if (!c[k]) valid = false;
  });
  if (c.email && !/.+@.+\..+/.test(c.email)){
    document.getElementById('email').closest('.field').classList.add('error');
    valid = false;
  }
  // Phone must have between PHONE_MIN and PHONE_MAX digits.
  const phoneDigits = phoneLocal.replace(/\D/g, '');
  if (phoneDigits.length < PHONE_MIN || phoneDigits.length > PHONE_MAX){
    document.getElementById('phone').closest('.field').classList.add('error');
    valid = false;
  }
  if (!agree){ showToast(t('err_form_incomplete'), true); return; }
  if (!valid){ showToast(t('err_form_incomplete'), true); return; }

  if (!state.villaId || !state.datesValidated){
    showToast(t('err_unavailable'), true);
    return;
  }

  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const recheck = await api('/availability.php', {
      params: { start_date: isoDate(state.checkin), end_date: isoDate(state.checkout) }
    });
    if (!recheck.available){
      state.datesValidated = false;
      validateStep1();
      showAltBanner(recheck.alternatives);
      goToStep(1);
      showToast(t('err_unavailable'), true);
      return;
    }
    if (recheck.recommended_villa) state.villaId = recheck.recommended_villa;

    const payload = {
      villa_id: state.villaId,
      start_date: isoDate(state.checkin),
      end_date:   isoDate(state.checkout),
      bedrooms:   state.bedrooms,
      guests:     state.guests,
      children_under_4: state.children,
      transfer_people: state.transfer,
      late_checkout: state.lateCheckout,
      name:    `${c.firstName} ${c.lastName}`,
      email:   c.email,
      phone:   c.phone,
      address: c.addr,
      zipcode: c.zip,
      city:    c.city,
      country: c.country,
      comment: c.comment,
      notes:   '',
      source:  'website',
      language: lang,
      selected_cars: state.carId
        ? [{ car_id: state.carId, days: daysBetween(state.checkin, state.checkout) }]
        : [],
    };

    track('booking_submitted', { total: state.totals && state.totals.total_incl_tax });
    const data = await api('/reservations.php', { method: 'POST', body: payload });
    track('booking_success', { reservation_id: data.reservation_id });

    const idEl = document.getElementById('reservationId');
    const idVal = document.getElementById('reservationIdVal');
    if (data.reservation_id != null){
      idVal.textContent = data.reservation_id;
      idEl.style.display = 'inline-flex';
    }
    goToStep(4);
  } catch (err){
    console.error('reservation failed', err);
    track('booking_failed', { error: err.message });
    showToast(err.message || t('booking_failed'), true);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/* ==========================================================
   TOAST
   ========================================================== */
let toastTimer;
function showToast(msg, isError = false){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ==========================================================
   DATE INPUT DISPLAY  (mirrors into landing search bar + step 1)
   ========================================================== */
function applyDateInputs(){
  const arr = state.checkin  ? formatDate(state.checkin)  : '';
  const dep = state.checkout ? formatDate(state.checkout) : '';
  const sa = document.getElementById('summaryArrival');
  const sd = document.getElementById('summaryDeparture');
  if (sa) sa.textContent = arr || '—';
  if (sd) sd.textContent = dep || '—';
}

function syncStaySummary(){
  applyDateInputs();
}

/* ==========================================================
   LANDING SEARCH BAR
   ========================================================== */
function setActiveSegment(seg){
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('has-active', !!seg);
  ['arrival','departure','guests','bedrooms'].forEach(s => {
    const el = document.getElementById('seg' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) el.classList.toggle('active', s === seg);
  });
}
function closeAllPops(){
  ['popCal','popGuests','popBedrooms'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  });
  restoreInlineCalendar();
}

/* When the calendar has been moved inside the panel (via "Edit" on the
 * stay-summary), put it back where it belongs and strip the inline class. */
function restoreInlineCalendar(){
  const pop = document.getElementById('popCal');
  if (!pop || !pop.classList.contains('pop-cal--inline')) return;
  pop.classList.remove('pop-cal--inline');
  const wrap = document.querySelector('.search-wrap');
  if (wrap) wrap.appendChild(pop);
}

/* Open the calendar INSIDE the panel (anchored under the stay-summary)
 * so the user can edit dates without losing their booking-flow context. */
async function openCalendarInPanel(mode){
  const pop = document.getElementById('popCal');
  const host = document.getElementById('inlineCalHost');
  if (!pop || !host) return;
  host.appendChild(pop);
  pop.classList.add('pop-cal--inline');
  pop.classList.add('open');

  cal.pickingMode = mode;
  const today = stripTime(new Date());
  const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const anchor = state.checkin || cal.view || today;
  cal.view = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  if (cal.view < firstOfThisMonth) cal.view = firstOfThisMonth;
  cal.draft.start = state.checkin;
  cal.draft.end = state.checkout;
  renderCalendar();
  await ensureAvailabilityLoaded(cal.view);
  pop.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateSearchBarLabels(){
  const arrEl = document.getElementById('segArrivalVal');
  const depEl = document.getElementById('segDepartureVal');
  const gEl   = document.getElementById('segGuestsVal');
  const bEl   = document.getElementById('segBedroomsVal');
  if (!arrEl) return;

  if (state.checkin){
    arrEl.textContent = formatDateShort(state.checkin);
    arrEl.classList.remove('placeholder');
  } else {
    arrEl.textContent = t('add_date');
    arrEl.classList.add('placeholder');
  }
  if (state.checkout){
    depEl.textContent = formatDateShort(state.checkout);
    depEl.classList.remove('placeholder');
  } else {
    depEl.textContent = t('add_date');
    depEl.classList.add('placeholder');
  }
  const totalGuests = state.guests + state.children;
  const gWord = totalGuests === 1 ? t('guest_word') : t('guests_word');
  gEl.textContent = `${totalGuests} ${gWord}`;
  const bWord = state.bedrooms === 1 ? t('bedroom_word') : t('bedrooms_word');
  bEl.textContent = `${state.bedrooms} ${bWord}`;
}

/* ==========================================================
   CUSTOM DROPDOWN  (Guests / Children / Bedrooms in the panel)
   Replaces the native <select> with a styled menu that matches
   the input's border-radius and supports a "custom number" row.
   The original <select> stays in the DOM (hidden) so existing
   reads (.value) and change handlers keep working unchanged.
   ========================================================== */
function attachCustomDropdown(selectEl, opts = {}){
  const { allowCustom = true, customMin = 1, customMax = 99, customPlaceholder = 'Custom', goLabel = 'OK', wrapClass = '' } = opts;

  const field = selectEl.closest('.field') || selectEl.parentNode;
  selectEl.style.display = 'none';

  const wrap = document.createElement('div');
  wrap.className = 'cdd' + (wrapClass ? ' ' + wrapClass : '');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cdd-trigger';
  trigger.innerHTML = `
    <span class="cdd-value"></span>
    <svg class="cdd-arrow" viewBox="0 0 14 8" fill="none">
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1l6 6 6-6"/>
    </svg>
  `;

  const menu = document.createElement('div');
  menu.className = 'cdd-menu';
  const list = document.createElement('div');
  list.className = 'cdd-list';
  menu.appendChild(list);

  let customRow = null;
  if (allowCustom){
    customRow = document.createElement('div');
    customRow.className = 'cdd-custom';
    customRow.innerHTML = `
      <input type="number" inputmode="numeric" min="${customMin}" max="${customMax}" placeholder="${customPlaceholder}" />
      <button type="button" class="cdd-custom-go">${goLabel}</button>
    `;
    menu.appendChild(customRow);

    const input = customRow.querySelector('input');
    const go    = customRow.querySelector('.cdd-custom-go');
    const submit = () => {
      const raw = parseInt(input.value, 10);
      if (isNaN(raw)) return;
      const n = Math.max(customMin, Math.min(customMax, raw));
      setValue(String(n));
      input.value = '';
      close();
    };
    go.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){ e.preventDefault(); submit(); }
    });
    input.addEventListener('click', (e) => e.stopPropagation());
  }

  function renderList(){
    list.innerHTML = '';
    Array.from(selectEl.options).forEach(opt => {
      if (opt.hidden || opt.disabled) return;
      const li = document.createElement('div');
      li.className = 'cdd-item';
      li.textContent = opt.textContent;
      if (opt.value === selectEl.value) li.classList.add('selected');
      li.addEventListener('click', () => {
        setValue(opt.value);
        close();
      });
      list.appendChild(li);
    });
  }

  function setValue(v){
    // If the value isn't already an option, append it (covers custom entries)
    if (![...selectEl.options].some(o => o.value === String(v))){
      const newOpt = document.createElement('option');
      newOpt.value = String(v);
      newOpt.textContent = String(v);
      newOpt.dataset.custom = '1';
      selectEl.appendChild(newOpt);
    }
    selectEl.value = String(v);
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    syncDisplay();
  }

  function syncDisplay(){
    const opt = selectEl.options[selectEl.selectedIndex];
    trigger.querySelector('.cdd-value').textContent = opt ? opt.textContent : '';
  }

  function open(){
    renderList();
    wrap.classList.add('open');
  }
  function close(){ wrap.classList.remove('open'); }
  function toggle(){ wrap.classList.contains('open') ? close() : open(); }

  trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });

  wrap.appendChild(trigger);
  wrap.appendChild(menu);
  // Insert the wrap right BEFORE the now-hidden select so the floating
  // .field label still anchors visually above our trigger.
  selectEl.parentNode.insertBefore(wrap, selectEl);

  syncDisplay();

  // Expose for programmatic refresh (e.g. when value is set elsewhere).
  selectEl.__cddSync = syncDisplay;
  selectEl.__cddRefresh = renderList;

  return { syncDisplay, refresh: renderList };
}

function updateStepperButtons(){
  const minB = minBedroomsFor(state.guests);
  const guestsMin = 1, guestsMax = 8;
  const childrenMin = 0, childrenMax = 3;
  const bedroomsMax = 4;

  document.querySelectorAll('.stepper-btn').forEach(b => {
    const which = b.dataset.step;
    const dir = parseInt(b.dataset.dir, 10);
    if (which === 'guests'){
      b.disabled = (dir < 0 && state.guests <= guestsMin) || (dir > 0 && state.guests >= guestsMax);
    } else if (which === 'children'){
      b.disabled = (dir < 0 && state.children <= childrenMin) || (dir > 0 && state.children >= childrenMax);
    } else if (which === 'bedrooms'){
      b.disabled = (dir < 0 && state.bedrooms <= minB) || (dir > 0 && state.bedrooms >= bedroomsMax);
    }
  });
}

function bumpStepper(which, dir){
  if (which === 'guests'){
    const v = Math.min(8, Math.max(1, state.guests + dir));
    if (v === state.guests) return;
    state.guests = v;
    document.getElementById('stepGuests').textContent = v;
    const sel = document.getElementById('guestsSel');
    sel.value = String(v);
    if (sel.__cddSync) sel.__cddSync();
    updateBedroomOptions();
  } else if (which === 'children'){
    const v = Math.min(3, Math.max(0, state.children + dir));
    if (v === state.children) return;
    state.children = v;
    document.getElementById('stepChildren').textContent = v;
    const sel = document.getElementById('childrenSel');
    sel.value = String(v);
    if (sel.__cddSync) sel.__cddSync();
  } else if (which === 'bedrooms'){
    const minB = minBedroomsFor(state.guests);
    const v = Math.min(4, Math.max(minB, state.bedrooms + dir));
    if (v === state.bedrooms) return;
    state.bedrooms = v;
    document.getElementById('stepBedrooms').textContent = v;
    const sel = document.getElementById('bedroomsSel');
    sel.value = String(v);
    if (sel.__cddSync) sel.__cddSync();
  }
  updateSearchBarLabels();
  updateStepperButtons();
  refreshPrice();
}

/* ==========================================================
   EVENT WIRING
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Language toggles (both landing + panel share the same data-lang buttons)
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      document.querySelectorAll('.lang-toggle button').forEach(x => {
        x.classList.toggle('active', x.dataset.lang === lang);
      });
      applyI18n();
      renderSummary();
    });
  });

  // Panel close
  document.getElementById('panelClose').addEventListener('click', () => {
    if (state.step === 4){ location.reload(); return; }
    if (confirm(lang === 'nl' ? 'Sluiten en terug naar zoeken?' : 'Close and return to search?')){
      closePanel();
    }
  });
  document.getElementById('panelOverlay').addEventListener('click', closePanel);

  // ---- LANDING SEARCH BAR ----
  // Click a segment again to close its popup. For Arrival/Departure (which
  // share popCal) only close when the SAME picking mode is active — otherwise
  // switch the mode (lets user jump arrival ↔ departure without closing).
  document.getElementById('segArrival').addEventListener('click', (e) => {
    e.stopPropagation();
    const calOpen = document.getElementById('popCal').classList.contains('open');
    if (calOpen && cal.pickingMode === 'arrival'){
      closeAllPops();
      setActiveSegment(null);
      return;
    }
    openCalendarFor('arrival');
  });
  document.getElementById('segDeparture').addEventListener('click', (e) => {
    e.stopPropagation();
    const calOpen = document.getElementById('popCal').classList.contains('open');
    if (calOpen && cal.pickingMode === 'departure'){
      closeAllPops();
      setActiveSegment(null);
      return;
    }
    openCalendarFor('departure');
  });
  document.getElementById('segGuests').addEventListener('click', (e) => {
    e.stopPropagation();
    if (document.getElementById('popGuests').classList.contains('open')){
      closeAllPops();
      setActiveSegment(null);
      return;
    }
    closeAllPops();
    document.getElementById('popGuests').classList.add('open');
    setActiveSegment('guests');
    positionPop('popGuests', 'guests');
    updateStepperButtons();
  });
  document.getElementById('segBedrooms').addEventListener('click', (e) => {
    e.stopPropagation();
    if (document.getElementById('popBedrooms').classList.contains('open')){
      closeAllPops();
      setActiveSegment(null);
      return;
    }
    closeAllPops();
    document.getElementById('popBedrooms').classList.add('open');
    setActiveSegment('bedrooms');
    positionPop('popBedrooms', 'bedrooms');
    updateStepperButtons();
  });

  // Stepper +/- buttons
  document.querySelectorAll('.stepper-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      bumpStepper(b.dataset.step, parseInt(b.dataset.dir, 10));
    });
  });

  // Calendar nav buttons
  document.getElementById('calPrev').addEventListener('click', async (e) => {
    e.stopPropagation();
    const today = stripTime(new Date());
    const prev = new Date(cal.view.getFullYear(), cal.view.getMonth() - 1, 1);
    if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    cal.view = prev;
    renderCalendar();
    await ensureAvailabilityLoaded(cal.view);
  });
  document.getElementById('calNext').addEventListener('click', async (e) => {
    e.stopPropagation();
    cal.view = new Date(cal.view.getFullYear(), cal.view.getMonth() + 1, 1);
    renderCalendar();
    await ensureAvailabilityLoaded(cal.view);
  });
  document.getElementById('calClear').addEventListener('click', (e) => {
    e.stopPropagation();
    cal.draft.start = null;
    cal.draft.end = null;
    state.checkin = null;
    state.checkout = null;
    state.datesValidated = false;
    cal.pickingMode = 'arrival';
    setActiveSegment('arrival');
    applyDateInputs();
    updateSearchBarLabels();
    renderCalendar();
    validateStep1();
  });

  // Click outside any popover closes it
  document.addEventListener('click', (e) => {
    const inBar = e.target.closest('#searchBar');
    const inPop = e.target.closest('.search-pop');
    if (inBar || inPop) return;
    closeAllPops();
    setActiveSegment(null);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      closeAllPops();
      setActiveSegment(null);
    }
  });

  // Re-anchor any open search-bar popover if the viewport changes.
  window.addEventListener('resize', () => {
    const cp = document.getElementById('popCal');
    if (cp && cp.classList.contains('open')) positionPop('popCal', cal.pickingMode);
    const gp = document.getElementById('popGuests');
    if (gp && gp.classList.contains('open')) positionPop('popGuests', 'guests');
    const bp = document.getElementById('popBedrooms');
    if (bp && bp.classList.contains('open')) positionPop('popBedrooms', 'bedrooms');
  });

  // ---- SEARCH BUTTON: validate dates and open the panel ----
  document.getElementById('searchBtn').addEventListener('click', async () => {
    const btn = document.getElementById('searchBtn');
    if (!state.checkin || !state.checkout){
      showToast(t('err_dates_required'), true);
      openCalendarFor(state.checkin ? 'departure' : 'arrival');
      return;
    }
    const nights = daysBetween(state.checkin, state.checkout);
    if (nights < state.minimumStayNights){
      showToast(t('err_min_stay'), true);
      openCalendarFor('departure');
      return;
    }
    btn.classList.add('loading');
    try {
      if (!state.datesValidated){
        await validateDates();
      }
      if (!state.datesValidated){
        // Alternative banner is now shown on the landing.
        return;
      }
      // Pre-load cars while the panel slides in.
      if (!state.cars.length) loadCars();
      track('booking_options_selected', { guests: state.guests, bedrooms: state.bedrooms });
      openPanel();
    } finally {
      btn.classList.remove('loading');
    }
  });

  // ---- PANEL Step-1 ----
  // Click an Arrival/Departure tile: toggles the inline calendar.
  //  - Same tile clicked again → close.
  //  - Other tile clicked while open → switch picking mode (don't reopen).
  //  - Otherwise → open the calendar in that mode.
  // stopPropagation prevents the global "click outside .search-pop closes
  // the popover" handler from firing on the same click and undoing us.
  function toggleInlineCalendar(mode){
    const pop = document.getElementById('popCal');
    const isOpenInline = pop.classList.contains('open') && pop.classList.contains('pop-cal--inline');
    if (isOpenInline && cal.pickingMode === mode){
      closeAllPops();
      return;
    }
    if (isOpenInline){
      cal.pickingMode = mode;
      renderCalendar();
      return;
    }
    openCalendarInPanel(mode);
  }
  document.querySelectorAll('.stay-summary [data-edit-mode]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInlineCalendar(el.dataset.editMode);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        e.stopPropagation();
        toggleInlineCalendar(el.dataset.editMode);
      }
    });
  });

  document.getElementById('guestsSel').addEventListener('change', e => {
    state.guests = parseInt(e.target.value, 10);
    document.getElementById('stepGuests').textContent = state.guests;
    updateBedroomOptions();
    updateSearchBarLabels();
    refreshPrice();
  });
  document.getElementById('childrenSel').addEventListener('change', e => {
    state.children = parseInt(e.target.value, 10);
    document.getElementById('stepChildren').textContent = state.children;
    updateSearchBarLabels();
    refreshPrice();
  });
  document.getElementById('bedroomsSel').addEventListener('change', e => {
    state.bedrooms = parseInt(e.target.value, 10);
    document.getElementById('stepBedrooms').textContent = state.bedrooms;
    updateSearchBarLabels();
    refreshPrice();
  });
  document.getElementById('transferSel').addEventListener('change', e => {
    state.transfer = parseInt(e.target.value, 10);
    refreshPrice();
  });

  document.querySelectorAll('.check-row[data-checkout]').forEach(row => {
    row.addEventListener('click', () => {
      document.querySelectorAll('.check-row[data-checkout]').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      state.lateCheckout = row.dataset.checkout === 'late';
      refreshPrice();
    });
  });

  document.querySelectorAll('.check-row[data-agree]').forEach(row => {
    row.addEventListener('click', () => row.classList.toggle('selected'));
  });

  document.getElementById('toStep2').addEventListener('click', async () => {
    if (!state.checkin || !state.checkout){ showToast(t('err_dates_required'), true); return; }
    if (!state.datesValidated){ showToast(t('err_unavailable'), true); return; }
    if (!state.cars.length) await loadCars();
    goToStep(2);
  });
  document.getElementById('toStep3').addEventListener('click', () => goToStep(3));
  document.querySelectorAll('[data-prev]').forEach(b => {
    b.addEventListener('click', () => goToStep(parseInt(b.dataset.prev, 10)));
  });
  document.getElementById('submitBooking').addEventListener('click', submitBooking);

  document.getElementById('summaryToggle').addEventListener('click', () => {
    const aside = document.getElementById('aside');
    const open = aside.classList.toggle('open');
    document.getElementById('summaryToggle').setAttribute('aria-expanded', open);
  });

  // Custom dropdowns for the panel selects (Guests / Children / Bedrooms).
  // Attach BEFORE updateBedroomOptions() so __cddSync exists when called.
  attachCustomDropdown(document.getElementById('guestsSel'),  { customMin: 1, customMax: 20, customPlaceholder: lang === 'nl' ? 'Aangepast' : 'Custom', goLabel: lang === 'nl' ? 'OK' : 'OK' });
  attachCustomDropdown(document.getElementById('childrenSel'),{ customMin: 0, customMax: 10, customPlaceholder: lang === 'nl' ? 'Aangepast' : 'Custom' });
  attachCustomDropdown(document.getElementById('bedroomsSel'),{ customMin: 1, customMax: 20, customPlaceholder: lang === 'nl' ? 'Aangepast' : 'Custom' });
  attachCustomDropdown(document.getElementById('transferSel'), { customMin: 0, customMax: 20, customPlaceholder: lang === 'nl' ? 'Aangepast' : 'Custom' });
  attachCustomDropdown(document.getElementById('country'),     { allowCustom: false });
  attachCustomDropdown(document.getElementById('phoneCountry'),{ allowCustom: false, wrapClass: 'cdd-phone' });

  // Init
  updateBedroomOptions();
  applyI18n();
  updateSearchBarLabels();
  renderCalendarWeekdays();
  // Phone digit limit (depends on selected dial-code)
  initPhoneLimit();
  track('booking_opened', { lang });
});

/* ==========================================================
   PHONE — global digit limits (min 9, max 11)
   Cap typing at PHONE_MAX as the user types; min length is
   enforced on submit. Non-digit characters are stripped.
   ========================================================== */
const PHONE_MIN = 9;
const PHONE_MAX = 11;

function applyPhoneLimit(){
  const phone = document.getElementById('phone');
  if (!phone) return;
  phone.dataset.maxDigits = String(PHONE_MAX);
  phone.dataset.minDigits = String(PHONE_MIN);
  // Trim if anything is over the cap.
  const digits = phone.value.replace(/\D/g, '').slice(0, PHONE_MAX);
  phone.value = digits;
}
function onPhoneInput(e){
  const digits = e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX);
  e.target.value = digits;
}
function initPhoneLimit(){
  const country = document.getElementById('phoneCountry');
  const phone   = document.getElementById('phone');
  if (!country || !phone) return;
  applyPhoneLimit();
  country.addEventListener('change', applyPhoneLimit);
  phone.addEventListener('input', onPhoneInput);
}
