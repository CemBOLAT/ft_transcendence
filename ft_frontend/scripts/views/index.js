async function renderIndex() {
    if (await checkTokenAndRedirect()) return;

    maincontent.innerHTML = `
        <div class="container" id="signupdiv">
            <div class="row mt-5">
                <button id="indexPageLoginBtn" class="button-56 btn-block" translate-id="login">Login</button>
            </div>
            <div class="row mt-5">
                <button id="indexPageSignupBtn" class="button-56 btn-block" translate-id="signup">Signup</button>
            </div>
            <div class="row mt-5">
                <button id="indexPageOAuthBtn" class="button-56 btn-block" translate-id="oauth">42 Auth</button>
            </div>
            <div class="row mt-5">
                <button id="indexPageSinglePongBtn" class="button-56 btn-block" translate-id="singleplayer">Single Player</button>
            </div>
        </div>
    `;

    document.querySelector('#indexPageLoginBtn').addEventListener('click', () => navigateTo('/login'));
    document.querySelector('#indexPageSignupBtn').addEventListener('click', () => navigateTo('/signup'));
    document.querySelector('#indexPageSinglePongBtn').addEventListener('click', () => navigateTo('/singlepong'));
    document.querySelector('#indexPageOAuthBtn').addEventListener('click', (e) => {
        e.preventDefault();
        initiateOAuth();
    });

    changeLanguage();
}
