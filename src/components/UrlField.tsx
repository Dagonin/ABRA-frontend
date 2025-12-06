import { Delete } from "@mui/icons-material";
import { TextField, IconButton, Checkbox } from "@mui/material";
import React, { useState } from "react";
import './UrlField.css';

interface UrlFieldProps {
  disabled?: boolean;
  onDelete?: () => void;
}

function UrlField({ disabled = false, onDelete }: UrlFieldProps) {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="url_field_container">
      <Checkbox checked={isActive} onChange={() => setIsActive(prev => !prev)} size="small" onClick={(e) => e.stopPropagation()} />
      <TextField id="outlined-basic" label="URL" variant="outlined" disabled={disabled || !isActive} fullWidth />         
      <IconButton color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} aria-label="delete-url-field"><Delete /></IconButton>
    </div>
  )
}


export default UrlField