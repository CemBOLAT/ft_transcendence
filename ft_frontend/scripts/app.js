const maincontent = document.querySelector('#indexcontent');
let userOnlineSocket = null;

let chatSocket = null;

let gameSocket = null;
let onlinPongGame = null;
let isOnlineRoomCreater = false;

let localPongGame = null;
let localTournamentGame = null;

const routes = {
    '/': renderIndex,
    '/signup': renderSignup,
    '/login': renderLogin,
    '/singlepong': renderSinglePong,
    '/main': renderMain,
    '/settings': renderSettings,
    '/profile': renderProfile,
    '/changepassword': renderChangePassword,
    '/friends': renderFriends,
    '/chat': renderChat,
    '/email-auth' : renderEmailAuth,
    '/user' : renderOtherUserProfile,
    '/forgot-password': renderForgotPassword,
    '/online': onlinePongRender,
    '/local-game': localGameRender,
    '/local-tournament': localTournamentRender,
    '/privatepong': renderPrivateMatch,
};

function navigateTo(path, ...params) {
    history.pushState({}, path, window.location.origin + path);
    router(params);
}

function router(params) {
    const path = window.location.pathname;
    const parts = path.split('?');
    const baseUrl = parts[0];
    const id = new URLSearchParams(window.location.search).get('userid');
    
    params = {
        ...params,
        userId: id
    }

    const route = routes[baseUrl];

    gBlockedUsers = [];

    if (chatSocket != null)
    {
        chatSocket.close();
        chatSocket = null;
    }

    if (gameSocket != null)
    {
        gameSocket.close();
        gameSocket = null;
        isOnlineRoomCreater = false;
    }

    if (onlinPongGame != null)
    {
        onlinPongGame.stopAnimation();
        onlinPongGame = null;
    }

    if (localPongGame != null)
    {
        localPongGame.stopAnimation();
        localPongGame = null;
    }

    if (localTournamentGame != null)
    {
        localTournamentGame.stopAnimation();
        localTournamentGame = null;
        localStorage.removeItem('tournamentData');
        localStorage.removeItem('gameSettings');
    }

    if (localStorage.getItem('gameSettings'))
    {
        localStorage.removeItem('gameSettings');
    }

    if (localStorage.getItem('tournamentData'))
    {
        localStorage.removeItem('tournamentData');
    }

    if (route) {
        route(params);
    } else {
        maincontent.innerHTML = `
        <style>
            body, html {
            height: 100%;
            }
            .bg-dark {
            
            }
            .centered {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            }
            .centered h1 {
            font-size: 10rem;
            color: #fff;
            }
            .centered h3 {
            color: #aaa;
            }
            .btn-home {
            margin-top: 30px;
            }
        </style>
        <div>
            <div class="centered">
                <h1>404</h1>
                <h3>Aradığınız Sayfa Bulunamadı</h3>
            </div>
        </div>`;
    }
}

window.onpopstate = router;

function main() {
    const navbarBtn = document.querySelector('#navbarBtn')
    
    if (localStorage.getItem('selectedLanguage') == null)
    {
        localStorage.setItem('selectedLanguage', 'en');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        (async function(){
            try {
                let response = await fetch(`/api/auth/callback/?code=${code}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    if (userOnlineSocket)
                    {
                        userOnlineSocket.close();
                        userOnlineSocket = null;
                    }
                    return (console.log('Network response was not ok ' + response.statusText));
                }
                let data = await response.json();
                if (data.access) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user_id', data.user_id);
                    userOnlineSocket = userOnlineSocketStart(data.user_id);
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
                    navigateTo('/profile');
                } else {
                    console.error('Token alımı başarısız:', data);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        })();
    }


    navbarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/')
    });
    router();

    showAuthDiv(false);
    requireAuth(()=>{
        userOnlineSocket = userOnlineSocketStart(localStorage.getItem('user_id'));
        showAuthDiv(true);

        (async () => {
            const userId = localStorage.getItem('user_id');
            const response = await authFetch(`/api/user/${userId}/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const friendNotification = data.friend_notifications;
                const messageNotification = data.chat_notifications;
                if (friendNotification)
                {
                    document.querySelector("#g-friend-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
                }
                if (messageNotification)
                {
                    document.querySelector("#g-msg-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
                }
            }
        })()
    })

    document.querySelector('#g-logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        showAuthDiv(false);
    })

    document.querySelector('#g-profile-btn').addEventListener('click', (e)=>{
        e.preventDefault();
        navigateTo('/profile');
    });

    document.querySelector("#g-friend-not-btn").addEventListener('click', (e)=>{
        e.preventDefault();
        navigateTo('/friends');
    });

    document.querySelector("#g-msg-not-btn").addEventListener('click', (e)=>{
        e.preventDefault();
        //navigateTo('/settings'); chata gidecek ama yapılmadı.
        navigateTo('/chat');
    });
}

main();
