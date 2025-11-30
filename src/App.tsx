import { useState } from 'react'
import './App.css'
import VariantField from './components/VariantField.tsx'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';
import TestField from './components/TestField.tsx'
import DomainField from './components/DomainField.tsx';

function App() {
  const [domainFields, setDomainFields] = useState<number[]>([]);

  const addDomainField = () => {
    setDomainFields(prev => [...prev, prev.length]);
  };

  const removeDomainField = (idToRemove: number) => {
    setDomainFields(prev => prev.filter(id => id !== idToRemove));
  };

  return (
    <>
      <div id="main_container">
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={addDomainField}
          style={{ position: 'fixed', bottom: '23rem', right: '15rem' }}
        >
          <AddIcon />
        </Fab>
        <div id="domain_fields">
          {domainFields.map((id) => (
            <DomainField key={id} onDelete={() => removeDomainField(id)} />
          ))}
        </div>

      </div>
    </>
  )
}


export default App
