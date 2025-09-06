document.addEventListener('DOMContentLoaded', async function() {
  const authSection = document.getElementById('authSection');
  const userDashboard = document.getElementById('userDashboard');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authMessage = document.getElementById('authMessage');
  
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const signoutBtn = document.getElementById('signoutBtn');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const userEmail = document.getElementById('userEmail');
  
  const actionBtn = document.getElementById('actionBtn');
  const result = document.getElementById('result');

  function showMessage(message, type = 'error') {
    authMessage.textContent = message;
    authMessage.className = type;
    authMessage.style.display = 'block';
    setTimeout(() => {
      authMessage.style.display = 'none';
    }, 5000);
  }

  function showAuthSection() {
    authSection.style.display = 'block';
    userDashboard.style.display = 'none';
  }

  function showUserDashboard(user) {
    authSection.style.display = 'none';
    userDashboard.style.display = 'block';
    userEmail.textContent = user.email;
  }

  function toggleForms() {
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
  }

  async function checkAuthState() {
    try {
      const { user, error } = await supabase.getUser();
      if (user && !error) {
        showUserDashboard(user);
      } else {
        showAuthSection();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      showAuthSection();
    }
  }

  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
  });

  loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
      showMessage('Please fill in all fields');
      return;
    }

    try {
      loginBtn.textContent = 'Signing in...';
      loginBtn.disabled = true;
      
      const { user, error } = await supabase.signIn(email, password);
      
      if (error) {
        showMessage(error.message || 'Login failed');
      } else if (user) {
        showMessage('Login successful!', 'success');
        showUserDashboard(user);
        loginEmail.value = '';
        loginPassword.value = '';
      }
    } catch (error) {
      showMessage('Network error. Please try again.');
    } finally {
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  });

  signupBtn.addEventListener('click', async () => {
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    
    if (!email || !password) {
      showMessage('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters');
      return;
    }

    try {
      signupBtn.textContent = 'Signing up...';
      signupBtn.disabled = true;
      
      const { user, error } = await supabase.signUp(email, password);
      
      if (error) {
        showMessage(error.message || 'Signup failed');
      } else if (user) {
        showMessage('Account created successfully!', 'success');
        showUserDashboard(user);
        signupEmail.value = '';
        signupPassword.value = '';
      }
    } catch (error) {
      showMessage('Network error. Please try again.');
    } finally {
      signupBtn.textContent = 'Sign Up';
      signupBtn.disabled = false;
    }
  });

  signoutBtn.addEventListener('click', async () => {
    try {
      signoutBtn.textContent = 'Signing out...';
      signoutBtn.disabled = true;
      
      await supabase.signOut();
      showMessage('Signed out successfully!', 'success');
      showAuthSection();
    } catch (error) {
      showMessage('Error signing out');
    } finally {
      signoutBtn.textContent = 'Sign Out';
      signoutBtn.disabled = false;
    }
  });

  if (actionBtn) {
    actionBtn.addEventListener('click', function() {
      result.textContent = 'Button clicked! Extension is working.';
      result.style.color = '#4CAF50';
    });
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab && userDashboard.style.display !== 'none') {
      const urlDisplay = document.createElement('p');
      urlDisplay.textContent = `Current URL: ${currentTab.url}`;
      urlDisplay.style.fontSize = '12px';
      urlDisplay.style.color = '#666';
      document.querySelector('#appContent').appendChild(urlDisplay);
    }
  });

  await checkAuthState();
});