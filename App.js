import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Login from './screens/Login';
import Register from './screens/register';
import Home from './screens/Home';
import Fitness from './screens/Fitness';
import Chat from './screens/Chat';
import './App.css';

function PrivateRoute({ children }) {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/" />;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/fitness"
            element={
              <PrivateRoute>
                <Fitness />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
