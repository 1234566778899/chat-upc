import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    Stack
} from '@mui/material';
import {
    Person as PersonIcon,
    Work as WorkIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useFirestore, useAuth } from 'reactfire';
import { carreras } from '../../utils/constantes';

export const CompleteProfileModal = ({ open, onClose, userData, onUpdate }) => {
    const firestore = useFirestore();
    const auth = useAuth();
    const [formData, setFormData] = useState({
        nombre: userData?.nombre || '',
        apellido: userData?.apellido || '',
        carrera: userData?.carrera || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            return false;
        }
        if (!formData.apellido.trim()) {
            setError('El apellido es obligatorio');
            return false;
        }
        if (!formData.carrera) {
            setError('Debes seleccionar una carrera');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No hay usuario autenticado');
            }
            const userDocRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                nombreCompleto: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
                carrera: formData.carrera,
                needsAdditionalInfo: false,
                updatedAt: new Date()
            });

            await updateProfile(currentUser, {
                displayName: `${formData.nombre.trim()} ${formData.apellido.trim()}`
            });
            setSuccess(true);
            if (onUpdate) {
                await onUpdate();
            }
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 1500);

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            setError('Error al actualizar tu perfil. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading || (userData && !userData.carrera) ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={loading}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    ¡Completa tu perfil! 🎓
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Para brindarte una mejor experiencia, necesitamos algunos datos adicionales
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        icon={<CheckCircleIcon />}
                        sx={{ mb: 2, borderRadius: 2 }}
                    >
                        ¡Perfil actualizado exitosamente!
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5} mt={2}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            disabled={loading || success}
                            placeholder="Ej: Juan"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            disabled={loading || success}
                            placeholder="Ej: Pérez García"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Carrera"
                            name="carrera"
                            value={formData.carrera}
                            onChange={handleChange}
                            required
                            disabled={loading || success}
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
                                    borderRadius: 2
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
                    </Stack>
                </form>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={userData && userData.carrera ? onClose : undefined}
                    disabled={loading || success}
                    sx={{ borderRadius: 2 }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || success}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 3
                        }
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : success ? (
                        'Guardado ✓'
                    ) : (
                        'Guardar'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};