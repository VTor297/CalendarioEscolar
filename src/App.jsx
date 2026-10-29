import { useState } from "react";
import Login from "./components/Login.jsx"
import CoordenacaoApp from "./components/Cordenacao.jsx";
import ProfessorApp from "./components/Professor.jsx";
import AlunoApp from "./components/Aluno.jsx";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const sair = () => setUsuario(null);

  if (!usuario) return <Login onEntrar={setUsuario} />;

  if (usuario.perfil === "Coordenação") {
    return <CoordenacaoApp usuario={usuario} onSair={sair} />;
  }

  if(usuario.perfil === "Professor") {
    return <ProfessorApp usuario={usuario} onSair={sair} />;
  }

  if(usuario.perfil === "Aluno") {
    return <AlunoApp usuario={usuario} onSair={sair} />;
  }
}