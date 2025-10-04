async function verifyToken(token) {
    try {
        const response = await fetch('api/auth/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token })
        });

        if (response.ok) {
            return true;
        } else {
            const refreshAccessToken = async () => {
                const refreshResponse = await fetch('/api/auth/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') }),
                });
        
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    localStorage.setItem('access_token', refreshData.access);
                    return refreshData.access;
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigateTo('/');
                    return null;
                }
            };
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                localStorage.removeItem('refresh_token');
                navigateTo('/');
                return false;
            }
            return true;
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}

async function checkTokenAndRedirect() {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        const tokenValid = await verifyToken(accessToken);
        if (tokenValid) {
            navigateTo('/main');
            return true;
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
    return false;
}

async function requireAuth(callback) {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        const tokenValid = await verifyToken(accessToken);
        if (tokenValid) {
            callback();
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigateTo('/');
        }
    } else {
        navigateTo('/');
    }
}
