import { useState } from 'react'
import './App.css'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import TestDetail from './components/TestDetail';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';


function App() {
  type TestItem = { id: number; name: string; active: boolean };
  type DomainItem = { id: number; name: string; active: boolean; tests: TestItem[]; urls: string[] };

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [selected, setSelected] = useState<{ domainId: number; testId: number } | null>(null);

  const addDomain = () => {
    setDomains(prev => [...prev, { id: prev.length, name: `Domain ${prev.length + 1}`, active: true, tests: [], urls: [] }]);
  };

  const removeDomain = (idToRemove: number) => {
    setDomains(prev => prev.filter(d => d.id !== idToRemove));
    setSelected(s => (s && s.domainId === idToRemove ? null : s));
  };

  const addTestToDomain = (domainId: number) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, tests: [...d.tests, { id: d.tests.length, name: `Test ${d.tests.length + 1}`, active: true }] } : d));
  };

  const toggleDomainActive = (domainId: number) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, active: !d.active } : d));
  };

  const toggleTestActive = (domainId: number, testId: number) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, tests: d.tests.map(t => t.id === testId ? { ...t, active: !t.active } : t) } : d));
  };

  const updateDomainName = (domainId: number, newName: string) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, name: newName } : d));
  };

  const addDomainUrl = (domainId: number) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, urls: [...d.urls, ''] } : d));
  };

  const updateDomainUrl = (domainId: number, index: number, value: string) => {
    setDomains(prev => prev.map(d => {
      if (d.id !== domainId) return d;
      const urls = [...d.urls];
      urls[index] = value;
      return { ...d, urls };
    }));
  };

  const removeDomainUrl = (domainId: number, index: number) => {
    setDomains(prev => prev.map(d => {
      if (d.id !== domainId) return d;
      const urls = d.urls.filter((_, i) => i !== index);
      return { ...d, urls };
    }));
  };

  const selectTest = (domainId: number, testId: number) => {
    setSelected({ domainId, testId });
  };

  const closeDetail = () => setSelected(null);

  const saveTest = (domainId: number, testId: number, updated: { name?: string; active?: boolean }) => {
    setDomains(prev => prev.map(d => {
      if (d.id !== domainId) return d;
      return {
        ...d,
        tests: d.tests.map(t => t.id === testId ? { ...t, name: updated.name ?? t.name, active: updated.active ?? t.active } : t)
      };
    }));
  };

  const deleteTest = (domainId: number, testId: number) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { ...d, tests: d.tests.filter(t => t.id !== testId) } : d));
    setSelected(s => (s && s.domainId === domainId && s.testId === testId ? null : s));
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
              <div className="domain_card" key={domain.id}>
                <div className="domain_card_header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <Checkbox checked={domain.active} onChange={() => toggleDomainActive(domain.id)} onClick={(e) => e.stopPropagation()} size="small" />
                    <TextField value={domain.name} size="small" variant="standard" onChange={(e) => updateDomainName(domain.id, e.target.value)} style={{ flex: 1 }} onClick={(e) => e.stopPropagation()} />
                  </div>
                  <div className="domain_actions">
                    <Button size="small" variant="outlined" onClick={() => addTestToDomain(domain.id)}>+ Test</Button>
                    <IconButton size="small" color="error" onClick={() => removeDomain(domain.id)} aria-label="delete-domain"><DeleteIcon /></IconButton>
                  </div>
                </div>

                <ul className="test_list">
                  {domain.tests.map(test => (
                    <li key={test.id} className="test_list_item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Checkbox checked={test.active} onChange={() => toggleTestActive(domain.id, test.id)} onClick={(e) => e.stopPropagation()} size="small" />
                        <span style={{ color: "black" }} className="test_name">{test.name}</span>
                      </div>
                      <Button size="small" variant="text" onClick={() => selectTest(domain.id, test.id)}>Details</Button>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>Domain URLs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {domain.urls.map((u, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <TextField value={u} size="small" variant="outlined" fullWidth onChange={(e) => updateDomainUrl(domain.id, idx, e.target.value)} />
                        <IconButton size="small" color="error" onClick={() => removeDomainUrl(domain.id, idx)} aria-label="delete-url"> <DeleteIcon /> </IconButton>
                      </div>
                    ))}
                    <Button size="small" variant="text" onClick={() => addDomainUrl(domain.id)}>+ Add URL</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div id="detail_panel">
            {selected ? (
              <div className="detail_container">
                <button className="close_detail" onClick={closeDetail}>Close</button>
                {(() => {
                  const domain = domains.find(d => d.id === selected.domainId);
                  const test = domain?.tests.find(t => t.id === selected.testId);
                  if (!domain || !test) return <div className="detail_placeholder">Test not found</div>;
                  return (
                    <TestDetail
                      domainId={domain.id}
                      testId={test.id}
                      testData={test}
                      onSave={(updated) => saveTest(domain.id, test.id, updated)}
                      onDelete={() => deleteTest(domain.id, test.id)}
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
