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
  const [selectedTestDetails, setSelectedTestDetails] = useState<import('./services/api').TestModel | null>(null);

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

  useEffect(() => {
    if (!selected) {
      setSelectedTestDetails(null);
      return;
    }

    const fetchTestDetails = async () => {
      try {
        // Fetch the test object itself to get the most up-to-date data,
        // not just what's in the potentially stale domains list.
        const testDetails = await testAPI.getById(selected.testId);
        const variants = await variantAPI.getByTestId(selected.testId);
        setSelectedTestDetails({ ...testDetails, variantModels: variants });
      } catch (error) {
        console.error('Failed to fetch test details', error);
        setSelectedTestDetails(null); // On error, clear details to avoid showing stale data
      }
    };

    fetchTestDetails();
  }, [selected, domains]);

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
      if (!selectedTestDetails) {
        console.error("Cannot save test: details not loaded.");
        return;
      }

      // 1. Update the test's scalar properties (name, active, etc.)
      const testPayload = {
        test_id: testId,
        name: updated.name ?? selectedTestDetails.name,
        active: updated.active ?? selectedTestDetails.active,
        description: updated.description ?? selectedTestDetails.description,
        subpath: updated.subpath ?? selectedTestDetails.subpath,
        domainModel: { domain_id: domainId },
        variantModels: selectedTestDetails.variantModels ?? [], // Pass original variants to prevent deletion
      };
      await testAPI.update(testId, testPayload as any);

      // 2. Synchronize variants and their nested endpoints
      const originalVariants = selectedTestDetails.variantModels ?? [];
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
          await variantAPI.update(currentVariantId, {
            variant_id: currentVariantId, // Ensure ID is in the payload
            ...variantPayload,
            testModel: { test_id: testId },
          } as any);
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
              const originalEndpoint = originalEndpoints.find(e => (e as any).endpoint_id === endpointId);
              await endpointAPI.update(endpointId, { ...originalEndpoint, ...endpointPayload, variantModel: { variant_id: currentVariantId } } as any);
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

  const deleteVariantEndpoint = async (endpointId: string) => {
    try {
      await endpointAPI.delete(endpointId);
      // After deleting, refresh the test details to reflect the change in the UI.
      if (selected) {
        const testDetails = await testAPI.getById(selected.testId);
        const variants = await variantAPI.getByTestId(selected.testId);
        setSelectedTestDetails({ ...testDetails, variantModels: variants });
      }
    } catch (error) {
      console.error('Failed to delete variant endpoint', error);
      // Revert by fetching all data to ensure UI consistency after a failed delete.
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
    // Find the endpoint to delete from the current state before any updates
    const domain = domains.find(d => d.domain_id === domainId);
    const endpointToDelete = domain?.defaultEndpoints?.[idx];

    // Optimistically update the UI by removing the endpoint from local state
    setDomains(prev => prev.map(d => {
      if (d.domain_id !== domainId) return d;
      const eps = [...(d.defaultEndpoints ?? [])];
      eps.splice(idx, 1);
      return { ...d, defaultEndpoints: eps };
    }));

    // If the endpoint was a persisted one (had an ID), delete it from the backend
    console.log(endpointToDelete)
    console.log(endpointToDelete?.url)
    if (endpointToDelete?.url) {
      try {
        await endpointAPI.delete(endpointToDelete.url);
      } catch (error) {
        console.error('Failed to remove domain URL', error);
        // If the API call fails, revert the optimistic update by refreshing from the server.
        await refreshDomains();
      }
    }
  };

  const saveDomainUrls = async (domainId: string) => {
    try {
      // Get the current state of endpoints for the domain from the server
      const freshDomain = await domainAPI.getById(domainId);
      const originalEndpoints = freshDomain.defaultEndpoints ?? [];

      // Get the updated state of endpoints from the local UI state
      const domainFromState = domains.find(d => d.domain_id === domainId);
      if (!domainFromState) return;
      const updatedEndpoints = (domainFromState.defaultEndpoints ?? []).filter(e => e.url && e.url.trim() !== '');

      const updatedEndpointIds = new Set(updatedEndpoints.map(e => e.endpoint_id).filter(Boolean));

      // 1. Delete endpoints that are no longer present in the UI
      for (const originalEndpoint of originalEndpoints) {
        if (originalEndpoint.endpoint_id && !updatedEndpointIds.has(originalEndpoint.endpoint_id)) {
          await endpointAPI.delete(originalEndpoint.endpoint_id);
        }
      }

      // 2. Create or update endpoints
      for (const endpointData of updatedEndpoints) {
        const endpointPayload = { url: endpointData.url, active: endpointData.active ?? true };

        if (endpointData.endpoint_id) { // Update existing endpoint
          const originalEndpoint = originalEndpoints.find(e => e.endpoint_id === endpointData.endpoint_id);
          await endpointAPI.update(endpointData.endpoint_id, { ...originalEndpoint, ...endpointPayload, domainModel: { domain_id: domainId } } as any);
        } else { // Create new endpoint
          await endpointAPI.create({ ...endpointPayload, domainModel: { domain_id: domainId } });
        }
      }

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
              // Only render TestDetail if the fetched details match the selected test ID.
              // This prevents showing stale data from a previous selection while new data is loading.
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


export default App
