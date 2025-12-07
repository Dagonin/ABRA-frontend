import TextField from '@mui/material/TextField';
import ExampleNumberField from './NumberField.tsx';
import './VariantField.css';
import UrlField from './UrlField.tsx';
import { useState, useEffect } from 'react';
import { Checkbox, IconButton, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

interface VariantFieldProps {
  variant?: import('../services/api').VariantModel;
  onChange?: (v: import('../services/api').VariantModel) => void;
  onDelete?: () => void;
}

function VariantField({ variant, onChange, onDelete }: VariantFieldProps) {
  const [variantExpanded, setVariantExpanded] = useState(true);
  const [isActive, setIsActive] = useState<boolean>(variant?.active ?? true);
  const [name, setName] = useState<string>(variant?.name ?? '');
  const [weight, setWeight] = useState<number>(variant?.weight ?? 0);
  const [urlList, setUrlList] = useState<{ url: string; active?: boolean }[]>((variant?.endpointModels ?? []).map(e => ({ url: e.url, active: e.active })));
  const [urlExpanded, setUrlExpanded] = useState(true);

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
  };

  const addUrlField = () => setUrlList(prev => [...prev, { url: '', active: true }]);

  const toggleActive = () => {
    setIsActive(prev => !prev);
  };

  const removeUrlField = (index: number) => {
    setUrlList(prev => prev.filter((_, i) => i !== index));
  };

  const onUrlChange = (index: number, v: { url: string; active: boolean }) => {
    setUrlList(prev => prev.map((it, i) => i === index ? v : it));
  };

  const onNameChange = (val: string) => {
    setName(val);
  };

  // Emit change to parent when local variant state changes (after render)
  useEffect(() => {
    const newV = {
      variant_id: variant?.variant_id ?? '',
      name,
      active: isActive,
      description: variant?.description,
      weight,
      testModel: variant?.testModel,
      endpointModels: urlList.map(u => ({ url: u.url, active: !!u.active })),
    } as import('../services/api').VariantModel;

    // Normalize variant prop into same shape for comparison
    const normalize = (v: any) => ({
      variant_id: v?.variant_id ?? '',
      name: v?.name ?? '',
      active: v?.active ?? true,
      description: v?.description ?? undefined,
      weight: v?.weight ?? 0,
      testModel: v?.testModel ?? undefined,
      endpointModels: Array.isArray(v?.endpointModels) ? v.endpointModels.map((e: any) => ({ url: e.url, active: !!e.active })) : [],
    });

    try {
      const prev = normalize(variant);
      const curr = normalize(newV);
      const prevStr = JSON.stringify(prev);
      const currStr = JSON.stringify(curr);
      if (prevStr !== currStr) {
        onChange?.(newV);
      }
    } catch (e) {
      // Fallback: if comparison fails, still emit change
      onChange?.(newV);
    }
  }, [name, isActive, weight, urlList]);

  return (
    <div className="variant_field_container">
      <div className="variant_header_wrapper" onClick={() => setVariantExpanded(!variantExpanded)}>
        <IconButton size="small" className={`expand-icon ${variantExpanded ? 'expanded' : ''}`}>
          <ExpandMoreIcon />
        </IconButton>
        <div className="variant_controls">
          <Checkbox checked={isActive} onChange={toggleActive} size="small" onClick={(e) => e.stopPropagation()} />
          <TextField label="Variant Name" variant="outlined" fullWidth size="small" value={name} onChange={(e) => { e.stopPropagation(); onNameChange(e.target.value); }} onClick={(e) => e.stopPropagation()} />
          <ExampleNumberField min={0} value={weight} onChange={handleWeightChange} disabled={!isActive} />
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
                {urlList.map((u, i) => (
                  <UrlField key={i} disabled={!isActive} value={u.url} active={!!u.active} onChange={(val) => onUrlChange(i, val)} onDelete={() => removeUrlField(i)} />
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
