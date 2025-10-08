import React from 'react';
import { Box, keyframes } from '@mui/material';

// Animaciones
const coverEyes = keyframes`
  0% { transform: translateY(-20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const uncoverEyes = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-20px); opacity: 0; }
`;

const blink = keyframes`
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
`;

export const PasswordMascot = ({ isPasswordVisible, isTyping }) => {
    const shouldCoverEyes = isTyping && !isPasswordVisible;

    return (
        <Box sx={{
            width: '100%',
            maxWidth: 200,
            height: 200,
            mx: 'auto',
            mb: 2,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* SVG Búho Universitario */}
            <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                    animation: shouldCoverEyes ? `${wiggle} 0.5s ease` : 'none'
                }}
            >
                {/* Cuerpo del búho */}
                <ellipse cx="100" cy="120" rx="60" ry="70" fill="#1976d2" />

                {/* Panza blanca */}
                <ellipse cx="100" cy="130" rx="40" ry="50" fill="#fff" opacity="0.9" />

                {/* Cabeza */}
                <circle cx="100" cy="70" r="50" fill="#1976d2" />

                {/* Orejas puntiagudas */}
                <path d="M 60 40 L 70 25 L 75 45 Z" fill="#1565c0" />
                <path d="M 140 40 L 130 25 L 125 45 Z" fill="#1565c0" />

                {/* Gafas de universitario */}
                <g>
                    {/* Marco izquierdo */}
                    <circle cx="80" cy="70" r="18" fill="none" stroke="#424242" strokeWidth="3" />
                    {/* Marco derecho */}
                    <circle cx="120" cy="70" r="18" fill="none" stroke="#424242" strokeWidth="3" />
                    {/* Puente */}
                    <line x1="98" y1="70" x2="102" y2="70" stroke="#424242" strokeWidth="3" />
                    {/* Patillas */}
                    <line x1="62" y1="70" x2="50" y2="68" stroke="#424242" strokeWidth="2" />
                    <line x1="138" y1="70" x2="150" y2="68" stroke="#424242" strokeWidth="2" />
                </g>

                {/* Ojos */}
                <g>
                    {/* Ojo izquierdo */}
                    <circle
                        cx="80"
                        cy="70"
                        r="12"
                        fill="#fff"
                        style={{
                            animation: !shouldCoverEyes ? `${blink} 4s infinite` : 'none',
                            transformOrigin: '80px 70px'
                        }}
                    />
                    <circle cx="80" cy="70" r="6" fill="#1a237e" />
                    <circle cx="82" cy="68" r="2" fill="#fff" />

                    {/* Ojo derecho */}
                    <circle
                        cx="120"
                        cy="70"
                        r="12"
                        fill="#fff"
                        style={{
                            animation: !shouldCoverEyes ? `${blink} 4s infinite 0.1s` : 'none',
                            transformOrigin: '120px 70px'
                        }}
                    />
                    <circle cx="120" cy="70" r="6" fill="#1a237e" />
                    <circle cx="122" cy="68" r="2" fill="#fff" />
                </g>

                {/* Alas tapando los ojos - Animadas */}
                <g style={{
                    animation: shouldCoverEyes ? `${coverEyes} 0.3s forwards` : `${uncoverEyes} 0.3s forwards`,
                    opacity: shouldCoverEyes ? 1 : 0,
                    transformOrigin: '100px 70px'
                }}>
                    {/* Ala izquierda cubriendo */}
                    <ellipse
                        cx="75"
                        cy="70"
                        rx="25"
                        ry="20"
                        fill="#1565c0"
                        transform="rotate(-20 75 70)"
                    />
                    <path
                        d="M 55 65 Q 50 70 55 75 L 70 70 Z"
                        fill="#0d47a1"
                    />

                    {/* Ala derecha cubriendo */}
                    <ellipse
                        cx="125"
                        cy="70"
                        rx="25"
                        ry="20"
                        fill="#1565c0"
                        transform="rotate(20 125 70)"
                    />
                    <path
                        d="M 145 65 Q 150 70 145 75 L 130 70 Z"
                        fill="#0d47a1"
                    />
                </g>

                {/* Pico */}
                <path d="M 100 80 L 95 90 L 105 90 Z" fill="#ff9800" />

                {/* Alas laterales */}
                <ellipse cx="50" cy="130" rx="15" ry="35" fill="#1565c0" transform="rotate(-20 50 130)" />
                <ellipse cx="150" cy="130" rx="15" ry="35" fill="#1565c0" transform="rotate(20 150 130)" />

                {/* Patas */}
                <g>
                    <ellipse cx="85" cy="180" rx="8" ry="12" fill="#ff9800" />
                    <ellipse cx="115" cy="180" rx="8" ry="12" fill="#ff9800" />
                    {/* Deditos */}
                    <circle cx="80" cy="188" r="3" fill="#ff9800" />
                    <circle cx="90" cy="188" r="3" fill="#ff9800" />
                    <circle cx="110" cy="188" r="3" fill="#ff9800" />
                    <circle cx="120" cy="188" r="3" fill="#ff9800" />
                </g>

                {/* Birrete universitario */}
                <g>
                    {/* Base del birrete */}
                    <ellipse cx="100" cy="32" rx="35" ry="8" fill="#1a237e" />
                    {/* Parte superior */}
                    <rect x="75" y="20" width="50" height="12" fill="#1a237e" rx="2" />
                    {/* Botón */}
                    <circle cx="100" cy="23" r="3" fill="#ffd700" />
                    {/* Borla */}
                    <line x1="100" y1="23" x2="115" y2="15" stroke="#ffd700" strokeWidth="1.5" />
                    <circle cx="115" cy="15" r="4" fill="#ffd700" />
                </g>
            </svg>
        </Box>
    );
};