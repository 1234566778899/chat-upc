import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, FirestoreProvider, useFirebaseApp } from 'reactfire';
import { AuthContextApp } from './contexts/AuthContextApp';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Chat from './pages/Chat';
import { History } from './pages/History';
import MainLayout from './layouts/MainLayout';
import { Settings } from './pages/Settings';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

function App() {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestore}>
        <AuthContextApp>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={<MainLayout />}
            >
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="chat" element={<Chat />} />
              <Route path="/chat/:chatId" element={<Chat />} />
              <Route path="history" element={<History />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthContextApp>
      </FirestoreProvider>
    </AuthProvider>
  );
}

export default App;