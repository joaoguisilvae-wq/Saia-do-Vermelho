document.addEventListener("DOMContentLoaded", () => {
  // 🔐 Verificação de login
  const usuario = JSON.parse(localStorage.getItem("usuario_logado"));
  if (!usuario || !usuario.logado) {
    // Redireciona para a página de login se não estiver autenticado
    window.location.href = "singin-page/singin.html";
    return; // Impede que o resto do código execute
  }
  const searchInput = document.querySelector(
    '#barra-de-pesquisa input[type="text"]'
  );
  const graficosSection = document.getElementById("graficos-section");
  const graficoContainers = document.querySelectorAll(".grafico-container");
  const themeButton = document.getElementById("tema-btn");
  const form = document.getElementById("ganhos-gastos");
  const openBtn = document.getElementById("add-variaçao");
  const closeBtn = document.querySelector(".save-btn");
  const modalHistorico = document.getElementById("modal-historico");
  const btnFecharHistorico = document.getElementById("fechar-historico");
  const btnFechar = document.querySelector("#fechar-btn");
  const btnHistoricoSidebar = document.getElementById("btn-historico");
  const financasBtn = document.querySelector("#financas");
  const planilhasBtn = document.querySelector("#planilhas");
  const ajudaBtn = document.querySelector("#ajuda");
  const sobreBtn = document.querySelector("#sobre");

  // Função para formatar data BR
  function formatarDataBR(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // Função para renderizar o histórico no modal
  function renderizarHistoricoModal() {
    const lista = document.getElementById("lista-lancamentos-historico");
    if (!lista) return;

    if (lancamentos.length === 0) {
      lista.innerHTML = "<p>Nenhum lançamento registrado.</p>";
      return;
    }

    // Ordena do mais recente para o mais antigo
    const lancamentosOrdenados = [...lancamentos].sort(
      (a, b) => new Date(b.data) - new Date(a.data)
    );

    lista.innerHTML = lancamentosOrdenados
      .map((l) => {
        const valorFormatado = l.valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const tipoClasse = l.tipo === "add" ? "positivo" : "";
        const icone = l.tipo === "add" ? "+" : "−";

        return `
      <div class="lancamento-item-historico">
        <div class="lancamento-info-historico">
          <div class="categoria">${l.categoria}</div>
          <div>${l.descricao || "Sem descrição"}</div>
          <div>Data: ${formatarDataBR(l.data)}</div>
          <div class="valor ${tipoClasse}">${icone} ${valorFormatado}</div>
        </div>
        <button class="botao-remover-historico" data-id="${
          l.id
        }" title="Remover">🗑️</button>
      </div>
    `;
      })
      .join("");

    // Adiciona evento de remoção
    lista.querySelectorAll(".botao-remover-historico").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        if (confirm("Tem certeza que deseja remover este lançamento?")) {
          lancamentos = lancamentos.filter((l) => l.id !== id);
          localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
          renderizarHistoricoModal();
          atualizarGraficos(); // atualiza os gráficos em segundo plano
        }
      });
    });
  }

  // Abrir modal de histórico
  if (btnHistoricoSidebar) {
    btnHistoricoSidebar.addEventListener("click", (e) => {
      e.preventDefault();
      renderizarHistoricoModal();
      modalHistorico.classList.remove("hidden");
    });
  }

  // Fechar modal de histórico
  if (btnFecharHistorico) {
    btnFecharHistorico.addEventListener("click", () => {
      modalHistorico.classList.add("hidden");
    });
  }

  // Fechar ao clicar fora (opcional)
  window.addEventListener("click", (e) => {
    if (e.target === modalHistorico) {
      modalHistorico.classList.add("hidden");
    }
  });

  // Carrega os lançamentos do localStorage ou usa array vazio
  let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];

  // Instâncias dos gráficos (para atualização)
  let chartCategoria = null;
  let chartComparativo = null;
  let chartEvolucao = null;

  // Função para calcular dados
  function calcularDadosGraficos() {
    let receitas = 0;
    let despesas = 0;
    const gastosPorCategoria = {};
    const evolucao = {}; // { "2025-11": { receitas: 0, despesas: 0 }, ... }

    lancamentos.forEach((l) => {
      const mesAno = l.data.substring(0, 7); // "2025-11"
      if (!evolucao[mesAno]) {
        evolucao[mesAno] = { receitas: 0, despesas: 0 };
      }

      if (l.tipo === "add") {
        receitas += l.valor;
        evolucao[mesAno].receitas += l.valor;
      } else {
        despesas += l.valor;
        evolucao[mesAno].despesas += l.valor;
        gastosPorCategoria[l.categoria] =
          (gastosPorCategoria[l.categoria] || 0) + l.valor;
      }
    });

    return { receitas, despesas, gastosPorCategoria, evolucao };
  }

  // Função para criar/atualizar gráficos
  // Função para criar/atualizar gráficos
  function atualizarGraficos() {
    const dados = calcularDadosGraficos();

    // --- Gráfico: Gastos por Categoria (Barras) ---
    const ctx1 = document
      .getElementById("grafico-gastos-categoria")
      ?.getContext("2d");
    if (chartCategoria) chartCategoria.destroy();
    if (ctx1) {
      if (Object.keys(dados.gastosPorCategoria).length === 0) {
        ctx1.canvas.parentNode.innerHTML = "<p>Nenhum gasto registrado.</p>";
      } else {
        const categorias = Object.keys(dados.gastosPorCategoria);
        const valores = Object.values(dados.gastosPorCategoria);
        chartCategoria = new Chart(ctx1, {
          type: "bar",
          data: {
            labels: categorias,
            datasets: [
              {
                label: "Gastos por Categoria (R$)",
                data: valores,
                backgroundColor: "#F44336",
                borderColor: "#D32F2F",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Gastos por Categoria" },
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (v) => `R$${v}` } },
              x: { ticks: { autoSkip: false } },
            },
          },
        });
      }
    }

    // --- Gráfico: Receitas Mensais (Barras) ---
    const ctx2 = document
      .getElementById("grafico-receitas-mensal")
      ?.getContext("2d");
    if (chartEvolucao) chartEvolucao.destroy();
    if (ctx2) {
      const meses = Object.keys(dados.evolucao).sort();
      const receitas = meses.map((m) => dados.evolucao[m].receitas);

      if (meses.length === 0 || receitas.every((v) => v === 0)) {
        ctx2.canvas.parentNode.innerHTML = "<p>Nenhuma receita registrada.</p>";
      } else {
        chartEvolucao = new Chart(ctx2, {
          type: "bar",
          data: {
            labels: meses.map((m) => {
              const [ano, mes] = m.split("-");
              const nomesMeses = [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
              ];
              return `${nomesMeses[parseInt(mes) - 1]}/${ano}`;
            }),
            datasets: [
              {
                label: "Receitas Mensais (R$)",
                data: receitas,
                backgroundColor: "#4CAF50",
                borderColor: "#388E3C",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Receitas por Mês" },
            },
            scales: {
              y: { beginAtZero: true, ticks: { callback: (v) => `R$${v}` } },
              x: { ticks: { autoSkip: false } },
            },
          },
        });
      }
    }

    // --- Gráfico Comparativo (Receitas vs Despesas) - mantido ---
    const ctx3 = document
      .getElementById("grafico-comparativo")
      ?.getContext("2d");
    if (chartComparativo) chartComparativo.destroy();
    if (ctx3) {
      chartComparativo = new Chart(ctx3, {
        type: "bar",
        data: {
          labels: ["Receitas", "Despesas"],
          datasets: [
            {
              label: "Valores (R$)",
              data: [dados.receitas, dados.despesas],
              backgroundColor: ["#4CAF50", "#F44336"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: "Receitas vs Despesas" },
          },
          scales: {
            y: { beginAtZero: true, ticks: { callback: (v) => `R$${v}` } },
          },
        },
      });
    }
  }
  // === Funcionalidades existentes ===

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
          container.style.display = "block";
        } else {
          container.style.display = "none";
        }
      });
    });
  }

  // Toggle de Adicionar/Retirar
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".toggle-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      document.getElementById("opcao").value = this.dataset.value;
    });
  });

  // Abrir formulário
  if (openBtn && form) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      form.classList.remove("hidden");
    });
  }

  // Fechar formulário + salvar
  if (closeBtn && form) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const tipo = document.getElementById("opcao")?.value || "add";
      const categoria = document.getElementById("categoria")?.value;
      const data = document.getElementById("data")?.value;
      const valorRaw = document.getElementById("valor")?.value;
      const descricao = document.getElementById("descricao")?.value;

      if (!categoria || !data || !valorRaw) {
        alert("Preencha todos os campos.");
        return;
      }

      // Limpa e converte valor
      const valorLimpo = valorRaw
        .replace(/\D/g, "")
        .replace(/^(\d+)(\d{2})$/, "$1.$2");
      const valor = parseFloat(valorLimpo) || 0;

      if (valor <= 0) {
        alert("Valor deve ser maior que zero.");
        return;
      }

      // Cria novo lançamento
      const novo = {
        id: Date.now(),
        tipo,
        categoria,
        valor,
        data,
        descricao,
      };

      lancamentos.push(novo);
      localStorage.setItem("lancamentos", JSON.stringify(lancamentos));

      // Fecha e reseta
      form.classList.add("hidden");
      form.querySelector("form")?.reset();

      // Reseta toggle
      document
        .querySelectorAll(".toggle-btn")
        .forEach((btn) => btn.classList.remove("active"));
      const addToggle = document.querySelector('.toggle-btn[data-value="add"]');
      if (addToggle) addToggle.classList.add("active");
      if (document.getElementById("opcao"))
        document.getElementById("opcao").value = "add";

      // Atualiza gráficos
      atualizarGraficos();
    });
  }

  // Mudança de tema

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });
  }

  // Inicializa gráficos na primeira carga
  atualizarGraficos();
});
