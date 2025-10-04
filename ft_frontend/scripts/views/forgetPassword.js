const renderForgotPassword = async () => {
    maincontent.innerHTML = `
    <link rel="stylesheet" href="styles/login/style.css">

    <div role="alert" id="status-alert">
    </div>
    <div class="content">
        <div class="login-form">
            <div id="email-form-div">
                <form id="forgotPasswordForm">
                    <h2 class="text-center" translate-id="forgot-password-header">Forgot Password</h2>
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Email" required="required" id="forgotPasswordEmail" translate-id="emailplaceholder">
                    </div>
                    <div class="form-group">
                        <button id="forgotPasswordBtn" type="submit" class="button-56" translate-id="forgotpasswordbtn">Send Email</button>
                    </div>
                </form>
            </div>
            <div id="code-form-div">
                <form id="emailVerificationForm">
                    <h2 class="text-center" translate-id="forgot-password-header">Verification Code</h2>
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Verification Code" required="required" id="verificationCode" translate-id="verificationcode">
                    </div>
                    <div class="form-group">
                        <button id="forgotpasswordsendcodebtn" type="submit" class="button-56" translate-id="forgotpasswordsendcodebtn">Send Code</button>
                    </div>
                </form>
            </div>
            <div id="new-password-form-div">
                <form id="newPasswordForm">
                    <h2 class="text-center" translate-id="forgot-password-header">New Password</h2>
                    <div class="form-group">
                        <input type="password" class="form-control" placeholder="New Password" required="required" id="newPassword" translate-id="newpassword">
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control" placeholder="Confirm Password" required="required" id="confirmPassword" translate-id="confirmpassword">
                    </div>
                    <div class="form-group">
                        <button id="forgotpasswordnewpasswordbtn" type="submit" class="button-56" translate-id="forgotpasswordnewpasswordbtn">Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;

    const sendCodeForm = document.querySelector('#email-form-div');
    const verificationForm = document.querySelector('#code-form-div');
    const newPasswordForm = document.querySelector('#new-password-form-div');

    verificationForm.style.display = 'none';
    newPasswordForm.style.display = 'none';

    const emailSubmit = document.querySelector('#forgotPasswordBtn');
    const verificationSubmit = document.querySelector('#forgotpasswordsendcodebtn');
    const newPasswordSubmit = document.querySelector('#forgotpasswordnewpasswordbtn');

    emailSubmit.addEventListener('click', async (e) => {
        e.preventDefault();
        emailSubmit.disabled = true;
        emailSubmit.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span translate-id="loading" class="sr-only">Loading...</span>
        </div>
        `;
        const email = document.querySelector('#forgotPasswordEmail').value;
        if (!email) {
            showAlert(translations[localStorage.getItem('selectedLanguage')]['pleaseEnterYourEmail'], 1);
            emailSubmit.disabled = false;
            emailSubmit.innerHTML = 'Send Email';
            return;
        }

        try {
            const response = await fetch(`api/auth/forgot-password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email }),
                mode: 'cors'
            });

            if (!response.ok) {
                data = await response.json();
                showAlert(data.error, 1);
                emailSubmit.disabled = false;
                emailSubmit.innerHTML = 'Send Email';
                return;
            }

            var data = await response.json();

            showAlert(data.message, 0);

            sendCodeForm.style.display = 'none';
            verificationForm.style.display = 'block';

            emailSubmit.disabled = true;
            verificationSubmit.disabled = false;

            verificationSubmit.addEventListener('click', async (e) => {
                e.preventDefault();
                verificationSubmit.disabled = true;
                verificationSubmit.innerHTML = `
                <div class="spinner-border text-light" role="status">
                    <span translate-id="loading" class="sr-only">Loading...</span>
                </div>
                `;
                const code = document.querySelector('#verificationCode').value;
                if (!code) {
                    data = await response.json();
                    showAlert(data.message, 1);
                    verificationSubmit.disabled = false;
                    verificationSubmit.innerHTML = 'Send Code';
                    return;
                }

                try {
                    const response = await fetch(`/api/auth/verify-reset-password-code/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, code }),
                        mode: 'cors'
                    });

                    if (!response.ok) {
                        data = await response.json();
                        showAlert(data.error, 1);
                        verificationSubmit.disabled = false;
                        verificationSubmit.innerHTML = 'Send Code';
                        return;
                    }

                    data = await response.json();

                    showAlert(data.message, 0);

                    verificationForm.style.display = 'none';
                    newPasswordForm.style.display = 'block';

                    verificationSubmit.disabled = true;
                    newPasswordSubmit.disabled = false;

                    newPasswordSubmit.addEventListener('click', async (e) => {
                        e.preventDefault();
                        newPasswordSubmit.disabled = true;
                        newPasswordSubmit.innerHTML = `
                        <div class="spinner-border text-light" role="status">
                            <span translate-id="loading" class="sr-only">Loading...</span>
                        </div>
                        `;
                        const newPassword = document.querySelector('#newPassword').value;
                        const confirmPassword = document.querySelector('#confirmPassword').value;

                        if (!newPassword || !confirmPassword) {
                            showAlert('Please enter your new password.', 1);
                            newPasswordSubmit.disabled = false;
                            newPasswordSubmit.innerHTML = 'Change Password';
                            return;
                        }

                        if (newPassword !== confirmPassword) {
                            showAlert('Passwords do not match.', 1);
                            newPasswordSubmit.disabled = false;
                            newPasswordSubmit.innerHTML = 'Change Password';
                            return;
                        }

                        try {
                            const response = await fetch(`/api/auth/reset-password/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email, code, newPassword }),
                                mode: 'cors'
                            });

                            if (!response.ok) {
                                data = await response.json();
                                showAlert(data.error, 1);
                                newPasswordSubmit.disabled = false;
                                newPasswordSubmit.innerHTML = 'Change Password';
                                return;
                            }

                            data = await response.json();

                            showAlert(data.message, 0);

                            setTimeout(() => {
                                navigateTo('/');
                            }, 1000);

                        } catch (error) {
                            console.error('Fetch error:', error);
                        }
                    });
                } catch (error) {
                    console.error('Fetch error:', error);
                }
            });
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });
};
