import { useState, useEffect } from 'react';

const useAuth = () => {
    const [auth, setAuth] = useState({
        user: null,
        foodPartner: null,
        isAuthenticated: false,
        role: null,
        loading: true
    });

    useEffect(() => {
        const checkAuth = () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const foodPartner = JSON.parse(localStorage.getItem('foodPartner'));

                if (user) {
                    setAuth({
                        user,
                        foodPartner: null,
                        isAuthenticated: true,
                        role: 'user',
                        loading: false
                    });
                } else if (foodPartner) {
                    setAuth({
                        user: null,
                        foodPartner,
                        isAuthenticated: true,
                        role: 'partner',
                        loading: false
                    });
                } else {
                    setAuth({
                        user: null,
                        foodPartner: null,
                        isAuthenticated: false,
                        role: null,
                        loading: false
                    });
                }
            } catch (error) {
                console.error("Error parsing auth from localStorage", error);
                setAuth(prev => ({ ...prev, loading: false }));
            }
        };

        checkAuth();
    }, []);

    return auth;
};

export default useAuth;
