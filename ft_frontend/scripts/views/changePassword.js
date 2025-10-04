const renderChangePassword = async () => {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
        navigateTo('/');
        return;
    }

    try {
        const userId = localStorage.getItem('user_id');
        const response = await authFetch(`/api/user/${userId}/profile/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // if (!response.ok) { // https status
        //     localStorage.removeItem('access_token');
        //     localStorage.removeItem('refresh_token');
        //     localStorage.removeItem('user_id');
        //     navigateTo('/');
        //     return;
        // }

        const userData = await response.json();
        showAuthDiv(true);

        maincontent.innerHTML = `
        <link rel="stylesheet" href="styles/user/confirmpassword.css">
        <div role="alert" id="status-alert">
        </div>
        <div class="confirmPassword mx-auto">
            <form action="#" method="post">
                <h2 translate-id="changepasswordheader">Change Password</h2>
                <div class="form-group">
                    <input type="password" class="form-control" placeholder="Old Password" required="required" id="oldPassword" translate-id="oldpasswordplaceholder">
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" placeholder="New Password" required="required" id="newPassword" translate-id="newpasswordplaceholder">
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" placeholder="Confirm Password" required="required" id="passwordConfirm" translate-id="confirmpasswordplaceholder">
                </div>
                <div class="form-group">
                    <button type="submit" class="button-56 btn-block" id="confirmPasswordBtn" translate-id="changepassword">Change Password</button>
                </div>
            </form>
        </div>
        `

        document.querySelector('#confirmPasswordBtn').addEventListener('click', async (e) => {
            e.preventDefault();

            document.querySelector('#confirmPasswordBtn').disabled = true;
            document.querySelector('#confirmPasswordBtn').innerHTML = `
                <div class="spinner-border text-light" role="status">
                    <span translate-id="loading" class="sr-only">Loading...</span>
                </div>
            `;

            const oldPassword = document.querySelector('#oldPassword').value;
            const newPassword = document.querySelector('#newPassword').value;
            const passwordConfirm = document.querySelector('#passwordConfirm').value;
            const userId = localStorage.getItem('user_id');

            if (newPassword !== passwordConfirm) {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['passwordmismatch'], 1);
                document.querySelector('#confirmPasswordBtn').disabled = false;
                document.querySelector('#confirmPasswordBtn').innerHTML = translations[localStorage.getItem('selectedLanguage')]['changepassword'];
                return;
            }

            const response = await authFetch(`/api/user/${userId}/changepassword/`, {
                method: 'PUT',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });


            if (!response.ok) {
                const errorMessage = await response.json();
                showAlert(errorMessage.error, 1);
                document.querySelector('#confirmPasswordBtn').disabled = false;
                document.querySelector('#confirmPasswordBtn').innerHTML = translations[localStorage.getItem('selectedLanguage')]['changepassword'];
                return;
            }

            showAlert(translations[localStorage.getItem('selectedLanguage')]['passwordchanged'], 0);
            navigateTo('/main');
        });
    } catch (err) {
        showAlert(translations[localStorage.getItem('selectedLanguage')]['passwordchangefailed'], 1);
        navigateTo('/');
    }

    changeLanguage();
}
