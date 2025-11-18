// Selecionando elementos
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(
    '#barra-de-pesquisa input[type="text"]'
  );
  const graficosSection = document.getElementById("graficos-section");
  const graficoContainers = document.querySelectorAll(".grafico-container");
  const addButton = document.getElementById("add-variaçao");
  const themeButton = document.getElementById("tema-btn");

  //   Funções
  // Barra de pesquisa interativa
  const originalContent = Array.from(graficoContainers).map(
    (container) => container.textContent
  );

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      graficoContainers.forEach((container, index) => {
        const originalText = originalContent[index].toLowerCase();

        if (searchTerm === "" || originalText.includes(searchTerm)) {
          // Mostrar gráfico se corresponder à busca ou se o campo estiver vazio
          container.style.display = "block";
        } else {
          // Esconder gráfico se não corresponder
          container.style.display = "none";
        }
      });
    });
  }

  // Adicionar ou gastos ou ganhos

  addButton.addEventListener("click", () => {
    console.log('Botão "Adicionar gasto ou ganho" clicado');
  });

  // mudança de tema

  themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
});
