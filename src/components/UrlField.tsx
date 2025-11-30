import { Delete } from "@mui/icons-material";
import { TextField, IconButton } from "@mui/material";
import React from "react";
import './UrlField.css';

interface UrlFieldProps {
  disabled?: boolean;
  onDelete?: () => void;
}

function UrlField({ disabled = false, onDelete }: UrlFieldProps) {
  return (
    <div className="url_field_container">
      <TextField id="outlined-basic" label="URL" variant="outlined" disabled={disabled} fullWidth />         
      <IconButton color="error" onClick={onDelete} aria-label="delete-url-field"><Delete /></IconButton>
    </div>
  )
}


export default UrlField