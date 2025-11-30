import './DomainField.css';

import TextField from '@mui/material/TextField';
import { useState } from 'react';
import TestField from './TestField';
import { Button } from '@mui/material';
import UrlField from './UrlField';

function DomainField() {

  const [testFields, setTestFields] = useState<number[]>([]);
   const [urlFields, setUrlFields] = useState<number[]>([]);

  const addTestField = () => {
    setTestFields(prev => [...prev, prev.length]);
  };

  const addUrlField = () => {
    setUrlFields(prev => [...prev, prev.length]);
  };

  const removeUrlField = (idToRemove: number) => {
    setUrlFields(prev => prev.filter(id => id !== idToRemove));
  };


  return (
    <>
        <TextField id="outlined-basic" label="URL" variant="outlined" />  

        <div id="test_fields">
                  {testFields.map((id) => (
          <TestField key={id} />
        ))}
        </div>

        <Button variant="outlined" onClick={addTestField}>Add Test Field</Button>

                  <div id="test_fields">
                    {urlFields.map((id) => (
            <UrlField key={id} disabled={false} onDelete={() => removeUrlField(id)} />
          ))}
          </div>

          <Button variant="outlined" onClick={addUrlField}>Add URL Field</Button>

    </>
  )
}


export default DomainField