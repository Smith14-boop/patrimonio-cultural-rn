const DURACAO = 8000; // tempo de cada item, em milissegundos

const grade = document.getElementById("grade");
const player = document.getElementById("player");
const slidesEl = document.getElementById("slides");
const pontosEl = document.getElementById("pontos");
const barra = document.getElementById("barra");
const contador = document.getElementById("contador");
const btnPlay = document.getElementById("play");
const btnTelaCheia = document.getElementById("tela-cheia");

const total = patrimonios.length;
let atual = 0;
let pausado = false;
let timeout = null;
let restante = DURACAO;
let inicio = 0;

// ---------- TELA CHEIA ----------
// No iPhone, o Safari não permite tela cheia em páginas comuns; nesse caso o botão some.
const telaCheiaPermitida = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

function entrarTelaCheia(el) {
  const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
  if (pedir) {
    const r = pedir.call(el);
    if (r && r.catch) r.catch(() => {});
  }
}

function sairTelaCheia() {
  const sair = document.exitFullscreen || document.webkitExitFullscreen;
  if (sair) {
    const r = sair.call(document);
    if (r && r.catch) r.catch(() => {});
  }
}

function estaEmTelaCheia() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

if (!telaCheiaPermitida) {
  btnTelaCheia.style.display = "none";
}

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

// ---------- ITENS DA APRESENTAÇÃO ----------
const itens = [];
const bolinhas = [];

patrimonios.forEach((p, i) => {
  const item = document.createElement("article");
  item.className = "item";
  item.innerHTML = `
    <div class="item-foto"><img src="${p.imagem}" alt="${p.nome}"></div>
    <div class="legenda">
      <span class="categoria">${p.categoria}</span>
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
    </div>`;
  slidesEl.appendChild(item);
  itens.push(item);

  const bolinha = document.createElement("button");
  bolinha.className = "ponto";
  bolinha.setAttribute("aria-label", `Ir para ${p.nome}`);
  bolinha.addEventListener("click", () => mostrar(i));
  pontosEl.appendChild(bolinha);
  bolinhas.push(bolinha);
});

// ---------- CONTROLE DA APRESENTAÇÃO ----------
function reiniciarBarra() {
  barra.classList.remove("animar");
  void barra.offsetWidth; // força o navegador a reiniciar a animação
  barra.style.animationDuration = `${DURACAO}ms`;
  barra.classList.add("animar");
}

function agendar() {
  clearTimeout(timeout);
  inicio = Date.now();
  barra.style.animationPlayState = "running";
  timeout = setTimeout(() => mostrar(atual + 1), restante);
}

function mostrar(n) {
  itens[atual].classList.remove("ativo");
  bolinhas[atual].classList.remove("ativo");

  atual = (n + total) % total;

  itens[atual].classList.add("ativo");
  bolinhas[atual].classList.add("ativo");
  itens[atual].querySelector(".legenda").scrollTop = 0;
  contador.textContent = `${atual + 1} / ${total}`;

  restante = DURACAO;
  reiniciarBarra();

  if (pausado) {
    clearTimeout(timeout);
    barra.style.animationPlayState = "paused";
  } else {
    agendar();
  }
}

function atualizarBotaoPlay() {
  btnPlay.innerHTML = pausado ? "&#9654;" : "&#10074;&#10074;";
  btnPlay.setAttribute("aria-label", pausado ? "Continuar" : "Pausar");
}

function alternarPlay() {
  pausado = !pausado;
  if (pausado) {
    clearTimeout(timeout);
    restante = Math.max(0, restante - (Date.now() - inicio));
    barra.style.animationPlayState = "paused";
  } else {
    barra.style.animationPlayState = "running";
    agendar();
  }
  atualizarBotaoPlay();
}

function abrirPlayer() {
  player.classList.add("aberto");
  player.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  pausado = false;
  atualizarBotaoPlay();
  mostrar(0);
}

function fecharPlayer() {
  clearTimeout(timeout);
  player.classList.remove("aberto");
  player.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (estaEmTelaCheia()) sairTelaCheia();
}

// ---------- EVENTOS ----------
document.getElementById("abrir-apresentacao").addEventListener("click", (e) => {
  e.preventDefault();
  abrirPlayer();
});

document.getElementById("iniciar").addEventListener("click", abrirPlayer);
document.getElementById("fechar").addEventListener("click", fecharPlayer);
document.getElementById("anterior").addEventListener("click", () => mostrar(atual - 1));
document.getElementById("proximo").addEventListener("click", () => mostrar(atual + 1));
btnPlay.addEventListener("click", alternarPlay);

// Tocar na foto pausa e continua, como num vídeo
slidesEl.addEventListener("click", (e) => {
  if (e.target.closest(".item-foto")) alternarPlay();
});

btnTelaCheia.addEventListener("click", () => {
  if (estaEmTelaCheia()) sairTelaCheia();
  else entrarTelaCheia(player);
});

// Teclado: setas, espaço e Esc
document.addEventListener("keydown", (e) => {
  if (!player.classList.contains("aberto")) return;
  if (e.key === "Escape") fecharPlayer();
  if (e.key === "ArrowRight") mostrar(atual + 1);
  if (e.key === "ArrowLeft") mostrar(atual - 1);
  if (e.key === " ") {
    e.preventDefault();
    alternarPlay();
  }
});

// Deslizar com o dedo para o lado (celular e tablet)
let inicioX = 0;
let inicioY = 0;

player.addEventListener("touchstart", (e) => {
  inicioX = e.touches[0].clientX;
  inicioY = e.touches[0].clientY;
}, { passive: true });

player.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - inicioX;
  const dy = e.changedTouches[0].clientY - inicioY;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
    mostrar(dx < 0 ? atual + 1 : atual - 1);
  }
}, { passive: true });