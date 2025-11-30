import TextField from '@mui/material/TextField';
import { useState } from 'react';
import VariantField from './VariantField';
import { Button } from '@mui/material';
import './TestField.css';

function TestField() {

  const [variantFields, setVariantFields] = useState<number[]>([]);

  const addVariantField = () => {
    setVariantFields(prev => [...prev, prev.length]);
  };

  return (
    <>
        <TextField label="nazwa"></TextField>
        <TextField
          id="outlined-multiline-static"
          label="Opis"
          multiline
          rows={4}
        />
        <TextField id="outlined-basic" label="URL" variant="outlined" />  

        <div id="variant_fields">
                  {variantFields.map((id) => (
          <VariantField key={id} />
        ))}
        </div>

        <Button variant="outlined" onClick={addVariantField}>Add Variant Field</Button>
    </>
  )
}


export default TestField