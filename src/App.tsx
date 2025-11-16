import { useState } from 'react'
import './App.css'
import ServerField from './components/ServerField.tsx'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';

export interface Server {
  id: number;
  weight: number;
  enabled: boolean;
  urls: string[];
}

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [nextId, setNextId] = useState(0);

  const addServerField = () => {
    const newServer: Server = {
      id: nextId,
      weight: 5,
      enabled: true,
      urls: [''],
    };
    setServers(prev => [...prev, newServer]);
    setNextId(prev => prev + 1);
  };

  const deleteServerField = (id: number) => {
    setServers(prev => prev.filter(server => server.id !== id));
  };

  const updateServer = (id: number, updatedServer: Server) => {
    setServers(prev =>
      prev.map(server => (server.id === id ? updatedServer : server))
    );
  };

  return (
    <>
      <div id="main_container">
        <div className="main_header">
          <h1>🚀 Server Manager</h1>
          <p>Zarządzaj swoimi serwerami w prosty i intuicyjny sposób</p>
        </div>

        <div className="add_button_wrapper">
          <Fab 
            color="primary" 
            aria-label="add" 
            onClick={addServerField}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 30px rgba(102, 126, 234, 0.6)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AddIcon />
          </Fab>
        </div>

        <div id="server_fields">
          {servers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0',
              fontSize: '1.1rem',
            }}>
              <p>Nie masz jeszcze żadnych serwerów.</p>
              <p>Kliknij przycisk + aby dodać nowy serwer! ⬆️</p>
            </div>
          ) : (
            servers.map((server) => (
              <ServerField 
                key={server.id} 
                server={server}
                onDelete={deleteServerField}
                onUpdate={updateServer}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default App
