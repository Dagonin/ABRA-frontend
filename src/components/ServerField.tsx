import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import ExampleNumberField from './NumberField';
import './ServerField.css';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import type { Server } from '../App';

interface ServerFieldProps {
  server: Server;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedServer: Server) => void;
  onUrlPersist?: (id: string, url: string, previousUrl?: string) => Promise<void> | void;
  onUrlDelete?: (id: string, url: string) => Promise<void> | void;
  onSaveWeight?: (id: string, weight: number) => Promise<void> | void;
  filter?: 'all' | 'alive' | 'down';
  onDrain?: () => void;
  onDescriptionUpdate?: (url: string, desc: string) => Promise<void> | void;
}

function ServerField({ server, onDelete, onUpdate, onUrlPersist, onUrlDelete, onSaveWeight, filter = 'all', onDrain, onDescriptionUpdate }: ServerFieldProps) {
  // Local drafts so typing doesn't mutate persisted URL immediately
  type Draft = { originalUrl: string; url: string; description: string; alive?: boolean };
  const [drafts, setDrafts] = useState<Draft[]>(() => (server.endpoints || []).map(ep => ({ originalUrl: ep.url, url: ep.url, description: ep.description || '', alive: ep.alive })));

  // Sync drafts from parent when server endpoints refresh (e.g., polling or save)
  useEffect(() => {
    const incoming: Draft[] = (server.endpoints || []).map(ep => ({
      originalUrl: ep.url,
      url: ep.url,
      description: ep.description || '',
      alive: ep.alive,
    }));

    setDrafts(prev => {
      // Preserve drafts that are being edited (dirty): url changed vs originalUrl,
      // or brand new row without originalUrl but with any input.
      const dirty = prev.filter(d => (d.originalUrl ? d.url !== d.originalUrl : (d.url?.length || d.description?.length)));
      const result = [...incoming];
      // Overlay dirty drafts over incoming by originalUrl; append new ones.
      dirty.forEach(d => {
        if (d.originalUrl) {
          const idx = result.findIndex(x => x.originalUrl === d.originalUrl);
          if (idx >= 0) result[idx] = d;
          else result.push(d);
        } else {
          // New unsaved row — keep it visible
          result.push(d);
        }
      });
      return result;
    });
  }, [server.endpoints]);

  const handleToggleDisabled = () => {
    onUpdate(server.id, {
      ...server,
      enabled: !server.enabled,
    });
  };

  const handleEndpointChange = (index: number, value: string) => {
    setDrafts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], url: value };
      return next;
    });
  };

  const handleEndpointBlur = (index: number) => {
    const ep = drafts[index];
    const newUrl = ep?.url?.trim();
    if (newUrl && newUrl.length > 0) {
      // Save using the unified flow
      void handleRowSave(index);
    }
  };

  const handleAddEndpoint = () => {
    // Only manage draft locally; parent will be updated on actual persist
    setDrafts(prev => [...prev, { originalUrl: '', url: '', description: '', alive: false }]);
  };

  const handleDeleteEndpointLocal = (index: number) => {
    const deleting = drafts[index];
    setDrafts(prev => prev.filter((_, i) => i !== index));
    // Notify parent to delete only if persisted (has originalUrl)
    if (deleting?.originalUrl) {
      onUrlDelete?.(server.id, deleting.originalUrl);
    }
  };

  const handleDelete = () => {
    onDelete(server.id);
  };

  const getPersistedDesc = (originalUrl: string): string => {
    const ep = (server.endpoints || []).find(e => e.url === originalUrl);
    return ep?.description || '';
  };

  const handleRowSave = async (index: number) => {
    const draft = drafts[index];
    const url = (draft.url || '').trim();
    const originalUrl = draft.originalUrl;
    const desc = draft.description || '';

    // If description too long, do nothing here; rely on parent validation/snackbar
    if (desc.length > 50) return;

    try {
      // Case 1: new row -> persist URL first
      if (!originalUrl) {
        if (!url) return; // nothing to save yet
        await onUrlPersist?.(server.id, url);
        if (desc.length >= 0) {
          await onDescriptionUpdate?.(url, desc);
        }
        // Update originalUrl locally
        setDrafts(prev => {
          const next = [...prev];
          next[index] = { ...next[index], originalUrl: url };
          return next;
        });
        return;
      }

      // Case 2: existing row with URL change -> rename (delete+add) via parent, then patch desc
      if (url && url !== originalUrl) {
        await onUrlPersist?.(server.id, url, originalUrl);
        if (desc.length >= 0) {
          await onDescriptionUpdate?.(url, desc);
        }
        setDrafts(prev => {
          const next = [...prev];
          next[index] = { ...next[index], originalUrl: url };
          return next;
        });
        return;
      }

      // Case 3: existing row, only description changed
      const persistedDesc = getPersistedDesc(originalUrl);
      if (desc !== persistedDesc) {
        await onDescriptionUpdate?.(originalUrl, desc);
      }
    } catch {
      // Parent shows snackbar; nothing else here
    }
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
                value={server.weight}
                disabled={!server.enabled}
                onChange={(val) => onUpdate(server.id, { ...server, weight: val })}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => onSaveWeight?.(server.id, server.weight)}
                disabled={!server.enabled}
                sx={{ textTransform: 'none' }}
              >
                Zapisz
              </Button>
            </div>
          </div>

          {/* Endpoints Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {drafts.map((ep, originalIndex) => {
              if (!(filter === 'all' || (filter === 'alive' && ep.alive) || (filter === 'down' && !ep.alive))) {
                return null;
              }
              return (
              <div key={ep.originalUrl || ep.url || `row-${originalIndex}`} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ep.alive ? '#48bb78' : '#f56565' }} title={ep.alive ? 'Alive' : 'Down'} />
                <TextField 
                  label={`URL ${originalIndex + 1}`}
                  variant="outlined" 
                  disabled={!server.enabled}
                  size="small"
                  placeholder="https://example.com"
                  value={ep.url}
                  onChange={(e) => handleEndpointChange(originalIndex, e.target.value)}
                  onBlur={() => handleEndpointBlur(originalIndex)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void handleRowSave(originalIndex);
                    }
                  }}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      color: server.enabled ? '#e2e8f0' : '#64748b',
                    }
                  }}
                />
                <TextField
                  label="Opis"
                  variant="outlined"
                  disabled={!server.enabled}
                  size="small"
                  placeholder="Opis"
                  value={ep.description || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDrafts(prev => {
                      const next = [...prev];
                      next[originalIndex] = { ...next[originalIndex], description: val };
                      return next;
                    });
                  }}
                  onBlur={() => { void handleRowSave(originalIndex); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void handleRowSave(originalIndex);
                    }
                  }}
                  sx={{ minWidth: '160px', flex: '0 0 220px' }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => void handleRowSave(originalIndex)}
                  disabled={!server.enabled || (!ep.originalUrl && !(ep.url || '').trim()) || ep.description.length > 50}
                  sx={{ textTransform: 'none' }}
                >Zapisz</Button>
                {drafts.length > 0 && (ep.originalUrl || ep.url) && (
                  <Tooltip title="Usuń URL">
                    <IconButton
                      onClick={() => handleDeleteEndpointLocal(originalIndex)}
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
              );
            })}
            
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddEndpoint}
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
            <Button
              size="small"
              variant="outlined"
              color="warning"
              disabled={!server.enabled}
              onClick={() => onDrain?.()}
              sx={{ textTransform: 'none' }}
            >
              Drain
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
