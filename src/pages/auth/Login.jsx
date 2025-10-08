import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Divider,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress,
    Link,
    Container,
    Stack
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
    Email as EmailIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from 'reactfire';
import { PasswordMascot } from './PasswordMascot';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();
    const firestore = useFirestore();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/chat');
        } catch (error) {
            console.error('Error en login:', error);
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('No existe una cuenta con este correo');
                    break;
                case 'auth/wrong-password':
                    setError('Contraseña incorrecta');
                    break;
                case 'auth/invalid-email':
                    setError('Correo electrónico inválido');
                    break;
                case 'auth/user-disabled':
                    setError('Esta cuenta ha sido deshabilitada');
                    break;
                case 'auth/too-many-requests':
                    setError('Demasiados intentos fallidos. Intenta más tarde');
                    break;
                default:
                    setError('Error al iniciar sesión. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const userDocRef = doc(firestore, 'users', result.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                const [nombre, ...apellidoArray] = result.user.displayName?.split(' ') || ['Usuario', 'Nuevo'];
                const apellido = apellidoArray.join(' ') || 'Nuevo';
                await setDoc(userDocRef, {
                    nombre: nombre,
                    apellido: apellido,
                    nombreCompleto: result.user.displayName || 'Usuario Nuevo',
                    carrera: '',
                    email: result.user.email,
                    photoURL: result.user.photoURL || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isGoogleUser: true,
                    needsAdditionalInfo: true,
                    stats: {
                        totalConversations: 0,
                        totalMessages: 0,
                        lastActivity: new Date()
                    }
                });
            } else {
                await setDoc(userDocRef, {
                    updatedAt: new Date(),
                    'stats.lastActivity': new Date()
                }, { merge: true });
            }
            navigate('/chat');
        } catch (error) {
            console.error('Error en login con Google:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Inicio de sesión cancelado');
            } else if (error.code === 'auth/network-request-failed') {
                setError('Error de conexión. Verifica tu internet');
            } else {
                setError('Error al iniciar sesión con Google');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordFocus = () => {
        setIsTypingPassword(true);
    };

    const handlePasswordBlur = () => {
        setIsTypingPassword(false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="sm">
                <Paper elevation={24} sx={{
                    p: 4,
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.95)'
                }}>
                    {/* Mascota Animada - SIEMPRE VISIBLE */}
                    <Box sx={{ mb: 2 }}>
                        <PasswordMascot
                            isPasswordVisible={showPassword}
                            isTyping={isTypingPassword}
                        />
                    </Box>

                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            ChatBot UNI
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Asistente Virtual Universitario
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login con Google */}
                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        sx={{
                            mb: 3,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderWidth: 2,
                            '&:hover': {
                                borderWidth: 2,
                                transform: 'translateY(-2px)',
                                boxShadow: 3
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        Continuar con Google
                    </Button>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            O ingresa con tu correo
                        </Typography>
                    </Divider>

                    {/* Formulario de Login */}
                    <form onSubmit={handleEmailLogin}>
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                label="Correo electrónico"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="tu-correo@ejemplo.com"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Contraseña"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={handlePasswordFocus}
                                onBlur={handlePasswordBlur}
                                required
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3
                                    }
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    boxShadow: 3,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 6
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </Button>
                        </Stack>
                    </form>

                    {/* Link a Registro */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            ¿No tienes una cuenta?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/register')}
                                sx={{
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Regístrate aquí
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};