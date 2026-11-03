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
    form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type=submit]'),output=document.querySelector('#message');button.disabled=true;output.textContent='Signing in…';try{const data=await authRequest('login',{email:document.querySelector('#email').value.trim(),password:document.querySelector('#password').value,remember:Boolean(document.querySelector('#rememberMe')?.checked)});sessionStorage.setItem('kqPhpUser',JSON.stringify(data.user));const next=new URLSearchParams(location.search).get('next');location.href=next==='admin'&&data.user.role==='admin'?'admin.html':next==='booking'?'index.php#booking':next==='customizer'?'customizer.html':'index.php';}catch(error){output.textContent=error.message;button.disabled=false;}});
  }
  const signup=document.querySelector('#signupForm');
  if(signup){
    const passwordInput=document.querySelector('#password'),confirmInput=document.querySelector('#confirmPassword'),strengthFill=document.querySelector('#strengthFill'),strengthText=document.querySelector('#strengthText'),passwordMatch=document.querySelector('#passwordMatch');
    const passwordRules={length:document.querySelector('#ruleLength'),uppercase:document.querySelector('#ruleUppercase'),lowercase:document.querySelector('#ruleLowercase'),number:document.querySelector('#ruleNumber'),special:document.querySelector('#ruleSpecial')};
    function updatePasswordFeedback(){
      const value=passwordInput.value,rules={length:value.length>=8,uppercase:/[A-Z]/.test(value),lowercase:/[a-z]/.test(value),number:/[0-9]/.test(value),special:/[^A-Za-z0-9]/.test(value)};
      Object.entries(rules).forEach(([key,valid])=>passwordRules[key]?.classList.toggle('valid',valid));
      const score=Object.values(rules).filter(Boolean).length;
      strengthFill.style.width=value?`${score*20}%`:'0%';
      strengthText.textContent=!value?'':score<=2?'Weak password':score<=4?'Medium password':'Strong password';
      strengthText.style.color=!value?'':score<=2?'#d9534f':score<=4?'#d69e2e':'#198754';
      if(confirmInput.value){const matches=value===confirmInput.value;passwordMatch.textContent=matches?'✓ Passwords match':'✕ Passwords do not match';passwordMatch.className=`password-match ${matches?'match':'no-match'}`;}else{passwordMatch.textContent='';passwordMatch.className='password-match';}
      return Object.values(rules).every(Boolean);
    }
    passwordInput.addEventListener('input',updatePasswordFeedback);confirmInput.addEventListener('input',updatePasswordFeedback);
    for(const [buttonId,inputId] of [['togglePassword','password'],['toggleConfirmPassword','confirmPassword']])document.getElementById(buttonId)?.addEventListener('click',event=>{const input=document.getElementById(inputId);input.type=input.type==='password'?'text':'password';event.currentTarget.textContent=input.type==='password'?'Show':'Hide';});
    signup.addEventListener('submit',async event=>{event.preventDefault();const output=document.querySelector('#signupMessage'),button=document.querySelector('#signupButton');const password=passwordInput.value,confirm=confirmInput.value;button.disabled=true;try{if(!updatePasswordFeedback())throw new Error('Meet all password requirements before continuing.');if(password!==confirm)throw new Error('Magkapareho dapat ang password at confirmation.');if(!document.querySelector('#terms').checked)throw new Error('Tanggapin muna ang Terms and Conditions.');const data=await authRequest('register',{name:document.querySelector('#fullName').value.trim(),email:document.querySelector('#email').value.trim(),phone:document.querySelector('#contactNumber').value.trim(),password});sessionStorage.setItem('kqPhpUser',JSON.stringify(data.user));output.textContent='Account created successfully! Welcome to KQ Event Styling.';output.className='message success toast';button.textContent='Account Created';setTimeout(()=>{location.href='index.php';},1800);}catch(error){output.textContent=error.message;output.className='message error';button.disabled=false;}});
  }
});
