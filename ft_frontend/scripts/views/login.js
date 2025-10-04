const renderLogin = async () => {
  if (await checkTokenAndRedirect()) return;

  maincontent.innerHTML = `
  <link rel="stylesheet" href="styles/login/style.css">

  <div role="alert" id="status-alert">
  </div>
  <div class="content">
  <div class="login-form">
    <form id="loginForm">
      <h2 class="text-center" translate-id="loginheader">Login</h2>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Username" required="required" id="loginUsername" translate-id="usernameplaceholder">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="Password" required="required" id="loginPassword" translate-id="passwordplaceholder">
      </div>
      <div class="form-group">
        <button id="loginBtnInLoginPage" type="submit" class="button-56" translate-id="loginbtn">Log in</button>
      </div>
    </form>
    <div class="forget-password text-center">
      <a class="refs" id="forget-password-ref" translate-id="forgotpassword">Forget password ?</a> <!-- Add link to forget password page -->
    </div>
    <div class="register-link"> 
      <p> <span translate-id="registerlink">Don't have an account?</span> <a id="loginPageRegisterRef" class="refs" href="/signup">Register here</a></p> <!-- Add link to register page -->
    </div>
  </div>
</div>
</div>
  `
  
  const forget_password_ref = document.querySelector('#forget-password-ref');
  forget_password_ref.style.cursor = 'pointer';

  forget_password_ref.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/forgot-password');
  });

  document.querySelector('#loginPageRegisterRef').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/signup');
  });

  document.querySelector('#loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      document.querySelector('#loginBtnInLoginPage').disabled = true;

      /* Convert login button to loading button */
      document.querySelector('#loginBtnInLoginPage').innerHTML = `
      <div class="spinner-border text-light" role="status">
        <span translate-id="loading" class="sr-only">Loading...</span>
      </div>
      `;


      const username = document.querySelector('#loginUsername').value;
      const password = document.querySelector('#loginPassword').value;

      try {
          const response = await fetch('api/auth/login/',  {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password }),
              mode: 'cors'
          });

          if (!response.ok) {
              const errorData = await response.json();
              console.log(errorData);
              // errorData.non_field_errors[0] = "No active account found with the given credentials"
              showAlert(`Login failed: ${errorData.non_field_errors[0] || translations[localStorage.getItem('selectedLanguage')]['loginerror']}`, 1);
              document.querySelector('#loginBtnInLoginPage').disabled = false;

              /* Convert loading button back to login button */

              document.querySelector('#loginBtnInLoginPage').innerHTML = translations[localStorage.getItem('selectedLanguage')]['loginbtn'];


              return;
          }

          const data = await response.json();

          userOnlineSocket = userOnlineSocketStart(data.user_id);

          localStorage.setItem('user_id', data.user_id);
          if (data.is_activate_2fa){
			        navigateTo('/email-auth');
          }
          else {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            const userResponse = await authFetch(`/api/user/${data.user_id}/profile/`, {
              method: 'GET',
            });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                const friendNotification = userData.friend_notifications;
                const messageNotification = userData.chat_notifications;
                if (friendNotification)
                {
                    document.querySelector("#g-friend-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
                }
                if (messageNotification)
                {
                    document.querySelector("#g-msg-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
                }
            }
            navigateTo('/main');
          }
          //showAuthDiv(true);
      } catch (error) {
          showAlert(translations[localStorage.getItem('selectedLanguage')]['loginerror'], 1);
          document.querySelector('#loginBtnInLoginPage').disabled = false;
          document.querySelector('#loginBtnInLoginPage').innerHTML = translations[localStorage.getItem('selectedLanguage')]['loginbtn'];
      }
  });

  changeLanguage();
};
