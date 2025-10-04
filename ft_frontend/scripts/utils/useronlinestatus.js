function userOnlineSocketStart(userId) {
    const socket = new WebSocket(`wss://${window.location.host}/ws/active/?user_id=` + userId);

    socket.onopen = function(e) {
        //socket.send(JSON.stringify({'type': 'connect', 'user_id': userId}));
    };

    socket.onclose = function(e) {
        //socket.send(JSON.stringify({'type': 'disconnect', 'user_id': userId}));
    };

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.message === 'messageHas')
        {
            if (window.location.pathname !== '/chat')
            {
                document.querySelector("#g-msg-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
            }
        }
        if (data.message === 'friendHas')
        {
            document.querySelector("#g-friend-not-btn").setAttribute("style", "background: linear-gradient(90deg, #ff5f6d, #ffc371);");
        }
    }

    socket.onerror = function(error) {

    };

    return socket;
}
