import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, useFirebaseApp } from 'reactfire';
import { AuthContextApp } from './contexts/AuthContextApp';
import { getAuth } from 'firebase/auth';
import { Login } from './pages/Login';
import Chat from './pages/Chat';
import { History } from './pages/History';
import MainLayout from './layouts/MainLayout';
import { Settings } from './pages/Settings';

function App() {
  const firestoreInstance = getAuth(useFirebaseApp());
  return (
    <>
      <AuthProvider sdk={firestoreInstance}>
        <AuthContextApp>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<MainLayout />}>
              <Route path="chat" element={<Chat />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
            </Route>

          </Routes>
        </AuthContextApp>
      </AuthProvider>
    </>
  );
}

export default App;
