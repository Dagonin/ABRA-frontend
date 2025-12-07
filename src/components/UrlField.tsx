import { Delete } from "@mui/icons-material";
import { TextField, IconButton, Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import './UrlField.css';

interface UrlFieldProps {
  disabled?: boolean;
  value?: string;
  active?: boolean;
  onChange?: (value: { url: string; active: boolean }) => void;
  onDelete?: () => void;
}

function UrlField({ disabled = false, value = '', active = true, onChange, onDelete }: UrlFieldProps) {
  const [isActive, setIsActive] = useState<boolean>(active);
  const [localUrl, setLocalUrl] = useState<string>(value ?? '');

  // Sync prop changes into local state
  useEffect(() => {
    setIsActive(active ?? true);
  }, [active]);

  useEffect(() => {
    setLocalUrl(value ?? '');
  }, [value]);

  const commitChange = (v?: string, a?: boolean) => {
    const urlToSend = typeof v === 'undefined' ? localUrl : v;
    const activeToSend = typeof a === 'undefined' ? isActive : a;
    onChange?.({ url: urlToSend, active: activeToSend });
  };

  const handleInput = (v: string) => {
    setLocalUrl(v);
  };

  const handleBlur = () => {
    commitChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const toggleActive = () => {
    setIsActive(prev => {
      const next = !prev;
      commitChange(undefined, next);
      return next;
    });
  };

  return (
    <div className="url_field_container">
      <Checkbox checked={isActive} onChange={(e) => { e.stopPropagation(); toggleActive(); }} size="small" onClick={(e) => e.stopPropagation()} />
      <TextField id="outlined-basic" label="URL" variant="outlined" disabled={disabled || !isActive} fullWidth value={localUrl} onChange={(e) => { e.stopPropagation(); handleInput(e.target.value); }} onBlur={handleBlur} onKeyDown={handleKeyDown} />         
      <IconButton color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} aria-label="delete-url-field"><Delete /></IconButton>
    </div>
  )
}


export default UrlField