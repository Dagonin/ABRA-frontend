import TextField from '@mui/material/TextField';
import ExampleNumberField from './NumberField.tsx';
import './VariantField.css';
import UrlField from './UrlField.tsx';
import { useState } from 'react';
import { Checkbox } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

function VariantField() {
  const [isDisabled, setIsDisabled] = useState(false);

  const [urlFields, setUrlFields] = useState<number[]>([]);

  const addUrlField = () => {
    setUrlFields(prev => [...prev, prev.length]);
  };

  const toggleDisabled = () => {
    setIsDisabled(prev => !prev);
  };

  const removeUrlField = (idToRemove: number) => {
    setUrlFields(prev => prev.filter(id => id !== idToRemove));
  };

  return (
    <>
        <div className="variant_field_container">
            <Checkbox checked={isDisabled} onChange={toggleDisabled} />
            <TextField></TextField>
            <ExampleNumberField min={0} defaultValue={5} disabled={isDisabled} />

            {/* <TextField id="outlined-basic" label="URL" variant="outlined" disabled={isDisabled} />
            
            <Button variant="text" ><Delete /></Button> */}

          <div id="variant_fields">
                    {urlFields.map((id) => (
            <UrlField key={id} disabled={isDisabled} onDelete={() => removeUrlField(id)} />
          ))}
          </div>

          <Button variant="outlined" onClick={addUrlField}>Add URL Field</Button>

        </div>
    </>
  )
}

export default VariantField
