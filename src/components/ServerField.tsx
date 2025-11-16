import TextField from '@mui/material/TextField';
import ExampleNumberField from './NumberField.tsx';
import './ServerField.css';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import type { Server } from '../App.tsx';

interface ServerFieldProps {
  server: Server;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updatedServer: Server) => void;
}

function ServerField({ server, onDelete, onUpdate }: ServerFieldProps) {
  const handleToggleDisabled = () => {
    onUpdate(server.id, {
      ...server,
      enabled: !server.enabled,
    });
  };

  const handleURLChange = (index: number, value: string) => {
    const newUrls = [...server.urls];
    newUrls[index] = value;
    onUpdate(server.id, {
      ...server,
      urls: newUrls,
    });
  };

  const handleAddURL = () => {
    onUpdate(server.id, {
      ...server,
      urls: [...server.urls, ''],
    });
  };

  const handleDeleteURL = (index: number) => {
    const newUrls = server.urls.filter((_, i) => i !== index);
    onUpdate(server.id, {
      ...server,
      urls: newUrls.length > 0 ? newUrls : [''],
    });
  };

  const handleDelete = () => {
    onDelete(server.id);
  };

  return (
    <>
      <div className="server_field_container">
        <Tooltip title={server.enabled ? "Wyłącz serwer" : "Włącz serwer"}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox 
              checked={server.enabled}
              onChange={handleToggleDisabled}
              icon={<CancelIcon sx={{ color: '#fc8181' }} />}
              checkedIcon={<CheckCircleIcon sx={{ color: '#48bb78' }} />}
            />
          </div>
        </Tooltip>

        <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: 'column' }}>
          <div style={{ width: '100%', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ minWidth: '200px' }}>
              <ExampleNumberField 
                min={0} 
                defaultValue={server.weight}
                disabled={!server.enabled}
              />
            </div>
          </div>

          {/* URLs Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {server.urls.map((url, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                <TextField 
                  label={`URL ${index + 1}`}
                  variant="outlined" 
                  disabled={!server.enabled}
                  size="small"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => handleURLChange(index, e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      color: server.enabled ? '#e2e8f0' : '#64748b',
                    }
                  }}
                />
                {server.urls.length > 1 && (
                  <Tooltip title="Usuń URL">
                    <IconButton
                      onClick={() => handleDeleteURL(index)}
                      size="small"
                      sx={{ 
                        color: '#f56565',
                        '&:hover': { backgroundColor: 'rgba(245, 101, 101, 0.1)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            ))}
            
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddURL}
              disabled={!server.enabled}
              sx={{
                color: '#667eea',
                borderColor: 'rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                },
                textTransform: 'none',
                width: 'fit-content',
              }}
            >
              Dodaj URL
            </Button>
          </div>
        </div>

        <Tooltip title="Usuń serwer">
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                boxShadow: '0 4px 12px rgba(245, 101, 101, 0.4)',
              },
              height: 'fit-content',
            }}
          >
            Usuń
          </Button>
        </Tooltip>
      </div>
    </>
  )
}

export default ServerField
