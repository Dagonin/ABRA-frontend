import TextField from '@mui/material/TextField';
import { useState } from 'react';
import VariantField from './VariantField';
import { Button, IconButton, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './TestField.css';

interface TestFieldProps {
  onDelete?: () => void;
}

function TestField({ onDelete }: TestFieldProps) {
  const [testExpanded, setTestExpanded] = useState(true);
  const [variantFields, setVariantFields] = useState<number[]>([]);
  const [variantExpanded, setVariantExpanded] = useState(true);

  const addVariantField = () => {
    setVariantFields(prev => [...prev, prev.length]);
  };

  const removeVariantField = (idToRemove: number) => {
    setVariantFields(prev => prev.filter(id => id !== idToRemove));
  };

  return (
    <div className="test_field_container">
      <div className="test_field_header_wrapper" onClick={() => setTestExpanded(!testExpanded)}>
        <IconButton size="small" className={`expand-icon ${testExpanded ? 'expanded' : ''}`}>
          <ExpandMoreIcon />
        </IconButton>
        <div className="test_field_header_content">
          <TextField label="Test Name" variant="outlined" fullWidth size="small" />
        </div>
        <IconButton color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} aria-label="delete-test" size="small">
          <DeleteIcon />
        </IconButton>
      </div>
      <Collapse in={testExpanded}>
        <div className="test_content_wrapper">
          <TextField
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={4}
            fullWidth
            size="small"
          />
          <TextField id="outlined-basic" label="Test URL" variant="outlined" fullWidth size="small" />

          <div className="variant_fields_wrapper">
            <div className="field_label_header" onClick={() => setVariantExpanded(!variantExpanded)}>
              <IconButton size="small" className={`expand-icon ${variantExpanded ? 'expanded' : ''}`}>
                <ExpandMoreIcon />
              </IconButton>
              Variants
            </div>
            <Collapse in={variantExpanded}>
              <div id="variant_fields">
                {variantFields.map((id) => (
                  <VariantField key={id} onDelete={() => removeVariantField(id)} />
                ))}
              </div>
              <Button variant="outlined" onClick={addVariantField} size="small">+ Add Variant Field</Button>
            </Collapse>
          </div>
        </div>
      </Collapse>
    </div>
  )
}


export default TestField