import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
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
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from 'reactfire';
import { PasswordMascot } from './PasswordMascot';

export const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        carrera: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isTypingPassword, setIsTypingPassword] = useState(false);
    const [isTypingConfirmPassword, setIsTypingConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();
    const firestore = useFirestore();
    const carreras = [
        'Ingeniería de Software',
        'Ingeniería de Sistemas',
        'Ciencia de la Computación',
        'Ingeniería Civil',
        'Ingeniería Industrial',
        'Ingeniería Empresarial',
        'Administración',
        'Marketing',
        'Contabilidad',
        'Economía',
        'Arquitectura',
        'Diseño Gráfico',
        'Diseño de Interiores',
        'Comunicación Audiovisual',
        'Periodismo',
        'Derecho',
        'Psicología',
        'Medicina Humana',
        'Nutrición',
        'Terapia Física',
        'Ingeniería Electrónica',
        'Ingeniería Mecatrónica',
        'Ingeniería de Telecomunicaciones',
        'Ingeniería Ambiental',
        'Ingeniería de Minas',
        'Gastronomía',
        'Hotelería y Administración'
    ].sort();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handlePasswordFocus = () => {
        setIsTypingPassword(true);
    };

    const handlePasswordBlur = () => {
        setIsTypingPassword(false);
    };

    const handleConfirmPasswordFocus = () => {
        setIsTypingConfirmPassword(true);
    };

    const handleConfirmPasswordBlur = () => {
        setIsTypingConfirmPassword(false);
    };

    const validateForm = () => {
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (!formData.nombre || !formData.apellido || !formData.carrera) {
            setError('Por favor completa todos los campos');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor ingresa un correo electrónico válido');
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            await updateProfile(userCredential.user, {
                displayName: `${formData.nombre} ${formData.apellido}`
            });
            await setDoc(doc(firestore, 'users', userCredential.user.uid), {
                nombre: formData.nombre,
                apellido: formData.apellido,
                nombreCompleto: `${formData.nombre} ${formData.apellido}`,
                carrera: formData.carrera,
                email: formData.email,
                createdAt: new Date(),
                updatedAt: new Date(),
                photoURL: userCredential.user.photoURL || null,
                isGoogleUser: false,
                stats: {
                    totalConversations: 0,
                    totalMessages: 0,
                    lastActivity: new Date()
                }
            });
            navigate('/chat');
        } catch (error) {
            console.error('Error en registro:', error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('Este correo ya está registrado');
                    break;
                case 'auth/invalid-email':
                    setError('Correo electrónico inválido');
                    break;
                case 'auth/weak-password':
                    setError('La contraseña es muy débil');
                    break;
                case 'auth/network-request-failed':
                    setError('Error de conexión. Verifica tu internet');
                    break;
                default:
                    setError('Error al crear la cuenta. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Determinar si debe mostrar la mascota tapando los ojos
    const isAnyPasswordFieldActive = isTypingPassword || isTypingConfirmPassword;
    const isAnyPasswordVisible = (isTypingPassword && showPassword) || (isTypingConfirmPassword && showConfirmPassword);

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="md">
                <Paper elevation={24} sx={{
                    p: 4,
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.95)'
                }}>
                    {/* Mascota Animada - SIEMPRE VISIBLE */}
                    <Box sx={{ mb: 2 }}>
                        <PasswordMascot
                            isPasswordVisible={isAnyPasswordVisible}
                            isTyping={isAnyPasswordFieldActive}
                        />
                    </Box>

                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            Crear Cuenta
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Únete a ChatBot UNI
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Formulario de Registro */}
                    <form onSubmit={handleRegister}>
                        <Stack spacing={2.5}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="primary" />
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
                                    label="Apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3
                                        }
                                    }}
                                />
                            </Box>

                            <TextField
                                fullWidth
                                select
                                label="Carrera"
                                name="carrera"
                                value={formData.carrera}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                SelectProps={{
                                    native: true,
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <WorkIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3
                                    }
                                }}
                            >
                                <option value="">Selecciona tu carrera</option>
                                {carreras.map((carrera) => (
                                    <option key={carrera} value={carrera}>
                                        {carrera}
                                    </option>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                label="Correo electrónico"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={handlePasswordFocus}
                                onBlur={handlePasswordBlur}
                                required
                                disabled={loading}
                                helperText="Mínimo 6 caracteres"
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

                            <TextField
                                fullWidth
                                label="Confirmar contraseña"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={handleConfirmPasswordFocus}
                                onBlur={handleConfirmPasswordBlur}
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
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                    'Crear Cuenta'
                                )}
                            </Button>
                        </Stack>
                    </form>

                    {/* Link a Login */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/login')}
                                sx={{
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Inicia sesión aquí
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};