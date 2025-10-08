import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItemButton,
    IconButton,
    Avatar,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Divider,
    Stack,
    Alert,
    Fade,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Search as SearchIcon,
    Chat as ChatIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteIcon,
    Sort as SortIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContextApp';

export const History = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [sortBy, setSortBy] = useState('recent');
    const [error, setError] = useState(null);
    const [chats, setChats] = useState([]);
    const [status, setStatus] = useState('loading');

    // Cargar chats con onSnapshot (tiempo real)
    useEffect(() => {
        if (!user) {
            setStatus('idle');
            setChats([]);
            return;
        }

        setStatus('loading');

        try {
            const firestore = getFirestore();
            const chatsQuery = query(
                collection(firestore, 'chats'),
                where('userId', '==', user.uid),
                orderBy('updatedAt', 'desc')
            );

            const unsubscribe = onSnapshot(
                chatsQuery,
                (snapshot) => {
                    const loadedChats = [];
                    snapshot.forEach((doc) => {
                        loadedChats.push({ id: doc.id, ...doc.data() });
                    });
                    setChats(loadedChats);
                    setStatus('success');
                },
                (err) => {
                    console.error('Error loading chats:', err);
                    setError('Error al cargar el historial');
                    setStatus('error');
                }
            );

            return () => unsubscribe();
        } catch (error) {
            console.error('Error setting up chats listener:', error);
            setStatus('error');
            setError('Error al configurar el historial');
        }
    }, [user]);

    // Filtrar y ordenar chats
    const filteredChats = useMemo(() => {
        if (!chats) return [];

        let filtered = [...chats];

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(chat =>
                chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Ordenar
        switch (sortBy) {
            case 'recent':
                filtered.sort((a, b) => {
                    const dateA = a.updatedAt?.toDate?.() || new Date(0);
                    const dateB = b.updatedAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                filtered.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateA - dateB;
                });
                break;
            case 'alphabetical':
                filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            default:
                break;
        }

        return filtered;
    }, [chats, searchTerm, sortBy]);

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    const handleMenuOpen = (event, chat) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedChat(chat);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedChat(null);
    };

    const handleDeleteClick = (chat) => {
        setChatToDelete(chat);
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        if (!chatToDelete) return;

        try {
            const firestore = getFirestore();
            await deleteDoc(doc(firestore, 'chats', chatToDelete.id));
            setDeleteDialogOpen(false);
            setChatToDelete(null);
        } catch (error) {
            console.error('Error deleting chat:', error);
            setError('Error al eliminar el chat');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setChatToDelete(null);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Sin fecha';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            return 'Hace menos de 1 hora';
        } else if (diffInHours < 24) {
            return `Hace ${Math.floor(diffInHours)} ${Math.floor(diffInHours) === 1 ? 'hora' : 'horas'}`;
        } else if (diffInDays < 7) {
            return `Hace ${Math.floor(diffInDays)} ${Math.floor(diffInDays) === 1 ? 'día' : 'días'}`;
        } else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getMessageCount = (chat) => {
        return chat.messages?.length || 0;
    };

    const getChatStats = () => {
        const totalChats = chats?.length || 0;
        const totalMessages = chats?.reduce((sum, chat) => sum + getMessageCount(chat), 0) || 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const chatsToday = chats?.filter(chat => {
            const chatDate = chat.updatedAt?.toDate?.() || new Date(0);
            return chatDate >= today;
        }).length || 0;

        return { totalChats, totalMessages, chatsToday };
    };

    const stats = getChatStats();

    if (status === 'loading') {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: '#f0f2f5'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f0f2f5',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0
                }}
            >

                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    📚 Historial de Conversaciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Revisa y continúa tus conversaciones anteriores
                </Typography>

                {/* Stats Cards */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            flex: 1,
                            minWidth: isMobile ? '100%' : 'auto',
                            bgcolor: 'primary.lighter',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'primary.light'
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            {stats.totalChats}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total de chats
                        </Typography>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            flex: 1,
                            minWidth: isMobile ? '100%' : 'auto',
                            bgcolor: 'success.lighter',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'success.light'
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                            {stats.totalMessages}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Mensajes
                        </Typography>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            flex: 1,
                            minWidth: isMobile ? '100%' : 'auto',
                            bgcolor: 'info.lighter',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'info.light'
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                            {stats.chatsToday}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Hoy
                        </Typography>
                    </Paper>
                </Stack>

                {/* Search and Sort */}
                <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                    <TextField
                        fullWidth
                        placeholder="Buscar en el historial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 3,
                                bgcolor: '#f5f5f5',
                                '&:hover': {
                                    bgcolor: '#eeeeee'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                            }
                        }}
                    />

                    <TextField
                        select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            minWidth: isMobile ? '100%' : 200,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: '#f5f5f5'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SortIcon fontSize="small" color="action" />
                                </InputAdornment>
                            )
                        }}
                    >
                        <MenuItem value="recent">Más recientes</MenuItem>
                        <MenuItem value="oldest">Más antiguos</MenuItem>
                        <MenuItem value="alphabetical">Alfabético</MenuItem>
                    </TextField>
                </Stack>

            </Paper>

            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ m: 2, maxWidth: 1200, mx: 'auto', width: '100%' }}
                >
                    {error}
                </Alert>
            )}

            {/* Chat List */}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                px: isMobile ? 1 : 3,
                py: 2
            }}>
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    {filteredChats.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                bgcolor: 'white',
                                borderRadius: 3
                            }}
                        >
                            <ChatIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {searchTerm ? 'No se encontraron chats' : 'No hay conversaciones aún'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {searchTerm
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Inicia una nueva conversación para comenzar'
                                }
                            </Typography>
                            {!searchTerm && (
                                <Button
                                    variant="contained"
                                    startIcon={<ChatIcon />}
                                    onClick={() => navigate('/chat')}
                                    sx={{ borderRadius: 3 }}
                                >
                                    Iniciar Chat
                                </Button>
                            )}
                        </Paper>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {filteredChats.map((chat, index) => (
                                <Fade in key={chat.id} timeout={300 + index * 50}>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            mb: 2,
                                            overflow: 'hidden',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3
                                            }
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => handleChatClick(chat.id)}
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                gap: 2,
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    width: 48,
                                                    height: 48,
                                                    mt: 0.5
                                                }}
                                            >
                                                <ChatIcon />
                                            </Avatar>

                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="600"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            pr: 1
                                                        }}
                                                    >
                                                        {chat.title}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, chat)}
                                                        sx={{ flexShrink: 0 }}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        mb: 1
                                                    }}
                                                >
                                                    {chat.lastMessage}
                                                </Typography>

                                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                                    <Chip
                                                        label={formatDate(chat.updatedAt)}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 24, fontSize: '0.7rem' }}
                                                    />
                                                    <Chip
                                                        label={`${getMessageCount(chat)} mensajes`}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{ height: 24, fontSize: '0.7rem' }}
                                                    />
                                                </Stack>
                                            </Box>
                                        </ListItemButton>
                                    </Paper>
                                </Fade>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        minWidth: 180,
                        boxShadow: 3
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        if (selectedChat) {
                            handleChatClick(selectedChat.id);
                        }
                        handleMenuClose();
                    }}
                >
                    <ChatIcon fontSize="small" sx={{ mr: 1 }} />
                    Abrir chat
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => handleDeleteClick(selectedChat)}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Eliminar
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle>¿Eliminar conversación?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la conversación "{chatToDelete?.title}".
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleDeleteCancel} variant="outlined" sx={{ borderRadius: 2 }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2 }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};