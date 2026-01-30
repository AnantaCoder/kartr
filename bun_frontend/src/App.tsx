import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ChatBox from './features/chat/components/ChatBot';

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
      <ChatBox />
    </Router>
  );
};

export default App;
