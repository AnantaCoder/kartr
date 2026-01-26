import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ChatBox from './features/chat/components/ChatBot';
import PerspectiveSync from './components/common/PerspectiveSync';

const App: React.FC = () => {
  return (
    <Router>
      <PerspectiveSync />
      <AppRoutes />
      <ChatBox />
    </Router>
  );
};

export default App;
