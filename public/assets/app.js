const api = async (action, options = {}) => {
  const method = options.method || 'GET';
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json', 'X-CSRF-Token': window.KQ.csrf } : {}) };
  const [endpoint, query = ''] = action.split('&', 2);
  const response = await fetch(`api.php?action=${encodeURIComponent(endpoint)}${query ? `&${query}` : ''}`, {
    method, headers, body: options.body ? JSON.stringify(options.body) : undefined, credentials: 'same-origin'
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || 'Request failed.');
  return json.data;
};
const peso = cents => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format((Number(cents) || 0) / 100);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const message = (text, bad = false) => { const el = document.querySelector('#message'); el.textContent = text; el.className = `notice${bad ? ' error' : ''}`; window.scrollTo({ top: 0, behavior: 'smooth' }); };
const packageImage = name => ({ 'Simple Styling':'simple-styling.jpg','Package A':'package-a.jpg','Package B':'package-b.jpg','Package C':'package-c.jpg','Package D':'package-d.jpg','Package E':'package-e.jpg' }[name] || 'package-a.jpg');
const cityLabel = city => city.province && city.province !== city.region ? `${city.name}, ${city.province} — ${city.region}` : `${city.name} — ${city.region}`;
const radians = degrees => degrees * Math.PI / 180;
function distanceKm(city) {
  const origin = { lat:14.75054, lng:121.05406 };
  const lat1=radians(origin.lat), lat2=radians(city.lat), dLat=radians(city.lat-origin.lat), dLng=radians(city.lng-origin.lng);
  const a=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return Math.round((6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))*10)/10;
}
const travelFeeCents = km => Math.ceil((km * 20) / 100) * 100 * 100;

function fillPackages() {
  const select=document.querySelector('#package_id');
  select.innerHTML='<option value="">Choose a package</option>'+KQ.packages.map(p=>`<option value="${Number(p.id)}">${escapeHtml(p.name)} - ${peso(p.price_cents)}</option>`).join('');
  document.querySelector('#packageCards').innerHTML=KQ.packages.map(p=>`<article class="package-card"><img src="assets/packages/${packageImage(p.name)}" alt="${escapeHtml(p.name)} sample setup" loading="lazy"><div class="package-card-body"><span class="package-tag">${p.full_day?'BIG · FULL-DAY WHEN APPROVED':'SIMPLE'}</span><h3>${escapeHtml(p.name)}</h3><p class="price">${peso(p.price_cents)}</p><p>${escapeHtml(p.description)}</p><button type="button" data-select-package="${Number(p.id)}">Choose this package</button></div></article>`).join('');
}
function fillCities() {
  const list=document.querySelector('#cityOptions');
  list.innerHTML=KQ.cities.map(city=>`<option value="${escapeHtml(cityLabel(city))}"></option>`).join('');
}
function findCity(label) { const needle=String(label||'').trim().toLocaleLowerCase('en-PH'); return KQ.cities.find(city=>cityLabel(city).toLocaleLowerCase('en-PH')===needle); }
function updateBookingEstimate() {
  const p=KQ.packages.find(item=>Number(item.id)===Number(document.querySelector('#package_id').value));
  const city=findCity(document.querySelector('#venue_city').value);
  const packageAmount=p?Number(p.price_cents):0;
  const km=city?distanceKm(city):null;
  const travel=km===null?0:travelFeeCents(km);
  const total=packageAmount+travel;
  document.querySelector('#packageAmount').textContent=p?peso(packageAmount):'Choose a package';
  document.querySelector('#travelAmount').textContent=city?peso(travel):'Choose venue city';
  document.querySelector('#totalAmount').textContent=p&&city?peso(total):'—';
  document.querySelector('#depositAmount').textContent=p&&city?peso(Math.round(total*.3)):'—';
  document.querySelector('#travelEstimate').textContent=city?`${km.toFixed(1)} km estimated from North Caloocan · travel cost is rounded up to the next ₱100.`:'Choose a Luzon city or municipality from the list.';
}
function updateInspectionFee() {
  const city=findCity(document.querySelector('#ocular_city').value);
  document.querySelector('#inspectionFee').textContent=city?`Estimated fee: ${peso(Math.ceil((1500+distanceKm(city)*20)/100)*100*100)}`:'Choose a venue city to calculate the fee.';
}
function setUserSections() {
  const user=KQ.user, admin=user?.role==='admin';
  document.querySelector('[data-user]').textContent=user?`${user.name} (${user.role})`:'Guest';
  document.querySelector('#auth').hidden=Boolean(user);
  document.querySelector('#signout').hidden=!user;
  document.querySelector('#booking').hidden=!user||admin;
  document.querySelector('#account').hidden=!user||admin;
  document.querySelector('#ocular').hidden=!user||admin;
  document.querySelector('#design-estimate').hidden=!user||admin;
  document.querySelector('#admin').hidden=!admin;
  if (user && !admin) {
    document.querySelector('#booking_phone').value=user.phone||'';
    for (const form of [document.querySelector('#profileForm'),document.querySelector('#ocularForm')]) {
      if (form.elements.name) form.elements.name.value=user.name;
      if (form.elements.contact_name) form.elements.contact_name.value=user.name;
      if (form.elements.email) form.elements.email.value=user.email;
      if (form.elements.phone) form.elements.phone.value=user.phone||'';
    }
  }
}
async function loadAvailability() {
  const date=document.querySelector('#event_date').value;
  if (!date) return;
  try {
    const data=await api(`availability&event_date=${encodeURIComponent(date)}`);
    document.querySelector('#slot').innerHTML=data.available_slots.length?'<option value="">Choose a time slot</option>'+data.available_slots.map(slot=>`<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join(''):'<option value="">No slots available</option>';
  } catch(error) { message(error.message,true); }
}
async function loadBookings() {
  const [rows,payments,changes]=await Promise.all([api('bookings'),api('payment'),api('changes&mine=1').catch(()=>[])]);
  const latestPayment=new Map(); payments.forEach(payment=>{ if(!latestPayment.has(Number(payment.booking_id)))latestPayment.set(Number(payment.booking_id),payment); });
  document.querySelector('#bookingRows').innerHTML=rows.length?rows.map(b=>{
    const payment=latestPayment.get(Number(b.id)); const paid=payments.filter(p=>Number(p.booking_id)===Number(b.id)&&p.status==='verified').reduce((sum,p)=>sum+Number(p.amount_cents),0); const changePending=changes.some(c=>Number(c.booking_id)===Number(b.id)&&c.status==='pending');
    const active=['pending','approved'].includes(b.status);
    const paymentDue=Math.max(0,Number(b.total_cents)-paid); const payable=b.status==='pending'?Math.max(0,Number(b.deposit_cents)-paid):paymentDue; const paymentAction=active&&payment?.status!=='pending'&&payable>0?`<button data-payment-submit="${Number(b.id)}|${payable}">Add payment reference</button>`:'';
    const changeActions=active&&!changePending?`<button data-change-request="${Number(b.id)}|cancel">Request cancellation</button><button data-change-request="${Number(b.id)}|reschedule">Request reschedule</button>`:'';
    return `<tr><td>${escapeHtml(b.event_type||'Event')}<small>${escapeHtml(b.venue_city||'')}</small></td><td>${escapeHtml(b.event_date)} ${escapeHtml(b.event_time||b.slot)}</td><td>${escapeHtml(b.package_name)}</td><td>${escapeHtml(b.status)}</td><td>${peso(b.total_cents)}<small>Paid ${peso(paid)} · Due ${peso(paymentDue)}</small></td><td>${payment?`${escapeHtml(payment.status)}<small>${escapeHtml(payment.reference)}</small>`:'Not submitted'}</td><td>${paymentAction}${changePending?'<small>Change request pending</small>':''}${changeActions}</td></tr>`;
  }).join(''):'<tr><td colspan="7">No booking requests yet.</td></tr>';
}
async function loadNotifications() {
  const items=await api('notifications');
  document.querySelector('#notificationRows').innerHTML=items.length?items.map(item=>`<li><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.message)} · ${escapeHtml(item.created_at)} ${item.read_at?'':'<button data-notification="'+Number(item.id)+'">Mark read</button>'}</small></li>`).join(''):'<li>No notifications yet.</li>';
}
async function loadOcular() {
  const rows=await api('ocular');
  document.querySelector('#ocularRows').innerHTML=rows.length?rows.map(item=>`<tr><td>${escapeHtml(item.request_code)}</td><td>${escapeHtml(item.venue_name)}, ${escapeHtml(item.venue_city)}</td><td>${escapeHtml(item.inspection_date)} ${escapeHtml(item.inspection_time)}</td><td>${peso(item.fee_cents)}</td><td>${escapeHtml(item.payment_reference)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.admin_notes)}</td></tr>`).join(''):'<tr><td colspan="7">No ocular inspection requests.</td></tr>';
}
function renderAdminCalendar(bookings) {
  const input=document.querySelector('#calendarMonth');
  if(!input.value)input.value=new Date().toLocaleDateString('sv-SE').slice(0,7);
  const [year,month]=input.value.split('-').map(Number);
  const first=new Date(year,month-1,1),days=new Date(year,month,0).getDate(),offset=(first.getDay()+6)%7;
  const cells=Array.from({length:offset},()=>'<div class="calendar-cell blank" aria-hidden="true"></div>');
  for(let day=1;day<=days;day++){
    const date=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const items=bookings.filter(item=>item.event_date===date);
    cells.push(`<div class="calendar-cell"><strong>${day}</strong>${items.map(item=>`<div class="calendar-event"><b>${escapeHtml(item.event_time||item.slot)}</b> · ${escapeHtml(item.event_type||item.package_name)}<small>${escapeHtml(item.customer_name)} · ${escapeHtml(item.status)}</small></div>`).join('')}</div>`);
  }
  while(cells.length%7)cells.push('<div class="calendar-cell blank" aria-hidden="true"></div>');
  document.querySelector('#adminCalendar').innerHTML=cells.join('');
}
async function loadAdmin() {
  const selectedMonth=document.querySelector('#financeMonth').value||new Date().toISOString().slice(0,7);
  const [stats,bookings,changes,payments,inspections,inventory,expenses]=await Promise.all([api(`dashboard&month=${encodeURIComponent(selectedMonth)}`),api('bookings'),api('changes'),api('payment'),api('ocular'),api('inventory'),api('expenses')]);
  document.querySelector('#financeMonth').value=stats.report_month;
  const statKeys=['pending_bookings','pending_payments','pending_changes','pending_inspections','revenue_cents','expenses_cents','inventory_items'];
  document.querySelector('#stats').innerHTML=statKeys.map(key=>`<div class="stat-card"><strong>${escapeHtml(key.replaceAll('_',' '))}</strong><span>${key.endsWith('_cents')?peso(stats[key]):Number(stats[key])}</span></div>`).join('');
  document.querySelector('#financeSummary').innerHTML=`<div><small>Approved-event income</small><strong>${peso(stats.month_income_cents)}</strong></div><div><small>Recorded expenses</small><strong>${peso(stats.month_expenses_cents)}</strong></div><div><small>Net for ${escapeHtml(stats.report_month)}</small><strong>${peso(stats.month_net_cents)}</strong></div>`;
  const maxNet=Math.max(1,...stats.monthly_finance.map(item=>Math.abs(Number(item.net_cents))));
  const reportYear=Number(stats.report_month.slice(0,4));
  document.querySelector('#monthlyFinance').innerHTML=stats.monthly_finance.map(item=>{const label=new Intl.DateTimeFormat('en-PH',{month:'short'}).format(new Date(reportYear,item.month-1,1));const height=item.net_cents===0?2:Math.max(4,Math.abs(item.net_cents)/maxNet*100);return `<div class="finance-month${item.month===Number(stats.report_month.slice(5,7))?' selected':''}" title="${label}: income ${peso(item.income_cents)}, expenses ${peso(item.expenses_cents)}, net ${peso(item.net_cents)}"><strong>${peso(item.net_cents)}</strong><i class="${item.net_cents<0?'negative':''}" style="height:${height}%"></i><small>${label}</small></div>`;}).join('');
  document.querySelector('#adminRows').innerHTML=bookings.length?bookings.map(b=>`<tr><td>${escapeHtml(b.customer_name)}<small>${escapeHtml(b.phone)}</small></td><td>${escapeHtml(b.event_type||'Event')}<small>${Number(b.guests)} guests</small></td><td>${escapeHtml(b.event_date)} ${escapeHtml(b.event_time||b.slot)}</td><td>${escapeHtml(b.package_name)}</td><td>${escapeHtml(b.venue_address||b.venue)}<small>${escapeHtml(b.venue_city||'')}</small></td><td>${peso(b.total_cents)}</td><td>${escapeHtml(b.status)}</td><td>${b.status==='pending'?`<button data-status="${Number(b.id)}|approved">Approve</button><button class="danger" data-status="${Number(b.id)}|rejected">Decline</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="8">No booking requests.</td></tr>';
  renderAdminCalendar(bookings);
  document.querySelector('#paymentRows').innerHTML=payments.length?payments.map(p=>`<tr><td>${escapeHtml(p.customer_name||'Customer')}</td><td>#${Number(p.booking_id)} · ${escapeHtml(p.event_date||'')}</td><td>${escapeHtml(p.reference)}</td><td>${peso(p.amount_cents)}</td><td>${escapeHtml(p.status)}</td><td>${p.status==='pending'?`<button data-payment-status="${Number(p.id)}|verified">Verify</button><button class="danger" data-payment-status="${Number(p.id)}|rejected">Decline</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="6">No payments submitted.</td></tr>';
  document.querySelector('#adminOcularRows').innerHTML=inspections.length?inspections.map(item=>`<tr><td>${escapeHtml(item.request_code)}</td><td>${escapeHtml(item.customer_name)}</td><td>${escapeHtml(item.venue_name)}<small>${escapeHtml(item.venue_address)}, ${escapeHtml(item.venue_city)}</small></td><td>${escapeHtml(item.inspection_date)} ${escapeHtml(item.inspection_time)}</td><td>${peso(item.fee_cents)}<small>${escapeHtml(item.payment_reference)}</small></td><td>${escapeHtml(item.status)}</td><td>${item.status==='pending'?`<button data-ocular-status="${Number(item.id)}|approved">Approve</button><button class="danger" data-ocular-status="${Number(item.id)}|declined">Decline</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="7">No inspection requests.</td></tr>';
  document.querySelector('#changeRows').innerHTML=changes.length?changes.map(c=>`<li>#${Number(c.id)} ${escapeHtml(c.customer_name)}: ${escapeHtml(c.type)} — ${escapeHtml(c.reason)}${c.type==='reschedule'?`<small>Requested: ${escapeHtml(c.event_date)} ${escapeHtml(c.event_time||'')} (${escapeHtml(c.slot)})</small>`:''}${Number(c.reservation_fee_nonrefundable)?'<small>Reservation fee is non-refundable under the 30-day policy.</small>':''} <button data-change="${Number(c.id)}|true">Approve</button><button class="danger" data-change="${Number(c.id)}|false">Decline</button></li>`).join(''):'<li>No pending change requests.</li>';
  document.querySelector('#inventoryRows').innerHTML=inventory.length?inventory.map(item=>`<tr><td>${escapeHtml(item.name)}${Number(item.quantity)<=Number(item.reorder)?'<small class="stock-low">LOW STOCK</small>':''}</td><td>${Number(item.quantity)}</td><td>${escapeHtml(item.unit)}</td><td>${Number(item.reorder)}</td><td>${escapeHtml(item.updated_at)}<br><button data-inventory-edit="${Number(item.id)}">Edit</button><button class="danger" data-inventory-delete="${Number(item.id)}">Delete</button></td></tr>`).join(''):'<tr><td colspan="5">Inventory is empty.</td></tr>';
  document.querySelector('#expenseRows').innerHTML=expenses.length?expenses.map(item=>`<tr><td>${escapeHtml(item.expense_date)}</td><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.category)}</td><td>${peso(item.amount_cents)}</td><td><button class="danger" data-expense-delete="${Number(item.id)}">Delete</button></td></tr>`).join(''):'<tr><td colspan="5">No expenses recorded.</td></tr>';
}
async function submitChangeRequest(bookingId,type) {
  const reason=prompt(type==='cancel'?'Why are you requesting cancellation? (10 characters minimum)':'Why are you requesting a reschedule? (10 characters minimum)'); if(reason===null)return;
  const body={booking_id:bookingId,type,reason:reason.trim()};
  if(type==='reschedule'){body.event_date=prompt('Requested date (YYYY-MM-DD):')||'';body.slot=(prompt('Requested slot: MORNING, AFTERNOON, or NIGHT')||'').trim().toUpperCase();body.event_time=prompt('Requested start time (24-hour format HH:MM):')||'';}
  await api('changes',{method:'POST',body}); message('Your request was sent to KQ for review.'); await loadBookings();
}
async function compressImage(file) {
  const bitmap=await createImageBitmap(file); const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d',{alpha:false});context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  return canvas.toDataURL('image/jpeg',.82);
}

document.addEventListener('DOMContentLoaded',async()=>{
  try {
    window.KQ=await api('bootstrap'); fillPackages(); fillCities(); setUserSections();
    document.querySelector('#event_date').min=new Date(Date.now()+86400000).toISOString().slice(0,10);
    document.querySelector('#event_date').addEventListener('change',loadAvailability);
    document.querySelector('#package_id').addEventListener('change',updateBookingEstimate);
    document.querySelector('#venue_city').addEventListener('input',updateBookingEstimate);
    document.querySelector('#ocular_city').addEventListener('input',updateInspectionFee);
    if(KQ.user?.role==='admin') await loadAdmin();
    else if(KQ.user){await Promise.all([loadBookings(),loadNotifications(),loadOcular()]);}
  } catch(error){message(error.message,true);}

  document.addEventListener('click',async event=>{
    const button=event.target.closest('button'); if(!button)return;
    try {
      if(button.dataset.selectPackage){
        if(!KQ.user){message('Sign in or create an account before booking.');document.querySelector('#auth').scrollIntoView({behavior:'smooth'});return;}
        document.querySelector('#package_id').value=button.dataset.selectPackage;updateBookingEstimate();document.querySelector('#booking').scrollIntoView({behavior:'smooth'});
      } else if(button.id==='signout'){await api('logout',{method:'POST',body:{}});location.reload();}
      else if(button.dataset.paymentSubmit){const [booking_id,defaultAmount]=button.dataset.paymentSubmit.split('|');const amount=Number(prompt(`Enter the payment amount in pesos (up to ₱${(Number(defaultAmount)/100).toLocaleString('en-PH')}):`,(Number(defaultAmount)/100).toFixed(2)));if(!Number.isFinite(amount)||amount<=0)return;const reference=prompt('Enter the GCash payment reference (up to 16 characters):');if(reference){await api('payment',{method:'POST',body:{booking_id:Number(booking_id),amount_cents:Math.round(amount*100),reference:reference.trim()}});message('Payment reference sent to KQ for review.');await loadBookings();}}
      else if(button.dataset.status){const [booking_id,status]=button.dataset.status.split('|');await api('booking-status',{method:'PATCH',body:{booking_id:Number(booking_id),status}});message('Booking request updated.');await loadAdmin();}
      else if(button.dataset.paymentStatus){const [payment_id,status]=button.dataset.paymentStatus.split('|');await api('payment-status',{method:'PATCH',body:{payment_id:Number(payment_id),status}});message(`Payment ${status}.`);await loadAdmin();}
      else if(button.dataset.ocularStatus){const [inspection_id,status]=button.dataset.ocularStatus.split('|');const admin_notes=prompt('Optional note for the customer:')||'';await api('ocular',{method:'PATCH',body:{inspection_id:Number(inspection_id),status,admin_notes}});message('Inspection request reviewed.');await loadAdmin();}
      else if(button.dataset.change){const [request_id,approve]=button.dataset.change.split('|');await api('change-status',{method:'PATCH',body:{request_id:Number(request_id),approve:approve==='true'}});message('Change request reviewed.');await loadAdmin();}
      else if(button.dataset.changeRequest){const [booking_id,type]=button.dataset.changeRequest.split('|');await submitChangeRequest(Number(booking_id),type);}
      else if(button.dataset.notification){await api('notifications',{method:'PATCH',body:{notification_id:Number(button.dataset.notification)}});await loadNotifications();}
      else if(button.dataset.inventoryDelete){if(confirm('Delete this inventory item?')){await api('inventory',{method:'DELETE',body:{inventory_id:Number(button.dataset.inventoryDelete)}});await loadAdmin();}}
      else if(button.dataset.inventoryEdit){const row=button.closest('tr');const name=prompt('Item name:',row.cells[0].childNodes[0].textContent);if(name===null)return;const quantity=Number(prompt('Quantity:',row.cells[1].textContent));const unit=prompt('Unit:',row.cells[2].textContent);const reorder=Number(prompt('Low stock alert at quantity:',row.cells[3].textContent));await api('inventory',{method:'PATCH',body:{inventory_id:Number(button.dataset.inventoryEdit),name:name.trim(),quantity,unit:unit||'',reorder}});await loadAdmin();}
      else if(button.dataset.expenseDelete){if(confirm('Delete this expense record?')){await api('expenses',{method:'DELETE',body:{expense_id:Number(button.dataset.expenseDelete)}});await loadAdmin();}}
      else if(button.id==='aiLauncher'){document.querySelector('#aiPanel').hidden=false;button.hidden=true;}
      else if(button.id==='aiClose'){document.querySelector('#aiPanel').hidden=true;document.querySelector('#aiLauncher').hidden=false;}
    }catch(error){message(error.message,true);}
  });

  document.querySelector('#registerForm').addEventListener('submit',async event=>{event.preventDefault();try{await api('register',{method:'POST',body:Object.fromEntries(new FormData(event.target))});location.reload();}catch(error){message(error.message,true);}});
  document.querySelector('#financeMonth').addEventListener('change',async()=>{try{await loadAdmin();}catch(error){message(error.message,true);}});
  document.querySelector('#calendarMonth').addEventListener('change',async()=>{try{renderAdminCalendar(await api('bookings'));}catch(error){message(error.message,true);}});
  document.querySelector('#loginForm').addEventListener('submit',async event=>{event.preventDefault();try{await api('login',{method:'POST',body:Object.fromEntries(new FormData(event.target))});location.reload();}catch(error){message(error.message,true);}});
  document.querySelector('#profileForm').addEventListener('submit',async event=>{event.preventDefault();try{KQ.user=await api('profile',{method:'PATCH',body:Object.fromEntries(new FormData(event.target))});setUserSections();message('Your contact information was saved.');}catch(error){message(error.message,true);}});
  document.querySelector('#bookingForm').addEventListener('submit',async event=>{
    event.preventDefault();try{const body=Object.fromEntries(new FormData(event.target));const city=findCity(body.venue_city);if(!city)throw new Error('Choose your venue city from the suggested locations.');body.package_id=Number(body.package_id);body.guests=Number(body.guests);body.distance_km=Math.round(distanceKm(city));delete body.terms_accepted;const booking=await api('bookings',{method:'POST',body});message(`Booking request #${booking.id} submitted. KQ will review your payment reference and availability.`);event.target.reset();document.querySelector('#slot').innerHTML='<option value="">Choose a date first</option>';updateBookingEstimate();await loadBookings();}catch(error){message(error.message,true);}
  });
  document.querySelector('#ocularForm').addEventListener('submit',async event=>{
    event.preventDefault();try{const body=Object.fromEntries(new FormData(event.target));if(!findCity(body.venue_city))throw new Error('Choose your venue city from the suggested locations.');delete body.terms_accepted;const result=await api('ocular',{method:'POST',body});message(`Ocular inspection request ${result.request_code} submitted. KQ will review it.`);event.target.reset();document.querySelector('#ocularForm').elements.contact_name.value=KQ.user.name;document.querySelector('#ocularForm').elements.email.value=KQ.user.email;document.querySelector('#ocularForm').elements.phone.value=KQ.user.phone||'';updateInspectionFee();await loadOcular();await loadNotifications();}catch(error){message(error.message,true);}
  });
  document.querySelector('#inventoryForm').addEventListener('submit',async event=>{event.preventDefault();try{const body=Object.fromEntries(new FormData(event.target));body.quantity=Number(body.quantity);body.reorder=Number(body.reorder);await api('inventory',{method:'POST',body});event.target.reset();event.target.elements.reorder.value='0';message('Inventory item added.');await loadAdmin();}catch(error){message(error.message,true);}});
  document.querySelector('#expenseForm').addEventListener('submit',async event=>{event.preventDefault();try{const body=Object.fromEntries(new FormData(event.target));body.amount_cents=Math.round(Number(body.amount)*100);delete body.amount;await api('expenses',{method:'POST',body});event.target.reset();event.target.elements.category.value='General';message('Expense recorded.');await loadAdmin();}catch(error){message(error.message,true);}});
  document.querySelector('#estimateForm').addEventListener('submit',async event=>{event.preventDefault();const file=event.target.elements.image.files?.[0];if(!file)return;try{const image_data_url=await compressImage(file);const result=await api('estimate-event-design',{method:'POST',body:{image_data_url}});document.querySelector('#estimateResult').innerHTML=`<h3>${escapeHtml(result.package)} · ${peso(Number(result.price)*100)}</h3><p>${escapeHtml(result.explanation)}</p><ul>${result.features.map(feature=>`<li>${escapeHtml(feature)}</li>`).join('')}</ul><p>Preliminary estimate only. KQ must confirm the final package and price.</p>`;document.querySelector('#estimateResult').hidden=false;}catch(error){message(error.message,true);}});

  const conversation=[];
  document.querySelector('#aiForm').addEventListener('submit',async event=>{event.preventDefault();const input=event.target.elements.message;const text=input.value.trim();if(!text)return;conversation.push({role:'user',content:text});const root=document.querySelector('#aiMessages');root.insertAdjacentHTML('beforeend',`<p class="user-message">${escapeHtml(text)}</p><p class="ai-thinking">KQ AI is thinking…</p>`);input.value='';root.scrollTop=root.scrollHeight;try{const result=await api('ai-chat',{method:'POST',body:{messages:conversation.slice(-12)}});conversation.push({role:'assistant',content:result.reply});root.lastElementChild.remove();root.insertAdjacentHTML('beforeend',`<p>${escapeHtml(result.reply).replaceAll('\n','<br>')}</p>`);}catch(error){root.lastElementChild.textContent=error.message;}root.scrollTop=root.scrollHeight;});
});
