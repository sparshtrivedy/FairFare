import React, { createContext, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Layout from './pages/Layout';
import Login from './pages/Login';

export const AuthContext = createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userEmail, setUserEmail }}>
        <Router>
          <Layout />
        </Router>
    </AuthContext.Provider>
  );
}

export default App;
