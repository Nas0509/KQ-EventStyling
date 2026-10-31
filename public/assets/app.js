const api = async (action, options = {}) => {
  const method = options.method || 'GET';
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json', 'X-CSRF-Token': window.KQ.csrf } : {}) };
  const [endpoint, query = ''] = action.split('&', 2);
  const response = await fetch(`api.php?action=${encodeURIComponent(endpoint)}${query ? `&${query}` : ''}`, { method, headers, body: options.body ? JSON.stringify(options.body) : undefined, credentials: 'same-origin' });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || 'Request failed.');
  return json.data;
};
const money = cents => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((Number(cents) || 0) / 100);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const message = (text, bad = false) => { const el=document.querySelector('#message'); el.textContent=text; el.className=bad?'error':'success'; };
async function initialise() {
  window.KQ = await api('bootstrap');
  document.querySelector('[data-user]').textContent = KQ.user ? `${KQ.user.name} (${KQ.user.role})` : 'Guest';
  document.querySelector('#auth').hidden = Boolean(KQ.user);
  document.querySelector('#signout').hidden = !KQ.user;
  document.querySelector('#booking').hidden = !KQ.user;
  document.querySelector('#records').hidden = !KQ.user;
  if (KQ.user?.role === 'admin') { document.querySelector('#admin').hidden=false; loadAdmin(); }
  fillPackages(); if (KQ.user) loadBookings();
}
function fillPackages() { document.querySelector('#package_id').innerHTML=KQ.packages.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} - ${money(p.price_cents)}</option>`).join(''); }
async function loadAvailability() { const date=document.querySelector('#event_date').value; if (!date) return; try { const data=await api(`availability&event_date=${encodeURIComponent(date)}`); document.querySelector('#slot').innerHTML=data.available_slots.length ? data.available_slots.map(s=>`<option>${s}</option>`).join('') : '<option value="">No slots available</option>'; } catch(e) { message(e.message,true); } }
async function loadBookings() { const rows=await api('bookings'); const root=document.querySelector('#bookingRows'); root.innerHTML=rows.length?rows.map(b=>`<tr><td>${b.id}</td><td>${escapeHtml(b.package_name)}</td><td>${b.event_date} ${b.slot}</td><td>${escapeHtml(b.status)}</td><td>${money(b.total_cents)}</td><td>${b.status==='pending'?`<button data-payment="${b.id}">Submit payment</button>`:''}</td></tr>`).join(''):'<tr><td colspan="6">No bookings yet.</td></tr>'; }
async function loadAdmin() { const [stats,rows,changes]=await Promise.all([api('dashboard'),api('bookings'),api('changes')]); document.querySelector('#stats').innerHTML=Object.entries(stats).map(([k,v])=>`<article><strong>${k.replace('_',' ')}</strong><span>${k==='revenue_cents'?money(v):v}</span></article>`).join(''); document.querySelector('#adminRows').innerHTML=rows.map(b=>`<tr><td>${b.id}</td><td>${escapeHtml(b.customer_name)}</td><td>${escapeHtml(b.package_name)}</td><td>${b.event_date} ${b.slot}</td><td>${b.status}</td><td>${b.status==='pending'?`<button data-status="${b.id}|approved">Approve</button><button class="danger" data-status="${b.id}|rejected">Reject</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6">No records.</td></tr>'; document.querySelector('#changeRows').innerHTML=changes.map(c=>`<li>#${c.id} ${escapeHtml(c.customer_name)}: ${c.type} - ${escapeHtml(c.reason)} <button data-change="${c.id}|true">Approve</button><button class="danger" data-change="${c.id}|false">Reject</button></li>`).join('')||'<li>No pending requests.</li>'; }
document.addEventListener('DOMContentLoaded', async () => {
  try { await initialise(); } catch(e) { message(e.message,true); }
  document.querySelector('#event_date').addEventListener('change',loadAvailability);
  document.querySelector('#registerForm').addEventListener('submit', async e=>{ e.preventDefault(); try { await api('register',{method:'POST',body:Object.fromEntries(new FormData(e.target))}); location.reload(); } catch(err){message(err.message,true);} });
  document.querySelector('#loginForm').addEventListener('submit', async e=>{ e.preventDefault(); try { await api('login',{method:'POST',body:Object.fromEntries(new FormData(e.target))}); location.reload(); } catch(err){message(err.message,true);} });
  document.querySelector('#signout').addEventListener('click',async()=>{await api('logout',{method:'POST',body:{}});location.reload();});
  document.querySelector('#bookingForm').addEventListener('submit',async e=>{e.preventDefault();try{const b=Object.fromEntries(new FormData(e.target)); b.package_id=Number(b.package_id);b.guests=Number(b.guests);b.distance_km=Number(b.distance_km); const result=await api('bookings',{method:'POST',body:b}); message(`Booking #${result.id} created. Submit the 30% reservation payment: ${money(result.deposit_cents)}.`);e.target.reset();loadBookings();}catch(err){message(err.message,true);}});
  document.addEventListener('click',async e=>{const pay=e.target.dataset.payment, status=e.target.dataset.status, change=e.target.dataset.change; try { if(pay){const reference=prompt('Enter the GCash payment reference.'); if(reference) { await api('payment',{method:'POST',body:{booking_id:Number(pay),reference}}); message('Payment submitted for administrator review.');loadBookings(); }} if(status){const [booking_id,value]=status.split('|');await api('booking-status',{method:'PATCH',body:{booking_id:Number(booking_id),status:value}});message('Booking updated.');loadAdmin();} if(change){const [request_id,approve]=change.split('|');await api('change-status',{method:'PATCH',body:{request_id:Number(request_id),approve:approve==='true'}});message('Change request reviewed.');loadAdmin();}}catch(err){message(err.message,true);}});
});
