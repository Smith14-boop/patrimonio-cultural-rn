const grade = document.getElementById("grade");
const slides = document.getElementById("slides");
const pontos = document.getElementById("pontos");
const botaoPausar = document.getElementById("pausar");

let atual = 0;
let timer;
let pausado = false;

// ---------- GALERIA ----------
patrimonios.forEach((p) => {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="foto">
      <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
    </div>
    <div class="info">
      <span class="categoria">${p.categoria}</span>
      <h3 class="nome">${p.nome}</h3>
      <p>${p.resumo}</p>
    </div>`;
  grade.appendChild(card);
});

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada, i) => {
    if (entrada.isIntersecting) {
      setTimeout(() => entrada.target.classList.add("visivel"), i * 120);
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".card").forEach((card) => observador.observe(card));

// ---------- SLIDE ----------
patrimonios.forEach((p, i) => {
  const item = document.createElement("div");
  item.className = "item" + (i === 0 ? " ativo" : "");
  item.innerHTML = `
    <img src="${p.imagem}" alt="${p.nome}">
    <div class="legenda">
      <span class="categoria">${p.categoria}</span>
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
    </div>`;
  slides.appendChild(item);

  const ponto = document.createElement("button");
  ponto.className = "ponto" + (i === 0 ? " ativo" : "");
  ponto.setAttribute("aria-label", `Ir para ${p.nome}`);
  ponto.addEventListener("click", () => {
    mostrar(i);
    reiniciar();
  });
  pontos.appendChild(ponto);
});

function mostrar(n) {
  const itens = document.querySelectorAll(".item");
  const bolinhas = document.querySelectorAll(".ponto");
  itens[atual].classList.remove("ativo");
  bolinhas[atual].classList.remove("ativo");
  atual = (n + patrimonios.length) % patrimonios.length;
  itens[atual].classList.add("ativo");
  bolinhas[atual].classList.add("ativo");
}

// Troca automática, só quando não está pausado
function reiniciar() {
  clearInterval(timer);
  if (!pausado) {
    timer = setInterval(() => mostrar(atual + 1), 6000);
  }
}

document.getElementById("anterior").addEventListener("click", () => {
  mostrar(atual - 1);
  reiniciar();
});

document.getElementById("proximo").addEventListener("click", () => {
  mostrar(atual + 1);
  reiniciar();
});

// Botão de pausar e continuar
botaoPausar.addEventListener("click", () => {
  pausado = !pausado;
  botaoPausar.innerHTML = pausado ? "&#9654;" : "&#10074;&#10074;";
  botaoPausar.setAttribute("aria-label", pausado ? "Continuar" : "Pausar");
  reiniciar();
});

// Desliza com o dedo no celular
let inicioX = 0;
const areaSlide = document.querySelector(".slide");

areaSlide.addEventListener("touchstart", (e) => {
  inicioX = e.touches[0].clientX;
}, { passive: true });

areaSlide.addEventListener("touchend", (e) => {
  const fim = e.changedTouches[0].clientX;
  if (inicioX - fim > 50) {
    mostrar(atual + 1);
    reiniciar();
  }
  if (fim - inicioX > 50) {
    mostrar(atual - 1);
    reiniciar();
  }
});

reiniciar();