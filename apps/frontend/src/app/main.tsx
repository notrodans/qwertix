import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { setup } from './setup';

setup();

createRoot(document.getElementById('root')!).render(<App />);
