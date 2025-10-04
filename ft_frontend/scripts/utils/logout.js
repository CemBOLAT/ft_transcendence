const logout = () => {
    if (userOnlineSocket)
    {
        //userOnlineSocket.send(JSON.stringify({'type': 'disconnect', 'user_id': localStorage.getItem('user_id')}));
        userOnlineSocket.close();
        userOnlineSocket = null;
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    navigateTo('/login');
};
