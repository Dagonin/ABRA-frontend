import { Delete } from "@mui/icons-material";
import { TextField, Button } from "@mui/material";
import React from "react";
import './UrlField.css';

interface UrlFieldProps {
  disabled?: boolean;
  onDelete?: () => void;
}

function UrlField({ disabled = false, onDelete }: UrlFieldProps) {
  return (
    <>
      <div className="url_field_container">
        <TextField id="outlined-basic" label="URL" variant="outlined" disabled={disabled} />         
        <Button variant="text" onClick={onDelete} aria-label="delete-url-field"><Delete /></Button>
      </div>
    </>
  )
}


export default UrlField