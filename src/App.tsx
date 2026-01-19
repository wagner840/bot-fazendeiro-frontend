import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import {
  Dashboard,
  Funcionarios,
  Produtos,
  Encomendas,
  Financeiro,
  Configuracoes,
} from './pages';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="encomendas" element={<Encomendas />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
