import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    path: '/content/sample-project/us/en/jcr:content/root/container/container/helloworld',
    text: '',
    description: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Updating...');

    const data = new FormData();
    data.append('path', formData.path);
    if (formData.text) data.append('text', formData.text);
    if (formData.description) data.append('description', formData.description);

    try {
      // Fetch CSRF Token
      const tokenResponse = await fetch('/libs/granite/csrf/token.json', {
        headers: { 'Authorization': 'Basic ' + btoa('admin:admin') }
      });
      const tokenData = await tokenResponse.json();
      const csrfToken = tokenData.token;

      const response = await fetch('/bin/component/update', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('admin:admin'),
          'CSRF-Token': csrfToken
        },
        body: data
      });

      if (response.ok) {
        setStatus('Success: Component updated!');
      } else {
        const text = await response.text();
        console.error('Update failed:', response.status, text);
        setStatus(`Error: ${response.status} - ${text}`);
      }
    } catch (error) {
      console.error('Error updating component:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleLoad = async () => {
    setStatus('Loading...');
    try {
      const response = await fetch(formData.path + '.json', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('admin:admin')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          text: data.text || '',
          description: data.description || ''
        }));
        setStatus('Success: Data loaded from AEM!');
      } else {
        setStatus(`Error Loading: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus(`Error Loading: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AEM Content Editor</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Component Path:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                name="path"
                value={formData.path}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
              <button type="button" onClick={handleLoad} style={{ padding: '0.5rem', cursor: 'pointer' }}>Load</button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Text:</label>
            <input
              type="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.75rem', fontSize: '1rem', cursor: 'pointer' }}>
            Update Component
          </button>
        </form>
        {status && <p style={{ marginTop: '1rem', color: status.startsWith('Error') ? 'red' : 'lightgreen' }}>{status}</p>}
      </header>
    </div>
  );
}

export default App;
