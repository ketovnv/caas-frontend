import { Routes, Route } from 'react-router-dom';
import { HomePage } from 'pages/home';
import { ComponentsShowcase } from 'pages/showcase';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/showcase" element={<ComponentsShowcase />} />
    </Routes>
  );
}
