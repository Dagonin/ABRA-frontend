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
import { domainAPI, testAPI, endpointAPI, variantAPI } from './services/api';


function App() {
  const [domains, setDomains] = useState<import('./services/api').DomainModel[]>([]);
  const [selected, setSelected] = useState<{ domainId: string; testId: string } | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await domainAPI.getAll();
        setDomains(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDomains();
  }, []);

  // Domain CRUD operations using API
  const refreshDomains = async () => {
    try {
      const data = await domainAPI.getAll();
      console.log('Refreshed domains from API:', data);
      setDomains(data);
    } catch (error) {
      console.error('Failed to refresh domains', error);
    }
  };

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
      // This function is called on blur/enter, so it's not firing on every keystroke.
      // It sends the current state of the domain host to the backend.
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

  // Test CRUD operations using API
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
      const domain = domains.find(d => d.domain_id === domainId);
      const test = domain?.tests?.find(t => t.test_id === testId);
      if (!test) return;

      // 1. Update the test's scalar properties (name, active, etc.)
      const testPayload = {
        test_id: testId,
        name: updated.name ?? test.name,
        active: updated.active ?? test.active,
        description: updated.description ?? test.description,
        subpath: updated.subpath ?? test.subpath,
        domainModel: { domain_id: domainId },
      };
      await testAPI.update(testId, testPayload as any);

      // 2. Synchronize variants and their nested endpoints
      const originalVariants = test.variantModels ?? [];
      const updatedVariants = updated.variantModels ?? [];
      const updatedVariantIds = new Set(updatedVariants.map(v => v.variant_id).filter(Boolean));

      // 2a. Delete variants that are no longer present
      for (const originalVariant of originalVariants) {
        if (originalVariant.variant_id && !updatedVariantIds.has(originalVariant.variant_id)) {
          await variantAPI.delete(originalVariant.variant_id);
        }
      }

      // 2b. Create or update variants
      for (const variantData of updatedVariants) {
        const variantPayload = {
          name: variantData.name,
          active: variantData.active,
          weight: variantData.weight,
          description: variantData.description,
        };

        let currentVariantId = variantData.variant_id;

        if (currentVariantId) { // Update existing variant
          await variantAPI.update(currentVariantId, variantPayload as any);
        } else { // Create new variant
          const newVariant = await variantAPI.create({ ...variantPayload, testModel: { test_id: testId } });
          currentVariantId = newVariant.variant_id;
        }

        // 3. Synchronize endpoints for the current variant
        if (currentVariantId) {
          const originalVariant = originalVariants.find(v => v.variant_id === currentVariantId);
          const originalEndpoints = originalVariant?.endpointModels ?? [];
          const updatedEndpoints = variantData.endpointModels ?? [];
          const updatedEndpointIds = new Set(updatedEndpoints.map((e: any) => (e as any).endpoint_id).filter(Boolean));

          // 3a. Delete endpoints
          for (const originalEndpoint of originalEndpoints) {
            const originalId = (originalEndpoint as any).endpoint_id;
            if (originalId && !updatedEndpointIds.has(originalId)) {
              await endpointAPI.delete(originalId);
            }
          }

          // 3b. Create or update endpoints
          for (const endpointData of updatedEndpoints) {
            const endpointPayload = { url: endpointData.url, active: endpointData.active };
            const endpointId = (endpointData as any).endpoint_id;
            if (endpointId) { // Update
              await endpointAPI.update(endpointId, endpointPayload as any);
            } else { // Create
              await endpointAPI.create({ ...endpointPayload, variantModel: { variant_id: currentVariantId } });
            }
          }
        }
      }

      // 4. Refresh state from server to get a consistent view
      await refreshDomains();
    } catch (error) {
      console.error('Failed to save test', error);
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
  // Add a url field locally; persist when user enters a URL
  const addDomainUrl = async (domainId: string) => {
    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      let eps = d.defaultEndpoints ?? [];
      // Remove any accidental trailing empty fields
      eps = eps.filter((e, i, arr) => i === arr.length - 1 ? true : e.url && e.url.trim() !== '');
      // Only add if all current fields are filled (no empty url fields)
      if (eps.some(e => !e.url || e.url.trim() === '')) return { ...d, defaultEndpoints: eps };
      return { ...d, defaultEndpoints: [...eps, { url: '', active: true }] };
    }));
  };

  // local update only (no network) — use persistDomainUrl on blur/enter
  const updateDomainUrl = (domainId: string, idx: number, value: string) => {
    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      const eps = [...(d.defaultEndpoints ?? [])];
      eps[idx] = { ...eps[idx], url: value };
      return { ...d, defaultEndpoints: eps };
    }));
  };

  const removeDomainUrl = async (domainId: string, idx: number) => {
    // Remove locally first
    let removedUrl: string | undefined;
    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      const eps = [...(d.defaultEndpoints ?? [])];
      removedUrl = eps[idx]?.url;
      eps.splice(idx, 1);
      return { ...d, defaultEndpoints: eps };
    }));

    try {
      if (removedUrl) {
        await endpointAPI.delete(removedUrl);
      }
      await refreshDomains();
    } catch (error) {
      console.error('Failed to remove domain URL', error);
    }
  };

  const saveDomainUrls = async (domainId: string) => {
    try {
      // Fetch fresh domain data from server to compare
      const freshDomain = await domainAPI.getById(domainId);
      const serverUrls = new Set((freshDomain.defaultEndpoints ?? []).map(e => e.url));
      
      const domain = domains.find(d => d.domain_id === domainId);
      if (!domain || !domain.defaultEndpoints) return;

      const localUrls = new Set(domain.defaultEndpoints.map(e => e.url).filter(u => u && u.trim() !== ''));

      // Delete URLs that were in server but not in local state
      for (const serverUrl of serverUrls) {
        if (!localUrls.has(serverUrl)) {
          try {
            await endpointAPI.delete(serverUrl);
          } catch (e) {
            console.error('Failed to delete URL:', serverUrl, e);
          }
        }
      }

      // Create URLs that are in local state but not in server
      for (const endpoint of domain.defaultEndpoints) {
        const trimmedUrl = (endpoint.url || '').trim();
        if (trimmedUrl && !serverUrls.has(trimmedUrl)) {
          try {
            await endpointAPI.create({ url: trimmedUrl, active: endpoint.active ?? true, domainModel: { domain_id: domainId } });
          } catch (e) {
            console.error('Failed to create URL:', trimmedUrl, e);
          }
        }
      }

      // Remove empty fields from local state
      setDomains(prev => prev.map(d => {
        if (d.domain_id !== domainId) return d;
        const eps = (d.defaultEndpoints ?? []).filter(e => e.url && e.url.trim() !== '');
        return { ...d, defaultEndpoints: eps };
      }));

      await refreshDomains();
    } catch (error) {
      console.error('Failed to save domain URLs', error);
    }
  };

  return (
    <>
      <div id="main_container">
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
              <div className="detail_container">
                <button className="close_detail" onClick={() => setSelected(null)}>Close</button>
                {(() => {
                  const domain = domains.find(d => d.domain_id === selected.domainId);
                  const test = domain?.tests?.find(t => t.test_id === selected.testId);
                  if (!domain || !test) return <div className="detail_placeholder">Test not found</div>;
                  console.log('Passing test data to TestDetail:', test);
                  console.log('Test variantModels:', test.variantModels);
                  return (
                    <TestDetail
                      testData={test}
                      onSave={(updated) => saveTest(domain.domain_id, test.test_id, updated)}
                      onDelete={() => deleteTest(domain.domain_id, test.test_id)}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="detail_placeholder">Select a test to view details</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}


export default App
