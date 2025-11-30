import './DomainField.css';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import TestField from './TestField';
import { Button, IconButton, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UrlField from './UrlField';

interface DomainFieldProps {
  onDelete?: () => void;
}

function DomainField({ onDelete }: DomainFieldProps) {
  const [domainExpanded, setDomainExpanded] = useState(true);
  const [testFields, setTestFields] = useState<number[]>([]);
  const [urlFields, setUrlFields] = useState<number[]>([]);
  const [testExpanded, setTestExpanded] = useState(true);
  const [urlExpanded, setUrlExpanded] = useState(true);

  const addTestField = () => {
    setTestFields(prev => [...prev, prev.length]);
  };

  const addUrlField = () => {
    setUrlFields(prev => [...prev, prev.length]);
  };

  const removeTestField = (idToRemove: number) => {
    setTestFields(prev => prev.filter(id => id !== idToRemove));
  };

  const removeUrlField = (idToRemove: number) => {
    setUrlFields(prev => prev.filter(id => id !== idToRemove));
  };


  return (
    <div className="domain_field_container">
      <div className="domain_header_wrapper" onClick={() => setDomainExpanded(!domainExpanded)}>
        <IconButton size="small" className={`expand-icon ${domainExpanded ? 'expanded' : ''}`}>
          <ExpandMoreIcon />
        </IconButton>
        <div className="domain_header_content">
          <TextField id="domain-url" label="Domain URL" variant="outlined" fullWidth size="small" />
        </div>
        <IconButton color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} aria-label="delete-domain" size="small">
          <DeleteIcon />
        </IconButton>
      </div>
      <Collapse in={domainExpanded}>
        <div className="domain_content_wrapper">
          <div className="test_fields_wrapper">
            <div className="field_label_header" onClick={() => setTestExpanded(!testExpanded)}>
              <IconButton size="small" className={`expand-icon ${testExpanded ? 'expanded' : ''}`}>
                <ExpandMoreIcon />
              </IconButton>
              Test Fields
            </div>
            <Collapse in={testExpanded}>
              <div id="test_fields">
                {testFields.map((id) => (
                  <TestField key={id} onDelete={() => removeTestField(id)} />
                ))}
              </div>
              <Button variant="outlined" onClick={addTestField} size="small">+ Add Test Field</Button>
            </Collapse>
          </div>

          <div className="url_fields_wrapper">
            <div className="field_label_header" onClick={() => setUrlExpanded(!urlExpanded)}>
              <IconButton size="small" className={`expand-icon ${urlExpanded ? 'expanded' : ''}`}>
                <ExpandMoreIcon />
              </IconButton>
              URL Fields
            </div>
            <Collapse in={urlExpanded}>
              <div id="url_fields">
                {urlFields.map((id) => (
                  <UrlField key={id} disabled={false} onDelete={() => removeUrlField(id)} />
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


export default DomainField