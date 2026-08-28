// import React, { createContext, useState, useEffect } from 'react';
// import { getProfileApi } from '../api/auth';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // অ্যাপ লোড হওয়ার সময় লোকাল টোকেন থাকলে প্রোফাইল নিয়ে আসা
//     useEffect(() => {
//         const checkAuth = async () => {
//             const token = localStorage.getItem('token');
//             if (token) {
//                 try {
//                     const res = await getProfileApi();
//                     setUser(res.data);
//                 } catch (error) {
//                     console.error('Session expired or invalid token');
//                     localStorage.removeItem('token');
//                     localStorage.removeItem('user');
//                     setUser(null);
//                 }
//             }
//             setLoading(false);
//         };

//         checkAuth();
//     }, []);

//     // সেভ করার ফাংশন
//     const saveAuthData = (token, userData) => {
//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(userData));
//         setUser(userData);
//     };

//     // লগআউট ফাংশন
//     const logout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, setUser, loading, saveAuthData, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };



import React, { createContext, useState, useEffect } from 'react';
import { getProfileApi } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // অ্যাপ লোড হওয়ার সময় টোকেন ভ্যালিডেশন
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await getProfileApi();
                    setUser(res.data);
                } catch (error) {
                    console.error('Session expired or invalid token:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // সেভ করার ফাংশন
    const saveAuthData = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // লগআউট ফাংশন
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, saveAuthData, logout }}>
            {children}
        </AuthContext.Provider>
    );
};