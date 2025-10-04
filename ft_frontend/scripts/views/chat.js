const openChatSocket = (username, userId) => {
    const socket = new WebSocket(`wss://${window.location.host}/ws/chat/${username}/?user_id=${userId}`);

    socket.onopen = function(e) {
    };

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML += `<div>${data.username}: ${data.message}</div>`;
    };

    socket.onclose = function(e) {
    };

    socket.onerror = function(e) {
    };

    return socket;
};

const showOldMessages = async (username) => {
    const accessToken = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const response = await authFetch(`/api/chat/messages/${username}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const messages = await response.json();
            const chatMessagesDiv = document.getElementById('chatMessages');
            chatMessagesDiv.innerHTML = '';
            messages.forEach(message => {
                if (message.is_game_invite)
                {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'chat-message';
                    const acceptButton = document.createElement('button');
                    acceptButton.innerText = 'Accept';
                    acceptButton.setAttribute('class', 'accept-button invite-buttons');
                    acceptButton.setAttribute('invite_id', message.content);
                    messageElement.appendChild(acceptButton);
                    chatMessagesDiv.appendChild(messageElement);
                }
                else
                {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'chat-message';
                    messageElement.innerText = `${message.sender}: ${message.content}`;
                    chatMessagesDiv.appendChild(messageElement);
                }
            });

            document.querySelectorAll('.invite-buttons').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const inviteId = button.getAttribute('invite_id');
                    navigateTo(`/privatepong?userid=${inviteId}`);
                });
            });

            chatSocket = openChatSocket(username, userId);
        }
    } catch (e) {
        console.log(e);
    }
}

const sendMessage = async (username) => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify({
            'message': message
        }));
        messageInput.value = '';
    } 
}

const renderChat = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        navigateTo('/');
        return;
    }

    try {
        const userId = localStorage.getItem('user_id');
        const response = await authFetch(`/api/user/${userId}/profile/?chat=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            showAlert(translations[localStorage.getItem('selectedLanguage')]['chat_sending_error'], 1);
            navigateTo('/');
            return;
        }
        
        const user = await response.json();
        
        document.querySelector("#g-msg-not-btn").setAttribute("style", "background: rgba(2,0,36,1);");
        maincontent.innerHTML = `
        <link rel="stylesheet" href="styles/chat/style.css">
        <div role="alert" id="status-alert">
        </div>
        <div id="chat-out-container">
            <div class="chat-container">
                <div class="friends-list" id="friends-list">

                </div>
                <div class="chat-area" id="chatArea">
                    <div class="chat-header" id="chatHeader">
                        <div class="chat-header-info" id="user-infos">
                            
                        </div>
                        <div class="chat-header-actions" id="friend-action-btns">
                            
                        </div>
                    </div>
                    <div class="chat-messages" id="chatMessages">

                    </div>
                    <div class="chat-input">
                        <input type="text" id="messageInput" placeholder="Type a message..." translate-id="typeamessageplaceholder">
                        <button id="send-message-btn" translate-id="send">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `;

        const friendListContent = document.querySelector('#friends-list');
        const friendListResponse = await authFetch(`/api/user/${localStorage.getItem('user_id')}/friendlist`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const friendListData = await friendListResponse.json();
        const timestamp = new Date().getTime();

        const blockedUserResponse = await authFetch(`/api/user/${localStorage.getItem('user_id')}/blockedusers`, {
            method: 'GET'
        });

        const blockedUserData = await blockedUserResponse.json();

        for (let i = 0; i < friendListData.length; i++) {
            let username = friendListData[i].username;
            let isOnline = friendListData[i].is_online;
            let isBlocked = 0;
           
            for (let j = 0; j < blockedUserData.length; j++)
            {
                if (friendListData[i].id == blockedUserData[j].blocked_user_id)
                {
                    isBlocked = 1;
                    break;
                }
            }

            let onlineStatusClass = isOnline ? 'online' : 'offline';

            friendListContent.innerHTML += `
            <div class="friend friend-div" friend-id="${friendListData[i].id}" friend-username="${username}" friend-blocked="${isBlocked}">
                <img src="/api/media/avatars/${username}.jpg?t=${timestamp}" alt="Avatar" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${username}</div>
                    <div class="friend-status">${onlineStatusClass}</div>
                </div>
            </div>
            `;
        }
        
        const friendDivs = document.querySelectorAll('.friend-div');
        for (let i = 0; i < friendDivs.length; i++)
        {
            friendDivs[i].addEventListener('click', (e)=>{
                e.preventDefault();
                const userid = friendDivs[i].getAttribute('friend-id');
                const username = friendDivs[i].getAttribute('friend-username');
                let isBlocked = friendDivs[i].getAttribute('friend-blocked');

                if (chatSocket != null)
                {
                    chatSocket.close();
                    chatSocket = null;
                }

                showOldMessages(username);

                const userInfos = document.querySelector('#user-infos');
                const userActionBtns = document.querySelector('#friend-action-btns');

                userInfos.innerHTML = `
                    <img src="/api/media/avatars/${username}.jpg?t=${timestamp}" alt="Avatar" class="chat-header-avatar">
                    <div class="chat-header-details">
                        <h4 class="chat-header-username">${username}</h4>
                    </div>
                `;

                userActionBtns.innerHTML = `
                    <button class="profile-button" id="friend-profile-btn" friend-id="${userid}">${getWord("profile")}</button>
                    <button class="block-button" id="friend-block-btn" friend-id="${userid}">${isBlocked == 1 ? getWord("unblock") : getWord("block") }</button>
                `;

                const friendProfileBtn = document.querySelector('#friend-profile-btn');
                friendProfileBtn.addEventListener('click', (e) => {
                    e.preventDefault
                    const friendId = friendProfileBtn.getAttribute('friend-id');
                    navigateTo(`/profile/user`, friendId);
                 });

                 // blocklama islemi eklenecek dahaca eklenmedi
                 document.getElementById("friend-block-btn").addEventListener('click', async (e) => {
                    e.preventDefault();
                    const friendId = document.getElementById("friend-block-btn").getAttribute('friend-id');
                    const response = await authFetch(`/api/user/${localStorage.getItem('user_id')}/block_user/`, {
                        method: 'POST',
                        headers: {
                        },
                        body: JSON.stringify({
                            'blocked_user_id': friendId,
                            'blockOrUnblock': document.getElementById("friend-block-btn").innerHTML === getWord("block") ? 1 : 0
                        })
                    });
                    
                    if (response.ok) {
                        //showAlert('User blocked successfully.');
                    } else {
                        //showAlert('An error occurred while blocking user.', 1);
                    }
                    if (friendDivs[i].getAttribute('friend-blocked') == 1)
                    {
                        document.getElementById("friend-block-btn").innerHTML = getWord("block");
                        //gBlockedUsers.splice(gBlockedUsers.indexOf(friendId), 1);
                        friendDivs[i].setAttribute('friend-blocked', 0);
                    }
                    else
                    {
                        document.getElementById("friend-block-btn").innerHTML = getWord("unblock");
                       // gBlockedUsers.push(friendId);
                        friendDivs[i].setAttribute('friend-blocked', 1);
                    }
                });
            });
        }

        document.querySelector('#send-message-btn').addEventListener('click', (e) => {
            e.preventDefault();
            sendMessage();
        });
        
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        changeLanguage();
    }catch(e)
    {
        console.log(e);
    }  
};
