const authFetch = async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token');
    let refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken && !refreshToken) {
        navigateTo('/');
        return;
    }

    const refreshAccessToken = async () => {
        const refreshResponse = await fetch('/api/auth/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
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

    if (!accessToken) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
            localStorage.removeItem('refresh_token');
            navigateTo('/');
            return;
        }
    }

    const verifyAccessToken = async (token) => {
        const verifyResponse = await fetch('/api/auth/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
        return verifyResponse.ok;
    };

    if (!await verifyAccessToken(accessToken)) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
            localStorage.removeItem('refresh_token');
            navigateTo('/');
            return;
        }
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, options);
    return response;
};
