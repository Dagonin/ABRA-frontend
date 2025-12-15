import { useState, useEffect } from 'react'
import './App.css'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import TestDetail from './components/TestDetail';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import LogoutIcon from '@mui/icons-material/Logout';
import { domainAPI, testAPI, endpointAPI, variantAPI, authAPI, setAuthToken, getAuthToken } from './services/api';

// Simple Login Component
function Login({ onLogin }: { onLogin: () => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authAPI.login({ login, password });
      setAuthToken(data.token);
      onLogin();
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '3rem',
      maxWidth: '400px',
      margin: '100px auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: 0, textAlign: 'center', color: '#333' }}>ABRA Admin Login</h2>
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      <TextField
        label="Username"
        variant="outlined"
        value={login}
        onChange={e => setLogin(e.target.value)}
        fullWidth
      />
      <TextField
        type="password"
        label="Password"
        variant="outlined"
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        fullWidth
      >
        Login
      </Button>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [domains, setDomains] = useState<import('./services/api').DomainModel[]>([]);
  const [selected, setSelected] = useState<{ domainId: string; testId: string } | null>(null);
  const [selectedTestDetails, setSelectedTestDetails] = useState<import('./services/api').TestModel | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDomains();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selected || !isAuthenticated) {
      setSelectedTestDetails(null);
      return;
    }

    const fetchTestDetails = async () => {
      try {
        const testDetails = await testAPI.getById(selected.testId);
        const variants = await variantAPI.getByTestId(selected.testId);
        setSelectedTestDetails({ ...testDetails, variantModels: variants });
      } catch (error) {
        console.error('Failed to fetch test details', error);
        setSelectedTestDetails(null);
      }
    };

    fetchTestDetails();
  }, [selected, domains, isAuthenticated]);

  const refreshDomains = async () => {
    try {
      const data = await domainAPI.getAll();
      setDomains(data);
    } catch (error) {
      console.error('Failed to refresh domains', error);
      // If fetch fails with auth error, logout
      if (getAuthToken()) {
        // Optional: check error type
      }
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setDomains([]);
    setSelected(null);
  };

  // --- Domain CRUD ---
  const addDomain = async () => {
    try {
      const newDomain = { host: `Domain ${domains.length + 1}`, active: true };
      await domainAPI.create(newDomain);
      await refreshDomains();
    } catch (error) {
      console.error('Failed to add domain', error);
    }
  };

  const removeDomain = async (domainId: string) => {
    try {
      await domainAPI.delete(domainId);
      setSelected(s => (s && s.domainId === domainId ? null : s));
      await refreshDomains();
    } catch (error) {
      console.error('Failed to remove domain', error);
    }
  };

  const handleDomainNameChange = (domainId: string, newName: string) => {
    setDomains(prevDomains =>
      prevDomains.map(d => (d.domain_id === domainId ? { ...d, host: newName } : d))
    );
  };

  const persistDomainName = async (domainId: string) => {
    try {
      const domain = domains.find(d => d.domain_id === domainId);
      if (!domain) return;
      const { tests, defaultEndpoints, ...domainToUpdate } = domain;
      await domainAPI.update(domainId, domainToUpdate);
      await refreshDomains();
    } catch (error) {
      console.error('Failed to update domain name', error);
    }
  };

  const toggleDomainActive = async (domainId: string) => {
    try {
      const domain = domains.find(d => d.domain_id === domainId);
      if (!domain) return;
      const { tests, defaultEndpoints, ...domainToUpdate } = domain;
      await domainAPI.update(domainId, { ...domainToUpdate, active: !domain.active });
      await refreshDomains();
    } catch (error) {
      console.error('Failed to toggle domain active', error);
    }
  };

  // --- Test CRUD ---
  const addTestToDomain = async (domainId: string) => {
    try {
      const domain = domains.find(d => d.domain_id === domainId);
      if (!domain) return;
      const newTest = { name: `Test ${(domain.tests?.length ?? 0) + 1}`, active: true, domainModel: domain };
      await testAPI.create(newTest);
      await refreshDomains();
    } catch (error) {
      console.error('Failed to add test', error);
    }
  };

  const toggleTestActive = async (domainId: string, testId: string) => {
    try {
      const domain = domains.find(d => d.domain_id === domainId);
      const test = domain?.tests?.find(t => t.test_id === testId);
      if (!test) return;
      await testAPI.update(testId, {
        ...test,
        active: !test.active,
        domainModel: { domain_id: domainId }
      } as any);
      await refreshDomains();
    } catch (error) {
      console.error('Failed to toggle test active', error);
    }
  };

  const saveTest = async (
    domainId: string,
    testId: string,
    updated: { name?: string; active?: boolean; description?: string; subpath?: string; variantModels?: any[] }
  ) => {
    try {
      if (!selectedTestDetails) return;

      const testPayload = {
        test_id: testId,
        name: updated.name ?? selectedTestDetails.name,
        active: updated.active ?? selectedTestDetails.active,
        description: updated.description ?? selectedTestDetails.description,
        subpath: updated.subpath ?? selectedTestDetails.subpath,
        domainModel: { domain_id: domainId },
        variantModels: selectedTestDetails.variantModels ?? [],
      };
      await testAPI.update(testId, testPayload as any);

      const originalVariants = selectedTestDetails.variantModels ?? [];
      const updatedVariants = updated.variantModels ?? [];
      const updatedVariantIds = new Set(updatedVariants.map(v => v.variant_id).filter(Boolean));

      for (const originalVariant of originalVariants) {
        if (originalVariant.variant_id && !updatedVariantIds.has(originalVariant.variant_id)) {
          await variantAPI.delete(originalVariant.variant_id);
        }
      }

      for (const variantData of updatedVariants) {
        const variantPayload = {
          name: variantData.name,
          active: variantData.active,
          weight: variantData.weight,
          description: variantData.description,
        };

        let currentVariantId = variantData.variant_id;

        if (currentVariantId) {
          await variantAPI.update(currentVariantId, {
            variant_id: currentVariantId,
            ...variantPayload,
            testModel: { test_id: testId },
          } as any);
        } else {
          const newVariant = await variantAPI.create({ ...variantPayload, testModel: { test_id: testId } });
          currentVariantId = newVariant.variant_id;
        }

        if (currentVariantId) {
          const originalVariant = originalVariants.find(v => v.variant_id === currentVariantId);
          const originalEndpoints = originalVariant?.endpointModels ?? [];
          const updatedEndpoints = variantData.endpointModels ?? [];
          const updatedEndpointIds = new Set(updatedEndpoints.map((e: any) => (e as any).endpoint_id).filter(Boolean));

          for (const originalEndpoint of originalEndpoints) {
            const originalId = (originalEndpoint as any).endpoint_id;
            if (originalId && !updatedEndpointIds.has(originalId)) {
              await endpointAPI.delete(originalId);
            }
          }

          for (const endpointData of updatedEndpoints) {
            const endpointPayload = { url: endpointData.url, active: endpointData.active };
            const endpointId = (endpointData as any).endpoint_id;
            if (endpointId) {
              const originalEndpoint = originalEndpoints.find(e => (e as any).endpoint_id === endpointId);
              await endpointAPI.update(endpointId, { ...originalEndpoint, ...endpointPayload, variantModel: { variant_id: currentVariantId } } as any);
            } else {
              await endpointAPI.create({ ...endpointPayload, variantModel: { variant_id: currentVariantId } });
            }
          }
        }
      }
      await refreshDomains();
    } catch (error) {
      console.error('Failed to save test', error);
    }
  };

  const deleteVariantEndpoint = async (endpointId: string) => {
    try {
      await endpointAPI.delete(endpointId);
      if (selected) {
        const testDetails = await testAPI.getById(selected.testId);
        const variants = await variantAPI.getByTestId(selected.testId);
        setSelectedTestDetails({ ...testDetails, variantModels: variants });
      }
    } catch (error) {
      console.error('Failed to delete variant endpoint', error);
      await refreshDomains();
    }
  };

  const deleteTest = async (domainId: string, testId: string) => {
    try {
      await testAPI.delete(testId);
      setSelected(s => (s && s.domainId === domainId && s.testId === testId ? null : s));
      await refreshDomains();
    } catch (error) {
      console.error('Failed to delete test', error);
    }
  };

  // --- Domain URL CRUD ---
  const addDomainUrl = async (domainId: string) => {
    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      let eps = d.defaultEndpoints ?? [];
      eps = eps.filter((e, i, arr) => i === arr.length - 1 ? true : e.url && e.url.trim() !== '');
      if (eps.some(e => !e.url || e.url.trim() === '')) return { ...d, defaultEndpoints: eps };
      return { ...d, defaultEndpoints: [...eps, { url: '', active: true }] };
    }));
  };

  const updateDomainUrl = (domainId: string, idx: number, value: string) => {
    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      const eps = [...(d.defaultEndpoints ?? [])];
      eps[idx] = { ...eps[idx], url: value };
      return { ...d, defaultEndpoints: eps };
    }));
  };

  const removeDomainUrl = async (domainId: string, idx: number) => {
    const domain = domains.find(d => d.domain_id === domainId);
    const endpointToDelete = domain?.defaultEndpoints?.[idx];

    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      const eps = [...(d.defaultEndpoints ?? [])];
      eps.splice(idx, 1);
      return { ...d, defaultEndpoints: eps };
    }));

    if (endpointToDelete?.url) {
      try {
        await endpointAPI.delete(endpointToDelete.url); // Note: Check if API expects ID or URL. Assuming ID based on previous code.
      } catch (error) {
        console.error('Failed to remove domain URL', error);
        await refreshDomains();
      }
    }
  };

  const saveDomainUrls = async (domainId: string) => {
    try {
      const freshDomain = await domainAPI.getById(domainId);
      const originalEndpoints = freshDomain.defaultEndpoints ?? [];
      const domainFromState = domains.find(d => d.domain_id === domainId);
      if (!domainFromState) return;
      const updatedEndpoints = (domainFromState.defaultEndpoints ?? []).filter(e => e.url && e.url.trim() !== '');
      const updatedEndpointIds = new Set(updatedEndpoints.map(e => e.endpoint_id).filter(Boolean));

      for (const originalEndpoint of originalEndpoints) {
        if (originalEndpoint.endpoint_id && !updatedEndpointIds.has(originalEndpoint.endpoint_id)) {
          await endpointAPI.delete(originalEndpoint.endpoint_id);
        }
      }

      for (const endpointData of updatedEndpoints) {
        const endpointPayload = { url: endpointData.url, active: endpointData.active ?? true };
        if (endpointData.endpoint_id) {
          const originalEndpoint = originalEndpoints.find(e => e.endpoint_id === endpointData.endpoint_id);
          await endpointAPI.update(endpointData.endpoint_id, { ...originalEndpoint, ...endpointPayload, domainModel: { domain_id: domainId } } as any);
        } else {
          await endpointAPI.create({ ...endpointPayload, domainModel: { domain_id: domainId } });
        }
      }
      await refreshDomains();
    } catch (error) {
      console.error('Failed to save domain URLs', error);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <div id="main_container">
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            style={{ backgroundColor: 'white' }}
          >
            Logout
          </Button>
        </div>

        <Fab
          color="primary"
          aria-label="add"
          onClick={addDomain}
          style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}
        >
          <AddIcon />
        </Fab>

        <div id="domains_and_details">
          <div id="domain_list">
            {domains.map(domain => (
              <div className="domain_card" key={domain.domain_id}>
                <div className="domain_card_header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <Checkbox checked={domain.active} onChange={() => toggleDomainActive(domain.domain_id)} onClick={(e) => e.stopPropagation()} size="small" />
                    <TextField value={domain.host} size="small" variant="standard"
                      onChange={(e) => handleDomainNameChange(domain.domain_id, e.target.value)}
                      onBlur={() => persistDomainName(domain.domain_id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      style={{ flex: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="domain_actions">
                    <Button size="small" variant="outlined" onClick={() => addTestToDomain(domain.domain_id)}>+ Test</Button>
                    <IconButton size="small" color="error" onClick={() => removeDomain(domain.domain_id)} aria-label="delete-domain"><DeleteIcon /></IconButton>
                  </div>
                </div>

                <ul className="test_list">
                  {(domain.tests ?? []).map(test => (
                    <li key={test.test_id} className="test_list_item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Checkbox checked={test.active} onChange={() => toggleTestActive(domain.domain_id, test.test_id)} onClick={(e) => e.stopPropagation()} size="small" />
                        <span style={{ color: "black" }} className="test_name">{test.name}</span>
                      </div>
                      <Button size="small" variant="text" onClick={() => setSelected({ domainId: domain.domain_id, testId: test.test_id })}>Details</Button>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>Domain URLs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(domain.defaultEndpoints ?? []).map((endpoint, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <TextField value={endpoint.url} size="small" variant="outlined" fullWidth
                          onChange={(e) => updateDomainUrl(domain.domain_id, idx, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                        />
                        <IconButton size="small" color="error" onClick={() => removeDomainUrl(domain.domain_id, idx)} aria-label="delete-url"> <DeleteIcon /> </IconButton>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button size="small" variant="text" onClick={() => addDomainUrl(domain.domain_id)}>+ Add URL</Button>
                      <Button size="small" variant="contained" onClick={() => saveDomainUrls(domain.domain_id)}>Save URLs</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div id="detail_panel">
            {selected ? (
              selectedTestDetails && selectedTestDetails.test_id === selected.testId ? (
                <div className="detail_container">
                  <button className="close_detail" onClick={() => setSelected(null)}>Close</button>
                  <TestDetail
                    key={selected.testId}
                    testData={selectedTestDetails}
                    onSave={(updated) => saveTest(selected.domainId, selected.testId, updated)}
                    onEndpointDelete={deleteVariantEndpoint}
                    onDelete={() => deleteTest(selected.domainId, selected.testId)}
                  />
                </div>
              ) : (
                <div className="detail_placeholder">Loading test details...</div>
              )
            ) : (
              <div className="detail_placeholder">Select a test to view details</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
export default App;