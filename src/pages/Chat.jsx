import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    Chip,
    Stack,
    List,
    ListItem,
    CircularProgress,
    Fade,
    Badge,
    Tooltip,
    useTheme,
    useMediaQuery,
    InputAdornment,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    School as SchoolIcon,
    MoreVert as MoreVertIcon,
    EmojiEmotions as EmojiIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContextApp';
import { CONFIG } from '../config';

const Chat = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const firestore = getFirestore();

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: '¡Hola! 👋 Soy tu asistente virtual universitario. Puedo ayudarte con información sobre trámites, horarios, cursos, fechas importantes y mucho más.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'welcome'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const loadedChatIdRef = useRef(null);
    const lastNewParamRef = useRef(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const API_BASE_URL = `${CONFIG.uri}/api/chat`;

    const suggestions = [
        { text: '📅 Fechas de matrícula', query: 'fechas de matrícula 2024', color: 'primary' },
        { text: '⏰ Horarios de atención', query: 'horarios de atención', color: 'secondary' },
        { text: '📚 Lista de cursos', query: 'cursos disponibles', color: 'success' },
        { text: '💰 Información de becas', query: 'becas universitarias', color: 'warning' },
        { text: '📋 Proceso de admisión', query: 'proceso de admisión', color: 'info' },
        { text: '🏢 Ubicación de oficinas', query: 'ubicación oficinas administrativas', color: 'error' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        checkServerHealth();
    }, []);

    // DETECTAR ?new= para resetear el chat
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const newParam = searchParams.get('new');

        if (newParam && newParam !== lastNewParamRef.current) {
            console.log('✅ RESETEAR CHAT - Param:', newParam);
            console.log('Mensajes antes:', messages.length);

            lastNewParamRef.current = newParam;
            loadedChatIdRef.current = null;
            setCurrentChatId(null);
            setShowSuggestions(true);
            setInputMessage('');
            setError(null);
            setIsTyping(false);

            // FORZAR reseteo completo de mensajes
            const newMessages = [
                {
                    id: Date.now(),
                    text: '¡Hola! 👋 Soy tu asistente virtual universitario. Puedo ayudarte con información sobre trámites, horarios, cursos, fechas importantes y mucho más.',
                    sender: 'bot',
                    timestamp: new Date(),
                    type: 'welcome'
                }
            ];

            setMessages(newMessages);
            console.log('Mensajes después:', newMessages.length);

            // Limpiar URL
            setTimeout(() => {
                navigate('/chat', { replace: true });
            }, 100);
        }
    }, [location.search, navigate]);

    // Cargar chat desde History
    useEffect(() => {
        if (!user || !chatId) return;

        if (loadedChatIdRef.current !== chatId) {
            loadedChatIdRef.current = chatId;
            loadChat(chatId);
        }
    }, [chatId, user]);

    const checkServerHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                setServerStatus('online');
            } else {
                setServerStatus('offline');
            }
        } catch (error) {
            console.error('Error checking server health:', error);
            setServerStatus('offline');
        }
    };

    const convertTimestampToDate = (timestamp) => {
        if (!timestamp) return new Date();
        if (timestamp instanceof Date) return timestamp;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
        if (typeof timestamp === 'number') return new Date(timestamp);
        if (typeof timestamp === 'string') return new Date(timestamp);
        return new Date();
    };

    const loadChat = async (id) => {
        setIsLoadingChat(true);
        try {
            const chatDocRef = doc(firestore, 'chats', id);
            const chatDoc = await getDoc(chatDocRef);

            if (chatDoc.exists()) {
                const chatData = chatDoc.data();

                if (chatData.userId !== user.uid) {
                    setError('No tienes acceso a este chat');
                    navigate('/chat');
                    return;
                }

                const loadedMessages = (chatData.messages || []).map(msg => ({
                    ...msg,
                    timestamp: convertTimestampToDate(msg.timestamp)
                }));

                setMessages(loadedMessages);
                setCurrentChatId(id);
                setShowSuggestions(false);
            } else {
                setError('Chat no encontrado');
                navigate('/chat');
            }
        } catch (error) {
            console.error('Error loading chat:', error);
            setError('Error al cargar el chat');
        } finally {
            setIsLoadingChat(false);
        }
    };

    const createNewChat = async (firstMessage, firstResponse) => {
        if (!user) {
            console.error('No hay usuario autenticado');
            return null;
        }

        try {
            const newChatRef = doc(firestore, 'chats', `${user.uid}_${Date.now()}`);
            const title = firstMessage.length > 50
                ? firstMessage.substring(0, 47) + '...'
                : firstMessage;

            const now = new Date();

            const welcomeMessage = {
                id: 1,
                text: '¡Hola! 👋 Soy tu asistente virtual universitario. Puedo ayudarte con información sobre trámites, horarios, cursos, fechas importantes y mucho más.',
                sender: 'bot',
                timestamp: now.getTime(),
                type: 'welcome'
            };

            const userMessage = {
                id: Date.now(),
                text: firstMessage,
                sender: 'user',
                timestamp: now.getTime()
            };

            const botMessage = {
                id: Date.now() + 1,
                text: firstResponse,
                sender: 'bot',
                timestamp: now.getTime(),
                fromAPI: true
            };

            const chatData = {
                userId: user.uid,
                title: title,
                lastMessage: firstResponse,
                messages: [welcomeMessage, userMessage, botMessage],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(newChatRef, chatData);

            setCurrentChatId(newChatRef.id);
            loadedChatIdRef.current = newChatRef.id;

            window.history.replaceState(null, '', `/chat/${newChatRef.id}`);

            return newChatRef.id;
        } catch (error) {
            console.error('Error creating chat:', error);
            setError('Error al crear el chat');
            return null;
        }
    };

    const updateExistingChat = async (chatId, newUserMessage, newBotMessage) => {
        if (!user) return;

        try {
            const chatDocRef = doc(firestore, 'chats', chatId);

            const userMessageToSave = {
                ...newUserMessage,
                timestamp: newUserMessage.timestamp.getTime()
            };

            const botMessageToSave = {
                ...newBotMessage,
                timestamp: newBotMessage.timestamp.getTime()
            };

            await updateDoc(chatDocRef, {
                lastMessage: newBotMessage.text,
                messages: arrayUnion(userMessageToSave, botMessageToSave),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating chat:', error);
            setError('Error al guardar el mensaje');
        }
    };

    const callBackendAPI = async (pregunta) => {
        try {
            const response = await fetch(`${API_BASE_URL}/pregunta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pregunta })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la respuesta del servidor');
            }

            if (!data.success) {
                throw new Error(data.error || 'Error en el procesamiento de la pregunta');
            }

            return data.respuesta;
        } catch (error) {
            console.error('Error calling backend API:', error);
            throw error;
        }
    };

    const handleSendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        if (serverStatus === 'offline') {
            setError('No hay conexión con el servidor. Intenta más tarde.');
            return;
        }

        if (!user) {
            setError('Debes iniciar sesión para enviar mensajes');
            return;
        }

        const newMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsTyping(true);
        setShowSuggestions(false);
        setError(null);

        try {
            const botResponse = await callBackendAPI(messageText);

            const botMessage = {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date(),
                fromAPI: true
            };

            setMessages(prev => [...prev, botMessage]);
            setServerStatus('online');

            if (!currentChatId) {
                await createNewChat(messageText, botResponse);
            } else {
                await updateExistingChat(currentChatId, newMessage, botMessage);
            }

        } catch (error) {
            console.error('Error getting response:', error);

            let errorMessage = 'Hubo un problema al procesar tu pregunta. ';

            if (error.message.includes('fetch')) {
                errorMessage += 'Verifica que el servidor esté ejecutándose.';
                setServerStatus('offline');
            } else if (error.message.includes('429')) {
                errorMessage += 'Demasiadas solicitudes. Intenta en unos minutos.';
            } else if (error.message.includes('autenticación')) {
                errorMessage += 'Error de configuración del asistente.';
            } else {
                errorMessage += error.message;
            }

            const errorBotMessage = {
                id: Date.now() + 1,
                text: `❌ ${errorMessage}\n\n🔄 Puedes intentar de nuevo o contactar al administrador si el problema persiste.`,
                sender: 'bot',
                timestamp: new Date(),
                isError: true
            };

            setMessages(prev => [...prev, errorBotMessage]);
            setError(errorMessage);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(suggestion.query);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatMessageText = (text) => {
        if (!text) return '';

        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(\d+)\.\s+([^:]+):/g, '$1. <strong style="color: inherit; font-weight: 700;">$2:</strong>')
            .replace(/^(\d+)\.\s+(.*$)/gm, '<div style="margin: 18px 0 14px 0; padding: 16px 12px; border-left: 4px solid currentColor; background: rgba(255, 255, 255, 0.12); border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="display: flex; align-items: flex-start; gap: 12px;"><span style="font-weight: 700; color: inherit; background: rgba(255, 255, 255, 0.25); padding: 6px 10px; border-radius: 6px; font-size: 0.85em; min-width: 28px; text-align: center; border: 1px solid rgba(255,255,255,0.3);">$1</span><span style="color: inherit; line-height: 1.6; flex: 1;">$2</span></div></div>')
            .replace(/^•\s+(.*$)/gm, '<div style="margin: 12px 0; padding: 12px 16px 12px 36px; position: relative; color: inherit; background: rgba(255, 255, 255, 0.08); border-radius: 6px;"><span style="color: inherit; position: absolute; left: 12px; top: 12px; font-weight: bold; font-size: 1.1em;">💡</span><span style="line-height: 1.6;">$1</span></div>')
            .replace(/^([A-ZÁÉÍÓÚ][^:]{3,}):(?=\s|$)/gm, '<div style="font-weight: 700; color: inherit; margin: 20px 0 12px 0; font-size: 1.15em; padding: 12px 16px; background: rgba(255, 255, 255, 0.15); border-radius: 8px; border-left: 5px solid currentColor; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎯 $1:</div>')
            .replace(/\n\n/g, '</p><p style="margin: 16px 0; line-height: 1.7; color: inherit;">')
            .replace(/\n/g, '<br/>')
            .replace(/\.([A-ZÁÉÍÓÚ])/g, '. $1')
            .replace(/\b(objetivo|metodología|resultados|conclusiones|investigación|estudio|análisis|datos|importante|atención|nota|recomendación|limitaciones)\b/gi, '<span class="keyword-highlight">$1</span>')
            .replace(/\s+/g, ' ')
            .trim();

        if (!formattedText.includes('<div') && !formattedText.includes('<p')) {
            formattedText = `<p style="margin: 0; line-height: 1.7; color: inherit; font-weight: 500;">${formattedText}</p>`;
        } else {
            formattedText = `<div style="line-height: 1.7; color: inherit; font-size: 14px; font-weight: 500;">${formattedText}</div>`;
        }

        return formattedText;
    };

    const handleRetry = () => {
        checkServerHealth();
        setError(null);
    };

    const getConnectionStatusColor = () => {
        switch (serverStatus) {
            case 'online': return 'success.main';
            case 'offline': return 'error.main';
            default: return 'warning.main';
        }
    };

    const getConnectionStatusText = () => {
        switch (serverStatus) {
            case 'online': return 'En línea • Tiempo de respuesta: ~5 seg';
            case 'offline': return 'Sin conexión • Servidor desconectado';
            default: return 'Verificando conexión...';
        }
    };

    if (isLoadingChat) {
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
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f0f2f5',
            position: 'relative'
        }}>
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    borderRadius: 0
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: getConnectionStatusColor(),
                                    border: '2px solid white'
                                }} />
                            }
                        >
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'primary.main',
                                    mr: 2
                                }}
                            >
                                <SchoolIcon />
                            </Avatar>
                        </Badge>

                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                ChatBot UNI
                            </Typography>
                            <Typography
                                variant="caption"
                                color={serverStatus === 'online' ? 'success.main' : 'error.main'}
                                fontWeight="500"
                            >
                                {getConnectionStatusText()}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {serverStatus === 'offline' && (
                            <Tooltip title="Reconectar">
                                <IconButton onClick={handleRetry} color="primary">
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                px: isMobile ? 1 : 3,
                py: 2,
                minHeight: 0,
                mb: showSuggestions ? '160px' : '80px'
            }}>
                <List sx={{ py: 0, maxWidth: 900, mx: 'auto' }}>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                py: 0.5,
                                px: 0
                            }}
                        >
                            <Fade in timeout={500}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                    maxWidth: '85%',
                                    gap: 1
                                }}>
                                    {message.sender === 'bot' && (
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: message.isError ? 'error.main' : 'primary.main',
                                                mb: 0.5
                                            }}
                                        >
                                            {message.isError ? <ErrorIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
                                        </Avatar>
                                    )}

                                    <Paper
                                        elevation={message.sender === 'user' ? 2 : 1}
                                        sx={{
                                            p: 2,
                                            bgcolor: message.sender === 'user'
                                                ? 'primary.main'
                                                : message.isError
                                                    ? 'error.light'
                                                    : 'white',
                                            color: message.sender === 'user'
                                                ? 'white'
                                                : message.isError
                                                    ? 'error.contrastText'
                                                    : 'text.primary',
                                            borderRadius: 3,
                                            borderBottomLeftRadius: message.sender === 'bot' ? 0.5 : 3,
                                            borderBottomRightRadius: message.sender === 'user' ? 0.5 : 3,
                                            minWidth: 100,
                                            maxWidth: '100%',
                                            position: 'relative',
                                            ...(message.type === 'welcome' && {
                                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                                color: 'white'
                                            })
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                mb: 1,
                                                '& p': {
                                                    margin: '0 0 10px 0',
                                                    lineHeight: 1.6
                                                },
                                                '& p:last-child': { margin: 0 },
                                                '& div': {
                                                    margin: '6px 0',
                                                    lineHeight: 1.5
                                                },
                                                '& strong': {
                                                    fontWeight: 600,
                                                    color: 'inherit'
                                                },
                                                '& br': { lineHeight: 1.6 },
                                                '& .keyword-highlight': {
                                                    fontWeight: 600,
                                                    padding: '1px 4px',
                                                    borderRadius: '3px',
                                                    color: 'inherit',
                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.3)'
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: formatMessageText(message.text)
                                            }}
                                        />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    opacity: 0.7,
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {convertTimestampToDate(message.timestamp).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>

                                            {message.fromAPI && (
                                                <Chip
                                                    label="AI"
                                                    size="small"
                                                    sx={{
                                                        height: '16px',
                                                        fontSize: '0.6rem',
                                                        opacity: 0.7,
                                                        bgcolor: 'rgba(255,255,255,0.2)',
                                                        color: 'inherit'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Paper>
                                </Box>
                            </Fade>
                        </ListItem>
                    ))}

                    {isTyping && (
                        <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                            <Fade in>
                                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        <SchoolIcon fontSize="small" />
                                    </Avatar>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 3,
                                            borderBottomLeftRadius: 0.5,
                                            bgcolor: 'white'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={12} />
                                            <Typography variant="body2" color="text.secondary">
                                                Consultando al asistente...
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>
                            </Fade>
                        </ListItem>
                    )}
                </List>
                <div ref={messagesEndRef} />
            </Box>

            {showSuggestions && !currentChatId && (
                <Box sx={{
                    position: 'sticky',
                    bottom: '80px',
                    px: isMobile ? 1 : 3,
                    py: 1,
                    bgcolor: 'rgba(240, 242, 245, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    zIndex: 99
                }}>
                    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            💡 Sugerencias para empezar:
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            ...(isMobile && {
                                overflowX: 'auto',
                                flexWrap: 'nowrap',
                                pb: 1,
                                '&::-webkit-scrollbar': { height: 4 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 2 }
                            })
                        }}>
                            {suggestions.map((suggestion, index) => (
                                <Chip
                                    key={index}
                                    label={suggestion.text}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    color={suggestion.color}
                                    variant="outlined"
                                    disabled={serverStatus === 'offline'}
                                    sx={{
                                        borderRadius: 5,
                                        height: 32,
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        minWidth: isMobile ? 'auto' : 'fit-content',
                                        whiteSpace: 'nowrap',
                                        bgcolor: 'white',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: 2
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}

            <Paper
                elevation={4}
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    p: 2,
                    bgcolor: 'white',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    zIndex: 100
                }}
            >
                <Box sx={{
                    maxWidth: 900,
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1
                }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder={serverStatus === 'offline'
                            ? "Servidor desconectado..."
                            : "Escribe tu pregunta sobre la universidad..."
                        }
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={serverStatus === 'offline' || isTyping}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 6,
                                bgcolor: serverStatus === 'offline' ? 'grey.100' : '#f5f5f5',
                                border: 'none',
                                '&:hover': {
                                    bgcolor: serverStatus === 'offline' ? 'grey.100' : '#eeeeee'
                                },
                                '&.Mui-focused': {
                                    bgcolor: 'white',
                                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                                }
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Adjuntar archivo">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    disabled={serverStatus === 'offline'}
                                                >
                                                    <AttachFileIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Emoji">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    disabled={serverStatus === 'offline'}
                                                >
                                                    <EmojiIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Tooltip title={serverStatus === 'offline' ? "Servidor desconectado" : "Enviar mensaje"}>
                        <span>
                            <IconButton
                                onClick={() => handleSendMessage()}
                                disabled={!inputMessage.trim() || serverStatus === 'offline' || isTyping}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 48,
                                    height: 48,
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                        transform: 'scale(1.05)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'grey.300',
                                        color: 'grey.500',
                                        transform: 'none'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                <Box sx={{
                    maxWidth: 900,
                    mx: 'auto',
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" color="text.secondary">
                        Presiona Enter para enviar, Shift+Enter para nueva línea
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getConnectionStatusColor()
                        }} />
                        <Typography variant="caption" color="text.secondary">
                            {serverStatus === 'online' ? 'Conectado' :
                                serverStatus === 'offline' ? 'Desconectado' : 'Verificando...'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setError(null)}
                    severity="error"
                    sx={{ width: '100%' }}
                    action={
                        <IconButton
                            size="small"
                            onClick={handleRetry}
                            color="inherit"
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chat;