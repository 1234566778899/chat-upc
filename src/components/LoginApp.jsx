import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import React from 'react'
import '../styles/Login.css'
import { showInfoToast } from '../utils/showInfoToast';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
export const LoginApp = () => {
    const auth = getAuth();
    //auth.signOut() --salir
    const navigation = useNavigate();
    const { register, handleSubmit } = useForm();
    const signIn = (data) => {
        signInWithEmailAndPassword(auth, data.email, data.password)
            .then(res => {
                navigation('/admin/')
            })
            .catch(error => {
                showInfoToast(error.code.split('/')[1].split('-').join(' '));
            })
    }
    const signUp = (data) => {
        createUserWithEmailAndPassword(auth, data.email, data.password)
            .then(res => {
            })
            .catch(error => {
                console.log(error.code);
                showInfoToast(error.code.split('/')[1].split('-').join(' '));
            })
    }
    return (
        <div>LoginApp xd</div>
    )
}
