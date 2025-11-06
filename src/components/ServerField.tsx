import TextField from '@mui/material/TextField';
import ExampleNumberField from './NumberField.tsx';
import './ServerFIeld.css';
import { useState } from 'react';
import { Checkbox } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

function ServerField() {
  const [isDisabled, setIsDisabled] = useState(false);

  const toggleDisabled = () => {
    setIsDisabled(prev => !prev);
  };

  return (
    <>
        <div className="server_field_container">
            <Checkbox checked={!isDisabled} onChange={toggleDisabled} />
            <ExampleNumberField min={0} defaultValue={5} disabled={isDisabled} />
            <TextField id="outlined-basic" label="Outlined" variant="outlined" disabled={isDisabled} />
            
            <Button variant="text" ><Delete /></Button>
        </div>
    </>
  )
}

export default ServerField
