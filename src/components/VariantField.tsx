import TextField from '@mui/material/TextField';
import ExampleNumberField from './NumberField.tsx';
import './VariantField.css';
import UrlField from './UrlField.tsx';
import { useState } from 'react';
import { Checkbox, IconButton, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

interface VariantFieldProps {
  onDelete?: () => void;
}

function VariantField({ onDelete }: VariantFieldProps) {
  const [variantExpanded, setVariantExpanded] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [urlFields, setUrlFields] = useState<number[]>([]);
  const [urlExpanded, setUrlExpanded] = useState(true);

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
    <div className="variant_field_container">
      <div className="variant_header_wrapper" onClick={() => setVariantExpanded(!variantExpanded)}>
        <IconButton size="small" className={`expand-icon ${variantExpanded ? 'expanded' : ''}`}>
          <ExpandMoreIcon />
        </IconButton>
        <div className="variant_controls">
          <Checkbox checked={isDisabled} onChange={toggleDisabled} size="small" />
          <TextField label="Variant Name" variant="outlined" size="small" />
          <ExampleNumberField min={0} defaultValue={5} disabled={isDisabled} />
        </div>
        <IconButton color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} aria-label="delete-variant" size="small">
          <DeleteIcon />
        </IconButton>
      </div>


      <Collapse in={variantExpanded}>
        <div className="variant_content_wrapper">
          <div className="variant_urls_wrapper">
            <div className="field_label_header" onClick={() => setUrlExpanded(!urlExpanded)}>
              <IconButton size="small" className={`expand-icon ${urlExpanded ? 'expanded' : ''}`}>
                <ExpandMoreIcon />
              </IconButton>
              URLs
            </div>
            <Collapse in={urlExpanded}>
              <div id="variant_url_fields">
                {urlFields.map((id) => (
                  <UrlField key={id} disabled={isDisabled} onDelete={() => removeUrlField(id)} />
                ))}
              </div>
              <Button variant="outlined" onClick={addUrlField} size="small">+ Add URL Field</Button>
            </Collapse>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default VariantField
