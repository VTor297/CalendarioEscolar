// src/services/api.js
const BASE_URL = "http://localhost:3000";

// =====================================
// HELPER DE REQUISIÇÃO
// =====================================

async function request(path, options = {}) {
    const resposta = await fetch(`${BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    let corpo = null;
    try {
        corpo = await resposta.json();
    } catch {
        corpo = null;
    }

    if (!resposta.ok) {
        const mensagem =
            corpo?.erro ||
            corpo?.message ||
            `Erro ${resposta.status} ao chamar ${path}`;
        throw new Error(mensagem);
    }

    return corpo;
}

// =====================================
// EVENTOS
// =====================================

export async function listarEventos() {
    return request("/eventos");
}

// =====================================
// HORÁRIOS
// =====================================

export async function listarHorarios(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/horarios${qs ? `?${qs}` : ""}`);
}

export async function listarAulasDeHoje(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/horarios/hoje${qs ? `?${qs}` : ""}`);
}

export async function cadastrarHorario(dados) {
    return request("/admin/horarios", {
        method: "POST",
        body: JSON.stringify(dados)
    });
}

export async function editarHorario(id, dados) {
    return request(`/admin/horarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados)
    });
}

export async function removerHorario(id) {
    return request(`/admin/horarios/${id}`, { method: "DELETE" });
}

// =====================================
// USUÁRIOS
// =====================================

export async function cadastrarUsuario(dados) {
    return request("/cadastrar", {
        method: "POST",
        body: JSON.stringify(dados)
    });
}

export async function listarUsuarios() {
    return request("/listar");
}

export async function buscarUsuario(id) {
    return request(`/usuario/buscar/${id}`);
}

export async function editarUsuario(id, dados) {
    return request(`/users/editar/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados)
    });
}

export async function excluirUsuario(id) {
    return request(`/usuario/delete/${id}`, { method: "DELETE" });
}

// =====================================
// SOLICITAÇÕES (aulas)
// =====================================

export async function criarSolicitacao(dados) {
    return request("/requests", {
        method: "POST",
        body: JSON.stringify(dados)
    });
}

export async function listarSolicitacoesPendentes() {
    return request("/admin/requests");
}

export async function aprovarSolicitacao(id) {
    return request(`/admin/requests/${id}/aprovar`, { method: "PUT" });
}

export async function recusarSolicitacao(id) {
    return request(`/admin/requests/${id}/recusar`, { method: "PUT" });
}

// =====================================
// TROCAS DE AULA
// =====================================

export async function criarTroca(dados) {
    return request("/trocas", {
        method: "POST",
        body: JSON.stringify(dados)
    });
}

export async function listarTrocas(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/trocas${qs ? `?${qs}` : ""}`);
}

export async function cancelarTroca(id) {
    return request(`/trocas/${id}`, { method: "DELETE" });
}

// Coordenação
export async function listarTrocasPendentes() {
    return request("/admin/trocas");
}

export async function aprovarTroca(id) {
    return request(`/admin/trocas/${id}/aprovar`, { method: "PUT" });
}

export async function recusarTroca(id, motivoRecusa = "") {
    return request(`/admin/trocas/${id}/recusar`, {
        method: "PUT",
        body: JSON.stringify({ motivoRecusa })
    });
}