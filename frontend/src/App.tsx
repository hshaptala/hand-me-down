import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Register from "./pages/Register.tsx";
import Layout from "./Layout.tsx"
import CommunitiesPage from "./pages/Communities.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="communities" element={<CommunitiesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
