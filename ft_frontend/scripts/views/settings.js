const renderSettings = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const userId = localStorage.getItem('user_id');
        const response = await authFetch(`api/user/${userId}/profile/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('refresh_token');
            // localStorage.removeItem('user_id');
            navigateTo('/');
            return;
        }

        const userData = await response.json();
        const username = userData.username;
        const timestamp = new Date().getTime();
        showAuthDiv(true);

        maincontent.innerHTML = `
            <link rel="stylesheet" href="styles/settings/style.css">

            <div role="alert" id="status-alert">
            </div>
            <div class="container d-flex justify-content-center align-items-center">
            <div class="card" id="settingCard">
                <div class="row no-gutters row-bordered row-border-light">
                    <div class="col-md-12">
                        <div class="card-body media align-items-center">
                            <img class="setAvatar" src="/api/media/avatars/${username}.jpg?t=${timestamp}" alt="" id="foto">
                            <form class id="profile-picture-form" enctype="multipart/form-data">
                                <input type="file" name="profile_picture" id="id_profile_picture" class="custom-file-input btn btn-primary mt-1">
                                <button class="btn btn-primary mt-1" type="submit" id="settings-upload" translate-id="upload">Upload</button>
                            </form>
                            <div id="preview"></div>
                            <div class="form-group settingsFormInput">
                                <label for="formNickName" id="usernameText" class="form-label" translate-id="nickname">Nickname</label>
                                <input id="formNickName" type="text" class="form-control mb-1 username" value="${userData.nickname}">
                            </div>
                            <div class="form-group settingsFormInput">
                                <label for="formUserName" id="usernameText" class="form-label" translate-id="username">Username</label>
                                <input id="formUserName" type="text" class="form-control mb-1 username" value="${userData.username}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="userEmail" id="emailText" class="form-label" translate-id="email">Email</label>
                                <input type="text" class="form-control useremail" id="userEmail" value="${userData.email}" readonly>
                            </div>
                            <div class="text-right mt-3">
                                <button type="button" class="btn btn-primary" id="TR" onclick="language('tr')">TR</button>&nbsp;
                                <button type="button" class="btn btn-primary" id="EN" onclick="language('en')">EN</button>&nbsp;
                                <button type="button" class="btn btn-primary" id="TR" onclick="language('it')">IT</button>&nbsp;
                            </div>
                            <div class="form-group text-right mt-3">
                                <label for="2FA" translate-id="activate2fa">2FA Activate or Deactivate?</label>
                                <select class="form-control" id="FA2">
                                    <option value="enabled" translate-id="enabled">Enabled</option>
                                    <option value="disabled" translate-id="disabled">Disabled</option>
                                </select>
                            </div>
                            <div id="settingBtnWrapper" class="text-right mt-3">
                                <button type="submit" class="btn btn-primary" id="SettingsButtonSave" translate-id="savechanges">Save changes</button>&nbsp;
                                <button type="button" class="btn btn-danger" id="DeleteUser" translate-id="deleteaccount">Delete account</button>&nbsp;
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `


        document.querySelector('#FA2').value = userData.is_activate_2fa ? 'enabled' : 'disabled';


        document.querySelector('#id_profile_picture').addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.querySelector('#foto');

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.querySelector('#settings-upload').addEventListener('click', async (e) => {
            e.preventDefault();

            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                navigateTo('/');
                return;
            }

            let verifyTokenResult = await verifyToken(accessToken);

            if (!verifyTokenResult) {
                navigateTo('/');
                return;
            }

            const userId = localStorage.getItem('user_id');
            const formData = new FormData();
            const avatarFile = document.querySelector('#id_profile_picture').files[0];

            if (avatarFile.size > 10485760) {
                showAlert('File size cannot be larger than 10 MB');
                return;
            }

            formData.append('avatar', avatarFile);

            const response = await fetch(`api/user/${userId}/upload-avatar/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            });

            if (response.ok) {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['photosuccess']);
            } else {
                showAlert(translations[localStorage.getItem('selectedLanguage')]['photofail'], 1);
            }
        });

        document.querySelector('#SettingsButtonSave').addEventListener('click', async (e) => {
            e.preventDefault();
            let newNickName = document.querySelector('#formNickName').value;
            const userId = localStorage.getItem('user_id');
            const response = await authFetch(`api/user/${userId}/changenickname/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'new_nickname' : newNickName,
                    'is_2FA_enabled' : document.querySelector('#FA2').value === 'enabled' ? true : false
                })
            });

            if (!response.ok) {
                let errorMessage = await response.json();
                showAlert(errorMessage.error, 1);
                return;
            }
            showAlert(translations[localStorage.getItem('selectedLanguage')]['settingssaved']);
        });

        document.querySelector('#DeleteUser').addEventListener('click', async (e) => {
            e.preventDefault();
            const userId = localStorage.getItem('user_id');
            const response = await authFetch(`api/user/${userId}/delete-user/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = await response.json();
                showAlert(errorMessage.error, 1);
                return;
            }
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');

            // I have to delet
            showAuthDiv(false);
            navigateTo('/'); 
        });
    }catch(e)
    {
        showAlert(translations[localStorage.getItem('selectedLanguage')]['settingsfailed'], 1);
        console.log("fetch error", e);
        navigateTo('/');
    }

    changeLanguage();
}
