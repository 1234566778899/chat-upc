import React, { useContext, useEffect, useState } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Avatar,
    Divider,
    Paper,
    Button,
    Menu,
    MenuItem,
    Chip,
    Fab,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Chat as ChatIcon,
    History as HistoryIcon,
    Home as HomeIcon,
    Settings as SettingsIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountCircleIcon,
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContextApp';
import { CompleteProfileModal } from '../pages/auth/CompleteProfileModal';

const drawerWidth = 280;

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const { user, auth, userData, getUserData } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleCompleteProfileClose = () => {
        setShowCompleteProfile(false);
    };

    const handleProfileUpdate = async () => {
        if (user) {
            await getUserData(user.uid);
        }
    };

    // En MainLayout.js, encuentra la función handleNewChat y cámbiala por:

    const handleNewChat = () => {
        // Simplemente navegar con un query param único
        navigate(`/chat?new=${Date.now()}`);

        if (isMobile) {
            setMobileOpen(false);
        }
    };

    useEffect(() => {
        if (userData) {
            const needsInfo =
                !userData.nombre ||
                !userData.apellido ||
                !userData.carrera ||
                userData.needsAdditionalInfo === true;

            if (needsInfo) {
                setShowCompleteProfile(true);
            }
        }
    }, [userData]);

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        }
    }, [user, navigate]);

    const menuItems = [
        { text: 'Chat Universitario', icon: <ChatIcon />, path: '/chat' },
        { text: 'Historial', icon: <HistoryIcon />, path: '/history' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const getInitials = () => {
        if (userData?.nombre && userData?.apellido) {
            return `${userData.nombre.charAt(0)}${userData.apellido.charAt(0)}`.toUpperCase();
        }
        if (user?.displayName) {
            const names = user.displayName.split(' ');
            return names.length > 1
                ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
                : names[0].substring(0, 2).toUpperCase();
        }
        return user?.email?.charAt(0).toUpperCase() || '?';
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h6" component="div" fontWeight="bold">
                        ChatBot UNI
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Asistente Virtual Universitario
                </Typography>
            </Box>
            <Divider />

            {/* Botón de Nuevo Chat */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewChat}
                    sx={{
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: 2,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    Nuevo Chat
                </Button>
            </Box>

            <Divider />

            {/* Perfil del Usuario */}
            <Box sx={{ p: 2 }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'grey.100',
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                        }
                    }}
                    onClick={handleMenuOpen}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={user?.photoURL}
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'primary.main',
                                fontWeight: 'bold'
                            }}
                        >
                            {getInitials()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body1"
                                fontWeight="600"
                                noWrap
                                color="text.primary"
                            >
                                {userData?.nombreCompleto || user?.displayName || 'Usuario'}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ display: 'block' }}
                            >
                                {user?.email}
                            </Typography>
                            {userData?.carrera && (
                                <Chip
                                    label={userData.carrera}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: '0.65rem',
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText'
                                    }}
                                />
                            )}
                        </Box>
                        <ExpandMoreIcon color="action" />
                    </Box>
                </Paper>
            </Box>

            <Divider />

            {/* Menú de Navegación */}
            <List sx={{ flexGrow: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname.startsWith(item.path)}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    }
                                },
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontWeight: 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Información de Ayuda */}
            <Box sx={{ p: 2 }}>
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 2
                    }}
                >
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 1,
                            bgcolor: 'primary.main'
                        }}
                    >
                        <SchoolIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                        ¿Necesitas ayuda?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Pregúntame sobre trámites, horarios, cursos y más
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Menu desplegable del usuario */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: 3
                    }
                }}
            >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Configuración</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); setShowCompleteProfile(true); }}>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Editar Perfil</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: 'error.main',
                        '&:hover': {
                            bgcolor: 'error.lighter'
                        }
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
            </Menu>

            <CompleteProfileModal
                open={showCompleteProfile}
                onClose={handleCompleteProfileClose}
                userData={userData}
                onUpdate={handleProfileUpdate}
            />

            {/* AppBar para móvil */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid',
                    borderBottomColor: 'grey.200',
                    display: { md: 'none' }
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            ChatBot UNI
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: 'none',
                            boxShadow: 3
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: '1px solid',
                            borderRightColor: 'grey.200'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: 'grey.50',
                    mt: { xs: '64px', md: 0 }
                }}
            >
                <Outlet />
            </Box>

            {/* FAB para nuevo chat en móvil */}
            {isMobile && location.pathname === '/history' && (
                <Tooltip title="Nuevo Chat" placement="left">
                    <Fab
                        color="primary"
                        onClick={handleNewChat}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            boxShadow: 4,
                            '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: 6
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>
            )}
        </Box>
    );
};

export default MainLayout;