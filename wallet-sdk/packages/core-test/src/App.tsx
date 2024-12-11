import { useState } from 'react';
import { Core } from '@wallet-sdk/core';

function App() {
  const [status, setStatus] = useState<string>('');

  const initializeCore = () => {
    try {
      const core = new Core({
        env: 'local',
        apiKey: 'test-api-key',
        orgHost: 'http://localhost:3000',
      });

      console.log('Core instance:', core);
      setStatus('Core initialized successfully!');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div>
      <h1>Wallet Core Test</h1>
      <button onClick={initializeCore}>Initialize Core</button>
      <p>{status}</p>
    </div>
  );
}

export default App;
