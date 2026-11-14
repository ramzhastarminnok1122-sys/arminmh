import { Routes, Route } from 'react-router-dom';
import NeginHome from './pages/NeginHome';

function App() {
  return (
    <Routes>
      <Route path="/" element={<NeginHome />} />
    </Routes>
  );
}

export default App;
