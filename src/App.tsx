import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import ServerField from './components/ServerField'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { getVariants, createVariant, deleteVariant, updateVariantWeight, updateVariantEnabled, drainVariant } from './api/variants'
import { getVariantEndpoints, addVariantEndpoint, deleteVariantEndpoint, type EndpointDTO, updateEndpointDescription } from './api/endpoints'

export interface ServerEndpoint { url: string; alive?: boolean; description?: string; }
export interface Server {
  id: string; // maps to variant_id in backend
  weight: number;
  enabled: boolean;
  endpoints: ServerEndpoint[];
}

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ open: boolean; severity: 'success'|'error'|'info'|'warning'; message: string}>({ open: false, severity: 'success', message: '' });
  const [filter, setFilter] = useState<'all'|'alive'|'down'>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080', []);

  // Maintain stable visual order independent from backend ordering.
  const orderedIdsRef = useRef<string[]>([]);

  const reconcileServers = (incoming: Server[]) => {
    const existingOrder = orderedIdsRef.current.slice();
    // Initialize order if first load
    if (existingOrder.length === 0) {
      orderedIdsRef.current = incoming.map(s => s.id);
      setServers(incoming);
      return;
    }
    // Append any new ids in arrival order
    incoming.forEach(s => {
      if (!existingOrder.includes(s.id)) {
        existingOrder.push(s.id);
      }
    });
    // Remove ids that disappeared
    const incomingIds = new Set(incoming.map(s => s.id));
    const filteredOrder = existingOrder.filter(id => incomingIds.has(id));
    orderedIdsRef.current = filteredOrder;
    // Map back preserving order
    const byId = new Map(incoming.map(s => [s.id, s] as const));
    const ordered = filteredOrder.map(id => byId.get(id)!).filter(Boolean);
    setServers(ordered);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const variants = await getVariants();
        const mapped: Server[] = await Promise.all(variants.map(async v => {
          const eps = await getVariantEndpoints(v.variant_id);
          return {
            id: v.variant_id,
            weight: v.weight ?? 0,
            enabled: (v as any).enabled !== undefined ? (v as any).enabled : true,
            endpoints: (eps || []).map((e: EndpointDTO) => ({ url: e.url, alive: e.alive, description: e.description }))
          } as Server;
        }));
        // Attempt to apply stored manual order before reconcile
        try {
          const stored = localStorage.getItem('variantOrder');
          if (stored) {
            const arr: string[] = JSON.parse(stored);
            const byId = new Map(mapped.map(s => [s.id, s] as const));
            const ordered = arr.filter(id => byId.has(id)).map(id => byId.get(id)!);
            const leftovers = mapped.filter(s => !arr.includes(s.id));
            reconcileServers([...ordered, ...leftovers]);
          } else {
            reconcileServers(mapped);
          }
        } catch {
          reconcileServers(mapped);
        }
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Nie udało się pobrać danych z backendu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshAll = async () => {
    try {
      setRefreshing(true);
      const variants = await getVariants();
      const mapped: Server[] = await Promise.all(variants.map(async v => {
        const eps = await getVariantEndpoints(v.variant_id);
        return {
          id: v.variant_id,
          weight: v.weight ?? 0,
          enabled: (v as any).enabled !== undefined ? (v as any).enabled : true,
          endpoints: (eps || []).map((e: EndpointDTO) => ({ url: e.url, alive: e.alive, description: e.description }))
        } as Server;
      }));
      reconcileServers(mapped);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Nie udało się odświeżyć danych');
      setNotice({ open: true, severity: 'error', message: e?.message ?? 'Nie udało się odświeżyć danych' });
    } finally {
      setRefreshing(false);
    }
  };

  const addServerField = async () => {
    try {
  const created = await createVariant({ name: 'Variant', weight: 5 });
  const srv: Server = { id: created.variant_id, weight: created.weight ?? 5, enabled: true, endpoints: [] };
      // Preserve order: append new id
      setServers(prev => {
        orderedIdsRef.current = [...orderedIdsRef.current, srv.id];
        return [...prev, srv];
      });
      setNotice({ open: true, severity: 'success', message: 'Utworzono wariant' });
    } catch (e: any) {
      setError(e?.message ?? 'Nie udało się utworzyć wariantu');
      setNotice({ open: true, severity: 'error', message: e?.message ?? 'Nie udało się utworzyć wariantu' });
    }
  };

  const deleteServerField = (sid: string) => {
    (async () => {
      try {
        await deleteVariant(sid);
        setServers(prev => prev.filter(server => server.id !== sid));
      } catch (e: any) {
        setError(e?.message ?? 'Nie udało się usunąć wariantu');
      }
    })();
  };

  const updateServer = (sid: string, updatedServer: Server) => {
    // Compute what actually changed compared to current state
    let doPersistWeight = false;
    let doPersistEnabled = false;
    setServers(prev => {
      const current = prev.find(s => s.id === sid);
      if (current) {
        doPersistWeight = current.weight !== updatedServer.weight;
        doPersistEnabled = current.enabled !== updatedServer.enabled;
      }
      return prev.map(server => (server.id === sid ? updatedServer : server));
    });

    // Persist only when the specific field changed
    if (doPersistWeight && Number.isFinite(updatedServer.weight)) {
      updateVariantWeight(sid, updatedServer.weight)
        .then(() => setNotice({ open: true, severity: 'success', message: 'Waga zapisana' }))
        .catch((e: any) => {
          setError(e?.message ?? 'Nie udało się zaktualizować wariantu');
          setNotice({ open: true, severity: 'error', message: e?.message ?? 'Nie udało się zapisać wagi' });
        });
    }
    if (doPersistEnabled && typeof updatedServer.enabled === 'boolean') {
      updateVariantEnabled(sid, updatedServer.enabled)
        .then(() => setNotice({ open: true, severity: 'success', message: updatedServer.enabled ? 'Wariant włączony' : 'Wariant wyłączony' }))
        .catch(() => setNotice({ open: true, severity: 'error', message: 'Nie udało się zmienić stanu wariantu' }));
    }

    // Persist current manual order in case of data mutation
    try { localStorage.setItem('variantOrder', JSON.stringify(orderedIdsRef.current)); } catch {/* ignore */}
  };

  // Auto polling disabled — manual refresh only

  const saveWeight = async (sid: string, weight: number) => {
    try {
      await updateVariantWeight(sid, weight);
      setNotice({ open: true, severity: 'success', message: 'Waga zapisana' });
    } catch (e: any) {
      setError(e?.message ?? 'Nie udało się zapisać wagi');
      setNotice({ open: true, severity: 'error', message: e?.message ?? 'Nie udało się zapisać wagi' });
    }
  };

  const persistUrl = async (sid: string, url: string, previousUrl?: string) => {
    try {
      // If user changed an existing URL, delete the old one first to avoid duplicates
      if (previousUrl && previousUrl !== url) {
        try { await deleteVariantEndpoint(sid, previousUrl); } catch {/* ignore non-critical */}
      }
      await addVariantEndpoint(sid, { url });
      // Refresh from server to ensure persistence and normalize duplicates
      const eps = await getVariantEndpoints(sid);
  const mapped = (eps || []).map(e => ({ url: e.url, alive: e.alive, description: e.description }));
  setServers(prev => prev.map(s => s.id === sid ? { ...s, endpoints: mapped } : s));
      setNotice({ open: true, severity: 'success', message: 'URL zapisany' });
    } catch (e: any) {
      setError(e?.message ?? 'Nie udało się dodać URL');
      setNotice({ open: true, severity: 'error', message: e?.message ?? 'Nie udało się dodać URL' });
    }
  };

  const removeUrl = async (sid: string, url: string) => {
    try {
      await deleteVariantEndpoint(sid, url);
      // Refresh from server to keep in sync
      const eps = await getVariantEndpoints(sid);
  const mapped = (eps || []).map(e => ({ url: e.url, alive: e.alive, description: e.description }));
  setServers(prev => prev.map(s => s.id === sid ? { ...s, endpoints: mapped } : s));
      setNotice({ open: true, severity: 'success', message: 'URL usunięty' });
    } catch (e: any) {
      setError(e?.message ?? 'Nie udało się usunąć URL');
      setNotice({ open: true, severity: 'error', message: e?.message ?? 'Nie udało się usunąć URL' });
    }
  };

  const updateDescription = async (url: string, description: string) => {
    if (description.length > 50) {
      setNotice({ open: true, severity: 'error', message: 'Opis może mieć maksymalnie 50 znaków' });
      return;
    }
    try {
      await updateEndpointDescription(url, description);
      setNotice({ open: true, severity: 'success', message: 'Opis zapisany' });
    } catch (e:any) {
      setNotice({ open: true, severity: 'error', message: 'Nie udało się zapisać opisu' });
    }
  };

  return (
    <>
      <div id="main_container">
        <div className="main_header">
          <h1>🚀 Server Manager</h1>
          <p>Zarządzaj swoimi serwerami w prosty i intuicyjny sposób</p>
          <div className="filter-bar">
            <button
              className={`filter-btn ${filter==='all' ? 'active' : ''}`}
              aria-pressed={filter==='all'}
              onClick={()=>setFilter('all')}
            >Wszystkie</button>
            <button
              className={`filter-btn ${filter==='alive' ? 'active' : ''}`}
              aria-pressed={filter==='alive'}
              onClick={()=>setFilter('alive')}
            >Alive</button>
            <button
              className={`filter-btn ${filter==='down' ? 'active' : ''}`}
              aria-pressed={filter==='down'}
              onClick={()=>setFilter('down')}
            >Down</button>
            <button
              className={`filter-btn`}
              onClick={refreshAll}
              disabled={refreshing}
              aria-busy={refreshing}
            >{refreshing ? 'Odświeżanie…' : 'Odśwież'}</button>
          </div>
          <div className="filter-note">Filtr dotyczy kart wariantów: Alive = włączone, Down = wyłączone.</div>
          <div className="drag-instructions">Przeciągnij kartę serwera aby zmienić kolejność</div>
        </div>

        <div className="add_button_wrapper">
          <Fab 
            color="primary" 
            aria-label="add" 
            onClick={addServerField}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 30px rgba(102, 126, 234, 0.6)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AddIcon />
          </Fab>
        </div>

        <div id="server_fields">
          <div style={{marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem'}}>
            API: {apiBase} {loading ? '— ładowanie…' : ''} {error ? `— błąd: ${error}` : ''}
          </div>
          {servers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0',
              fontSize: '1.1rem',
            }}>
              <p>{loading ? 'Wczytywanie…' : 'Nie masz jeszcze żadnych serwerów.'}</p>
              <p>Kliknij przycisk + aby dodać nowy serwer! ⬆️</p>
            </div>
          ) : (
            servers
              .filter((s) => {
                if (filter === 'all') return true;
                if (filter === 'down') return !s.enabled;
                // alive: enabled (independent of endpoint health)
                return s.enabled;
              })
              .map((server) => {
              return (
                <div
                  key={server.id}
                  className={"draggable-server"}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', server.id);
                    // Add dragging class
                    e.currentTarget.classList.add('dragging');
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.classList.remove('dragging');
                    document.querySelectorAll('.draggable-server.drag-over').forEach(el => el.classList.remove('drag-over'));
                  }}
                  onDragOver={(e) => {
                    e.preventDefault(); // allow drop
                    if (!e.currentTarget.classList.contains('drag-over')) {
                      document.querySelectorAll('.draggable-server.drag-over').forEach(el => el.classList.remove('drag-over'));
                      e.currentTarget.classList.add('drag-over');
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('text/plain');
                    const targetId = server.id;
                    document.querySelectorAll('.draggable-server.dragging').forEach(el => el.classList.remove('dragging'));
                    document.querySelectorAll('.draggable-server.drag-over').forEach(el => el.classList.remove('drag-over'));
                    if (!draggedId || draggedId === targetId) return;
                    // Reorder ref
                    const order = orderedIdsRef.current.slice();
                    const fromIdx = order.indexOf(draggedId);
                    const toIdx = order.indexOf(targetId);
                    if (fromIdx === -1 || toIdx === -1) return;
                    order.splice(fromIdx, 1);
                    order.splice(toIdx, 0, draggedId);
                    orderedIdsRef.current = order;
                    // Apply to servers state
                    setServers(prev => {
                      const byId = new Map(prev.map(s => [s.id, s] as const));
                      return order.map(id => byId.get(id)!).filter(Boolean);
                    });
                    // Persist order
                    try { localStorage.setItem('variantOrder', JSON.stringify(order)); } catch {/* ignore */}
                  }}
                >
                  <ServerField 
                    server={server}
                    onDelete={deleteServerField}
                    onUpdate={updateServer}
                    onSaveWeight={saveWeight}
                    onUrlPersist={persistUrl}
                    onUrlDelete={removeUrl}
                    onDescriptionUpdate={updateDescription}
                    filter={'all'}
                    onDrain={async ()=>{
                      await drainVariant(server.id);
                      setServers(prev => prev.map(s => s.id===server.id?{...s, enabled:false}:s));
                      setNotice({open:true,severity:'success',message:'Wariant zdrenowany'});
                    }}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>
      <Snackbar
        open={notice.open}
        autoHideDuration={2000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return;
          setNotice(n => ({ ...n, open: false }));
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotice(n => ({ ...n, open: false }))}
          severity={notice.severity}
          sx={{ width: '100%' }}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default App

