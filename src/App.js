import React, { createContext, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Layout from './pages/Layout';

export const AuthContext = createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userEmail, setUserEmail, isVerified, setIsVerified }}>
      <Router>
        <Layout />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
