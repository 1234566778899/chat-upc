import React, { useState } from 'react';
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
    Container,
    Avatar,
    Divider,
    Paper
} from '@mui/material';
import {
    Menu as MenuIcon,
    Chat as ChatIcon,
    History as HistoryIcon,
    Home as HomeIcon,
    Settings as SettingsIcon,
    School as SchoolIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280;

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Inicio', icon: <HomeIcon />, path: '/' },
        { text: 'Chat Universitario', icon: <ChatIcon />, path: '/chat' },
        { text: 'Historial', icon: <HistoryIcon />, path: '/history' },
        { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', }}>

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

            {/* Menu Items */}
            <List sx={{ flexGrow: 1, pt: 2, }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
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

            {/* Footer del Drawer */}
            <Box sx={{ p: 2 }}>
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200'
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

            {/* AppBar */}
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
                }}
            >

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
                        keepMounted: true, // Mejor rendimiento en móvil
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
                    bgcolor: 'grey.50'
                }}
            >

                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;