import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import VariantField from './VariantField';
import type { VariantModel } from '../services/api';
import { Button, IconButton, Collapse, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './TestField.css';

interface TestFieldProps {
  initialName?: string;
  initialActive?: boolean;
  initialDescription?: string;
  initialSubpath?: string;
  initialVariants?: VariantModel[];
  onSave?: (updated: { name?: string; active?: boolean; description?: string; subpath?: string; variantModels?: VariantModel[] }) => void;
  onDelete?: () => void;
}

function TestField({ initialName = '', initialActive = true, initialDescription, initialSubpath, initialVariants, onSave, onDelete }: TestFieldProps) {
  const [testExpanded, setTestExpanded] = useState(true);
  const [isActive, setIsActive] = useState<boolean>(initialActive);
  const [name, setName] = useState<string>(initialName);
  const [variantExpanded, setVariantExpanded] = useState(true);
  const [variantModelsState, setVariantModelsState] = useState<VariantModel[]>(initialVariants ?? []);
  const [description, setDescription] = useState<string>(initialDescription ?? '');
  const [testUrl, setTestUrl] = useState<string>(initialSubpath ?? '');

  const addVariantField = () => {
    setVariantModelsState(prev => [...prev, { variant_id: '', name: `Variant ${prev.length + 1}`, active: true, weight: 1 } as VariantModel]);
  };

  const removeVariantField = (index: number) => {
    setVariantModelsState(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariantAt = (index: number, v: VariantModel) => {
    setVariantModelsState(prev => prev.map((item, i) => i === index ? v : item));
  };

  const handleSave = () => {
    // Ensure variantModels is properly updated with all nested data
    const variantsWithData = variantModelsState.map(v => ({
      variant_id: v.variant_id || '',
      name: v.name || '',
      active: v.active ?? true,
      weight: v.weight ?? 1,
      description: v.description,
      testModel: v.testModel,
      endpointModels: v.endpointModels || []
    }));
    console.log('TestField handleSave - variantModelsState:', variantModelsState);
    console.log('TestField handleSave - variantsWithData:', variantsWithData);
    onSave?.({ name, active: isActive, description, subpath: testUrl, variantModels: variantsWithData });
  };

  return (
    <div className="test_field_container">
      <div className="test_field_header_wrapper" onClick={() => setTestExpanded(!testExpanded)}>
        <IconButton size="small" className={`expand-icon ${testExpanded ? 'expanded' : ''}`}>
          <ExpandMoreIcon />
        </IconButton>
        <div className="test_field_header_content">
          <Checkbox checked={isActive} onChange={(e) => { e.stopPropagation(); setIsActive(prev => !prev); }} size="small" onClick={(e) => e.stopPropagation()} />
          <TextField label="Test Name" variant="outlined" fullWidth size="small" value={name} onChange={(e) => { e.stopPropagation(); setName(e.target.value); }} onClick={(e) => e.stopPropagation()} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="contained" color="primary" size="small" startIcon={<SaveIcon />} onClick={(e) => { e.stopPropagation(); handleSave(); }}>Save</Button>
          <IconButton color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} aria-label="delete-test" size="small">
            <DeleteIcon />
          </IconButton>
        </div>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField id="outlined-basic" label="Test URL" variant="outlined" fullWidth size="small" value={testUrl} onChange={(e) => setTestUrl(e.target.value)} />

          <div className="variant_fields_wrapper">
            <div className="field_label_header" onClick={() => setVariantExpanded(!variantExpanded)}>
              <IconButton size="small" className={`expand-icon ${variantExpanded ? 'expanded' : ''}`}>
                <ExpandMoreIcon />
              </IconButton>
              Variants
            </div>
            <Collapse in={variantExpanded}>
              <div id="variant_fields">
                {variantModelsState.map((v, idx) => (
                  <VariantField
                    key={v.variant_id || `new-${idx}`}
                    variant={v}
                    onChange={(nv) => updateVariantAt(idx, nv)}
                    onDelete={() => removeVariantField(idx)}
                  />
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