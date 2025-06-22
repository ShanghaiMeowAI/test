import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Environments } from './pages/Environments';
import { Licenses } from './pages/Licenses';
import { Users } from './pages/Users';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="environments" element={<Environments />} />
              <Route path="licenses" element={<Licenses />} />
              <Route path="users" element={<Users />} />
              <Route path="logs" element={<Logs />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
