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
        <h1>Hello, World!</h1>
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={addServerField}
          style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}
        >
          <AddIcon />
        </Fab>

        {serverFields.map((id) => (
          <ServerField key={id} />
        ))}
      </div>
    </>
  )
}


export default App
