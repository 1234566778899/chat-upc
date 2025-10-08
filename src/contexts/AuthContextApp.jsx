import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from 'reactfire';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from 'reactfire';

export const AuthContext = createContext();

export const AuthContextApp = ({ children }) => {
    const auth = useAuth();
    const firestore = useFirestore();
    const [user, setUser] = useState(undefined); // undefined = loading, null = no autenticado, object = autenticado
    const [userData, setUserData] = useState(null); // Datos adicionales del usuario desde Firestore
    const [loading, setLoading] = useState(true);

    // Función para obtener datos del usuario desde Firestore
    const getUserData = async (uid) => {
        try {
            const userDocRef = doc(firestore, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                return data;
            } else {
                console.log('No se encontró documento del usuario en Firestore');
                setUserData(null);
                return null;
            }
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            setUserData(null);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await getUserData(currentUser.uid);
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const value = {
        user,
        auth,
        userData,
        setUserData,
        getUserData,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};