import { useState } from "react";
import "./Login.css";

// Contas de exemplo para demonstração. Em produção, a autenticação deve ser feita no servidor.
const CONTAS = [
  { email: "marta@escola.com", senha: "coord123", nome: "Marta Lima", perfil: "Coordenação" },
  { email: "carlos@escola.com", senha: "prof123", nome: "Carlos Mendes", perfil: "Professor" },
  { email: "ana@escola.com", senha: "aluno123", nome: "Ana Souza", perfil: "Aluno" },
];
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DESTAQUES = [9, 16, 22, 30]; // dias em destaque no calendário decorativo

function PainelMarca() {
  return (
    <section className="login-brand" aria-hidden="true">
      <div>
        <div className="brand">Calendário Escolar</div>
        <h2>Datas, horários e avisos em um só lugar.</h2>
        <p>Chega de comunicados espalhados e controles manuais.</p>
      </div>
      <div className="mini-cal">
        {Array.from({ length: 35 }, (_, i) => (
          <span key={i} className={DESTAQUES.includes(i) ? "dia hoje" : "dia"} />
        ))}
      </div>
    </section>
  );
}

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState("entrar"); // "entrar" | "recuperar" | "enviado"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const trocarModo = (m) => {
    setModo(m);
    setErro("");
  };

  const entrar = (e) => {
    e.preventDefault();
    if (!EMAIL_VALIDO.test(email.trim())) return setErro("Digite um e-mail válido.");
    if (!senha) return setErro("Digite a sua senha.");
    setErro("");
    setCarregando(true);
    setTimeout(() => {
      const conta = CONTAS.find((c) => c.email === email.trim().toLowerCase() && c.senha === senha);
      setCarregando(false);
      if (!conta) return setErro("E-mail ou senha incorretos.");
      onEntrar({ nome: conta.nome, perfil: conta.perfil, email: conta.email });
    }, 600);
  };

  const recuperar = (e) => {
    e.preventDefault();
    if (!EMAIL_VALIDO.test(email.trim())) return setErro("Digite um e-mail válido.");
    setErro("");
    setModo("enviado");
  };

  return (
    <div className="login">
      <PainelMarca />

      <main className="login-lado">
        <div className="login-card">
          {modo === "entrar" && (
            <form onSubmit={entrar} noValidate>
              <h1>Entrar</h1>
              <p className="help">Use o e-mail e a senha cadastrados pela coordenação.</p>

              <div className="campo">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nome@escola.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="campo">
                <label htmlFor="senha">Senha</label>
                <div className="senha">
                  <input
                    id="senha"
                    type={ver ? "text" : "password"}
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button type="button" className="ver" onClick={() => setVer(!ver)} aria-pressed={ver}>
                    {ver ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <p className="err" role="alert">{erro}</p>

              <button className="btn grande" type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>
              <button type="button" className="link" onClick={() => trocarModo("recuperar")}>
                Esqueci minha senha
              </button>

              <div className="contas">
                <div className="meta">Contas de exemplo (clique para preencher):</div>
                {CONTAS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => { setEmail(c.email); setSenha(c.senha); setErro(""); }}
                  >
                    <b>{c.perfil}</b> · {c.email}
                  </button>
                ))}
              </div>
            </form>
          )}

          {modo === "recuperar" && (
            <form onSubmit={recuperar} noValidate>
              <h1>Recuperar senha</h1>
              <p className="help">Informe o seu e-mail e enviaremos um link para criar uma nova senha.</p>
              <div className="campo">
                <label htmlFor="email-rec">E-mail</label>
                <input
                  id="email-rec"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="err" role="alert">{erro}</p>
              <button className="btn grande" type="submit">Enviar link</button>
              <button type="button" className="link" onClick={() => trocarModo("entrar")}>Voltar para o login</button>
            </form>
          )}

          {modo === "enviado" && (
            <div>
              <h1>Verifique o seu e-mail</h1>
              <p className="help">
                Se {email.trim()} estiver cadastrado, você receberá um link para criar uma nova senha em alguns minutos.
              </p>
              <button className="btn grande" onClick={() => trocarModo("entrar")}>Voltar para o login</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}