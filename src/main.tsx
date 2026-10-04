import {lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

const Workspace = import.meta.env.VITE_CRM_MODE === 'independent'
  ? lazy(() => import('./IndependentCRM.tsx'))
  : lazy(() => import('./AuthGate.tsx'));
createRoot(document.getElementById('root')!).render(<Suspense fallback={<p>Sponti wird geladen …</p>}><Workspace /></Suspense>);
