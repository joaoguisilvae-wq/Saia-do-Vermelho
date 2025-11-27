// Função GLOBAL exigida pelo Google Identity Services
function handleCredentialResponse(response) {
  const payload = JSON.parse(atob(response.credential.split(".")[1]));

  localStorage.setItem(
    "usuario_logado",
    JSON.stringify({
      nome: payload.name,
      email: payload.email,
      foto: payload.picture,
      logado: true,
    })
  );

  // Redireciona para a página com os gráficos
  window.location.href = "../graficos-page/graficos.html"; // ou o caminho correto
}
