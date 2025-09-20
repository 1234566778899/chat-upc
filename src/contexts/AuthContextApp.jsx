import React, { createContext } from 'react'
import { useAuth, useUser } from 'reactfire';
export const AuthContext = createContext();
export const AuthContextApp = ({ children }) => {
    const { data: user } = useUser();
    const auth = useAuth();
    return (
        <AuthContext.Provider value={{ user, auth }}>
            {children}
        </AuthContext.Provider>
    )
}
