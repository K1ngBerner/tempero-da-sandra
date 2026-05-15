const WHATSAPP_NUMBER = "5521975587123";

const dishes = [
  {
    order: 1,
    name: "Feijoada",
    image: "feijoada.webp",
    fallbackImage: "Feijoada.jpg",
    priceM: 25,
    priceG: 35,
  },
  {
    order: 2,
    name: "Dobradinha",
    image: "dobradinha.jpg",
    fallbackImage: "Dobradinha.jpg",
    priceM: 20,
    priceG: 30,
  },
  {
    order: 3,
    name: "Mocotó",
    image: "mocoto.png",
    fallbackImage: "Mocotó.webp",
    priceM: 15,
    priceG: 25,
    rice: true,
  },
  {
    order: 4,
    name: "Baião de Dois",
    image: "baiao.webp",
    fallbackImage: "baião de 2.jpg",
    priceM: 20,
    priceG: 30,
  },
];

const genericMessage = "Olá Sandra, vim fazer o pedido da semana. Gostaria de ver o cardápio.";
const consultMessage = "Olá Sandra, vim consultar o prato do próximo sábado.";

function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getNextSaturday(fromDate = new Date()) {
  const date = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const day = date.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  return date;
}

function getSaturdayNumber(date) {
  let count = 0;

  for (let day = 1; day <= date.getDate(); day += 1) {
    const current = new Date(date.getFullYear(), date.getMonth(), day);

    if (current.getDay() === 6) {
      count += 1;
    }
  }

  return count;
}

function formatDate(date) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatDayMonth(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function createDishImage(dish) {
  const media = document.createElement("div");
  media.className = "dish-media";

  const fallback = document.createElement("div");
  fallback.className = "image-fallback";
  fallback.setAttribute("aria-label", `Imagem indisponível de ${dish.name}`);
  fallback.hidden = true;

  const img = document.createElement("img");
  img.src = dish.image;
  img.alt = `Prato de ${dish.name}`;

  if (dish.fallbackImage) {
    img.dataset.fallbackSrc = dish.fallbackImage;
  }

  img.addEventListener("error", () => {
    if (img.dataset.fallbackSrc && img.src.indexOf(img.dataset.fallbackSrc) === -1) {
      img.src = img.dataset.fallbackSrc;
      img.removeAttribute("data-fallback-src");
      return;
    }

    img.hidden = true;
    fallback.hidden = false;
  });

  media.append(img, fallback);
  return media;
}

function createDateStack(nextSaturday, saturdayNumber) {
  const stack = document.createElement("div");
  stack.className = "date-stack";
  stack.innerHTML = `
    <span>Próximo sábado</span>
    <strong>${formatDayMonth(nextSaturday)}</strong>
    <span>${formatDate(nextSaturday)} · ${saturdayNumber}º sábado do mês</span>
  `;
  return stack;
}

function createPriceRow(dish) {
  const row = document.createElement("div");
  row.className = "price-row";
  row.innerHTML = `
    <div class="price-box">
      <span>M · Porção média</span>
      <strong>${formatMoney(dish.priceM)}</strong>
      <small>Serve 1 pessoa</small>
    </div>
    <div class="price-box">
      <span>G · Porção grande</span>
      <strong>${formatMoney(dish.priceG)}</strong>
      <small>Serve até 2 pessoas</small>
    </div>
  `;
  return row;
}

function createOrderButtons(dish, riceInput = null) {
  const row = document.createElement("div");
  row.className = "order-row";

  ["M", "G"].forEach((size) => {
    const button = document.createElement("a");
    button.className = "button button-terracotta";
    button.href = "#";
    button.target = "_blank";
    button.rel = "noopener";
    button.textContent = `Pedir ${size}`;

    button.addEventListener("click", () => {
      const hasRice = Boolean(riceInput?.checked);
      const riceText = dish.rice && hasRice ? " com adicional de arroz" : "";
      const message = `Olá Sandra, vim fazer o pedido da semana. Gostaria de uma porção ${size} de ${dish.name}${riceText}.`;
      button.href = buildWhatsAppLink(message);
    });

    row.append(button);
  });

  return row;
}

function createRiceOption() {
  const label = document.createElement("label");
  label.className = "rice-option";
  label.innerHTML = `
    <input type="checkbox" aria-label="Adicionar arroz ao pedido de Mocotó">
    <span>Adicionar arroz + R$ 3</span>
  `;
  return label;
}

function renderActiveDish(dish, nextSaturday, saturdayNumber) {
  const container = document.querySelector("#activeDish");
  container.innerHTML = "";
  container.classList.add("reveal");

  if (!dish) {
    const content = document.createElement("div");
    content.className = "dish-content";
    content.append(createDateStack(nextSaturday, saturdayNumber));
    content.insertAdjacentHTML("beforeend", `
      <span class="active-pill">Cardápio especial</span>
      <h3>Cardápio especial em breve</h3>
      <p class="special-message">A Sandra ainda vai confirmar o prato deste sábado. Chame no WhatsApp para consultar.</p>
      <a class="button button-whatsapp" target="_blank" rel="noopener" href="${buildWhatsAppLink(consultMessage)}">Consultar prato da semana</a>
    `);
    container.append(content);
    return;
  }

  const content = document.createElement("div");
  content.className = "dish-content";

  const riceOption = dish.rice ? createRiceOption() : null;
  const riceInput = riceOption?.querySelector("input") ?? null;

  content.append(createDateStack(nextSaturday, saturdayNumber));
  content.insertAdjacentHTML("beforeend", `
    <span class="active-pill">Prato do próximo sábado</span>
    <h3>${dish.name}</h3>
    <p>Quentinha caseira preparada com o carinho de sábado.</p>
  `);
  content.append(createPriceRow(dish));

  if (riceOption) {
    content.append(riceOption);
  }

  content.append(createOrderButtons(dish, riceInput));
  container.append(createDishImage(dish), content);
}

function renderMenu(activeOrder) {
  const grid = document.querySelector("#menuGrid");
  grid.innerHTML = "";

  dishes.forEach((dish) => {
    const card = document.createElement("article");
    card.className = `menu-card reveal${dish.order === activeOrder ? " is-active" : ""}`;

    const body = document.createElement("div");
    body.className = "menu-card-body";
    body.innerHTML = `
      <span class="saturday-label">${dish.order}º sábado do mês</span>
      ${dish.order === activeOrder ? '<span class="active-pill">Prato vigente</span>' : ""}
      <h3>${dish.name}</h3>
    `;

    const riceOption = dish.rice ? createRiceOption() : null;
    const riceInput = riceOption?.querySelector("input") ?? null;

    body.append(createPriceRow(dish));

    if (riceOption) {
      body.append(riceOption);
    }

    body.append(createOrderButtons(dish, riceInput));
    card.append(createDishImage(dish), body);
    grid.append(card);
  });
}

function setupGenericWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp-generic]").forEach((link) => {
    link.href = buildWhatsAppLink(genericMessage);
    link.target = "_blank";
    link.rel = "noopener";
  });
}

function setupStaticImageFallbacks() {
  document.querySelectorAll("img[data-fallback-src]").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackSrc) {
        return;
      }

      img.src = img.dataset.fallbackSrc;
      img.removeAttribute("data-fallback-src");
    });
  });
}

function init() {
  const nextSaturday = getNextSaturday();
  const saturdayNumber = getSaturdayNumber(nextSaturday);
  const activeDish = dishes.find((dish) => dish.order === saturdayNumber);

  setupGenericWhatsAppLinks();
  setupStaticImageFallbacks();
  renderActiveDish(activeDish, nextSaturday, saturdayNumber);
  renderMenu(activeDish?.order);
}

document.addEventListener("DOMContentLoaded", init);
