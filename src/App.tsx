import { useState } from 'react'
import './App.css'
import ServerField from './components/ServerField.tsx'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';

function App() {
  const [serverFields, setServerFields] = useState<number[]>([]);

  const addServerField = () => {
    setServerFields(prev => [...prev, prev.length]);
  };

  return (
    <>
      <div id="main_container">
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={addServerField}
          style={{ position: 'fixed', bottom: '23rem', right: '15rem' }}
        >
          <AddIcon />
        </Fab>
        <div id="server_fields">
                  {serverFields.map((id) => (
          <ServerField key={id} />
        ))}
        </div>

      </div>
    </>
  )
}


export default App
