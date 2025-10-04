const renderMain = async () => {
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
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            navigateTo('/');
            return;
        }

        const userData = await response.json();
        showAuthDiv(true);
        maincontent.innerHTML = `
            <style>
                .centered-text {
                    text-align: center; /* Ortalar */
                    color: white; /* Beyaz renk */
                    font-family: 'Roboto', sans-serif; /* Roboto fontunu kullanır */
                }
            </style>
            <div class="container" id="signupdiv">
                <h3 class="centered-text"><span translate-id="hi">HI</span> ${userData.nickname}</h3>
                <div class="row mt-5">
                    <button class="button-56 btn-block" id="play-online-btn" translate-id="creatematch">Play Online</button>
                </div>
                <div class="row mt-5">
                    <button class="button-56 btn-block" translate-id="findmatch" id="play-online-private">Play Online Tournament</button>
                </div>
                <div class="row mt-5">
                    <button translate-id="localGame" id="indexPageLocalGameBtn" class="button-56 btn-block">Local Game</button>
                </div>
                <div class="row mt-5">
                    <button translate-id="localTournament" id="indexPageTournamentBtn" class="button-56 btn-block">Local Tournament</button>
                </div>
            </div>
        `;

        document.querySelector('#play-online-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/online');
        });

        document.querySelector('#play-online-private').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/privatepong');
        });

        document.querySelector('#indexPageLocalGameBtn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/local-game')
        });
        document.querySelector('#indexPageTournamentBtn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/local-tournament')
        });
        
    } catch (e) {
        console.log("fetch error", e);
        navigateTo('/');
    }

    changeLanguage();
}
