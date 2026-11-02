let csrfToken='';
async function authRequest(action,body){
  const response=await fetch(`api.php?action=${action}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-CSRF-Token':csrfToken}:{Accept:'application/json'},credentials:'same-origin',body:body?JSON.stringify(body):undefined});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(result.error||'Hindi natuloy. Pakisubukan ulit.');
  return result.data;
}
document.addEventListener('DOMContentLoaded',async()=>{
  try{const state=await authRequest('bootstrap');csrfToken=state.csrf;if(state.user){const next=new URLSearchParams(location.search).get('next');location.href=next==='admin'&&state.user.role==='admin'?'admin.html':next==='customizer'?'customizer.html':next==='booking'?'index.php#booking':'index.php';return;}}
  catch(error){const message=document.querySelector('#message,#signupMessage');if(message)message.textContent=error.message;}
  const form=document.querySelector('#loginForm');
  if(form){
    document.querySelector('#togglePassword')?.addEventListener('click',event=>{const input=document.querySelector('#password');input.type=input.type==='password'?'text':'password';event.currentTarget.textContent=input.type==='password'?'Show':'Hide';});
    form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type=submit]'),output=document.querySelector('#message');button.disabled=true;output.textContent='Signing in…';try{const data=await authRequest('login',{email:document.querySelector('#email').value.trim(),password:document.querySelector('#password').value});sessionStorage.setItem('kqPhpUser',JSON.stringify(data.user));const next=new URLSearchParams(location.search).get('next');location.href=next==='admin'&&data.user.role==='admin'?'admin.html':next==='booking'?'index.php#booking':next==='customizer'?'customizer.html':'index.php';}catch(error){output.textContent=error.message;button.disabled=false;}});
  }
  const signup=document.querySelector('#signupForm');
  if(signup){
    for(const [buttonId,inputId] of [['togglePassword','password'],['toggleConfirmPassword','confirmPassword']])document.getElementById(buttonId)?.addEventListener('click',event=>{const input=document.getElementById(inputId);input.type=input.type==='password'?'text':'password';event.currentTarget.textContent=input.type==='password'?'Show':'Hide';});
    const passwordInput=document.getElementById('password');
    const confirmInput=document.getElementById('confirmPassword');
    const ruleElements={length:document.getElementById('ruleLength'),uppercase:document.getElementById('ruleUppercase'),lowercase:document.getElementById('ruleLowercase'),number:document.getElementById('ruleNumber'),special:document.getElementById('ruleSpecial')};
    const passwordRules=password=>({length:password.length>=8,uppercase:/[A-Z]/.test(password),lowercase:/[a-z]/.test(password),number:/\d/.test(password),special:/[^A-Za-z0-9]/.test(password)});
    const updatePasswordChecklist=()=>{
      const rules=passwordRules(passwordInput.value);
      Object.entries(rules).forEach(([name,passed])=>{const item=ruleElements[name];if(item){item.classList.toggle('valid',passed);item.setAttribute('aria-checked',String(passed));}});
      const score=Object.values(rules).filter(Boolean).length;
      const fill=document.getElementById('strengthFill'),label=document.getElementById('strengthText');
      if(fill)fill.style.width=passwordInput.value?`${[0,30,30,65,65,100][score]}%`:'0%';
      if(label){const state=!passwordInput.value?'':score===5?'Strong password':score>=3?'Medium password':'Weak password';label.textContent=state;label.style.color=score===5?'#198754':score>=3?'#d69e2e':'#d9534f';}
      return rules;
    };
    const updateConfirmation=()=>{const match=document.getElementById('passwordMatch');if(!match)return;const same=confirmInput.value&&passwordInput.value===confirmInput.value;match.textContent=confirmInput.value?(same?'Passwords match.':'Passwords do not match.') : '';match.classList.toggle('valid',Boolean(same));};
    passwordInput.addEventListener('input',()=>{updatePasswordChecklist();updateConfirmation();});
    confirmInput.addEventListener('input',updateConfirmation);
    updatePasswordChecklist();
    signup.addEventListener('submit',async event=>{event.preventDefault();const output=document.querySelector('#signupMessage'),button=document.querySelector('#signupButton');const password=passwordInput.value,confirm=confirmInput.value;button.disabled=true;try{if(!Object.values(updatePasswordChecklist()).every(Boolean))throw new Error('Complete all password requirements first.');if(password!==confirm)throw new Error('Magkapareho dapat ang password at confirmation.');if(!document.querySelector('#terms').checked)throw new Error('Tanggapin muna ang Terms and Conditions.');const data=await authRequest('register',{name:document.querySelector('#fullName').value.trim(),email:document.querySelector('#email').value.trim(),phone:document.querySelector('#contactNumber').value.trim(),password});sessionStorage.setItem('kqPhpUser',JSON.stringify(data.user));location.href='index.php';}catch(error){output.textContent=error.message;button.disabled=false;}});
  }
});
