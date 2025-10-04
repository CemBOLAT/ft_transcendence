const renderEmailAuth = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
        navigateTo('/login');
        return;
    }

    maincontent.innerHTML = `
    <link rel="stylesheet" href="styles/login/style.css">
    <div role="alert" id="status-alert"></div>
    <div class="content">
        <div class="login-form">
            <form action="/submit-your-login-endpoint" method="post">
                <h2 class="text-center" translate-id="emailauthheader">Email Authentication</h2>
                <div class="form-group">
                    <input id="veriCode" type="text" class="form-control" placeholder="Code" required="required" translate-id="codeplaceholder">
                </div>
                <div class="form-group">
                    <button id="emailAuthBtn" type="submit" class="btn btn-primary btn-block button-56" translate-id="submit">Submit</button>
                </div>
            </form>
        </div>
    </div>
    `;

    const emailAuthBtn = document.getElementById('emailAuthBtn');

    (async function() {
        try {
            let response = await fetch(`/api/auth/${user_id}/send-verification-code/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let data = await response.json();
            if (response.ok) {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['verificationcodesent'], 0);
            } else {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['failedtosendcode'], 1);
            }
        } catch (error) {
            showAlert(translations[localStorage.getItem('selectedLanguage')]['failedtosendcodeserver'], 1);
        }
    })();

    emailAuthBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        emailAuthBtn.disable = true;
        emailAuthBtn.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span translate-id="loading" class="sr-only">Loading...</span>
        </div>
        `;

        (async function() {
            try {
                let veriCode = document.getElementById('veriCode').value;
                let response = await fetch(`/api/auth/${user_id}/verify-email/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: veriCode
                    }),
                });
                if (response.ok) {
                    let data = await response.json();
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    const userResponse = await authFetch(`/api/user/${user_id}/profile/`, {
                        method: 'GET',
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        const friendNotification = userData.friend_notifications;
                        const messageNotification = userData.chat_notifications;
                        showAuthDiv(true);
                        if (friendNotification)
                        {
                            document.querySelector("#g-friend-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
                        }
                        if (messageNotification)
                        {
                            document.querySelector("#g-msg-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
                        }
                    }
                    showAuthDiv(true);
                    navigateTo('/profile');
                } else {
                    emailAuthBtn.disable = false;
                    emailAuthBtn.innerHTML = translations[localStorage.getItem('selectedLanguage')]['submit'];
                    showAlert(translations[localStorage.getItem('selectedLanguage')]['wrongcode'], 1);
                    showAuthDiv(false);
                }
            } catch (error) {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['failedtoverifyserver'], 1);
            }
        })();
    });

    changeLanguage();
};
