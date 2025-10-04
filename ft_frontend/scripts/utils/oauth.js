function initiateOAuth() {
    const authUrl = `/api/auth/oauth/login/`;
    
    window.location.replace(authUrl);    
}