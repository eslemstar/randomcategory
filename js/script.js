"use strict";

const main = document.querySelector("#main-content");
let categories = [];
let menuItems = [];
let chosenCategoryShortName = null;

// AJAX: JSON dosyasını XMLHttpRequest ile sunucudan alır.
function ajaxGetJson(url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "json";
    request.onload = () => {
      if (request.status >= 200 && request.status < 300 && request.response) {
        resolve(request.response);
      } else {
        reject(new Error(`${url} yüklenemedi (HTTP ${request.status}).`));
      }
    };
    request.onerror = () => reject(new Error(`${url} için ağ hatası.`));
    request.send();
  });
}

function chooseRandomCategory(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Metni HTML içine güvenli biçimde yerleştirir.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function showHome() {
  // Her ana sayfaya dönüşte yeni Specials kategorisi seçilir.
  chosenCategoryShortName = chooseRandomCategory(categories).short_name;
  main.innerHTML = `
    <h1>Lezzetli bir mola</h1>
    <p class="lead">Menüyü keşfet veya Specials kutusuna tıklayarak sürpriz bir kategori aç.</p>
    <div class="tiles">
      <a class="tile" href="#menu" data-view="menu"><span class="emoji">📋</span><strong>Menü</strong><small>Tüm kategorilere göz at</small></a>
      <a class="tile" href="#specials" data-view="specials"><span class="emoji">✨</span><strong>Specials</strong><small>Rastgele kategoriye git</small></a>
      <a class="tile" href="#about" data-view="about"><span class="emoji">📍</span><strong>Hakkında</strong><small>Örnek web sitesi</small></a>
    </div>`;
}

function showCategories() {
  main.innerHTML = `<a class="back" href="#home" data-view="home">← Ana sayfa</a>
    <h1>Menü kategorileri</h1><p class="lead">Bir kategori seç.</p>
    <div class="grid">${categories.map(category => `
      <article class="card">
        <h2>${escapeHtml(category.emoji)} ${escapeHtml(category.name)}</h2>
        <p>${escapeHtml(category.description)}</p>
        <button type="button" data-category="${escapeHtml(category.short_name)}">Ürünleri gör</button>
      </article>`).join("")}</div>`;
}

function loadMenuItems(shortName) {
  const category = categories.find(item => item.short_name === shortName);
  if (!category) return showCategories();
  const items = menuItems.filter(item => item.category === shortName);
  main.innerHTML = `<a class="back" href="#home" data-view="home">← Ana sayfa</a>
    <h1>${escapeHtml(category.emoji)} ${escapeHtml(category.name)}</h1>
    <p class="lead">${escapeHtml(category.description)}</p>
    <div class="grid">${items.map(item => `
      <article class="card"><h2>${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(item.description)}</p><span class="price">${escapeHtml(item.price)}</span></article>`).join("")}</div>`;
}

function showAbout() {
  main.innerHTML = `<a class="back" href="#home" data-view="home">← Ana sayfa</a>
    <h1>Örnek restoran sitesi</h1>
    <p class="lead">Bu şablon JavaScript ve AJAX ile oluşturulmuştur. Menü bilgileri JSON dosyalarından yüklenir.</p>`;
}

// Hem üst menü hem sayfadaki kartlar için tek tıklama dinleyicisi.
document.addEventListener("click", event => {
  const categoryButton = event.target.closest("[data-category]");
  const viewLink = event.target.closest("[data-view], #home-link, #nav-home, #nav-menu, #nav-specials");
  if (!categoryButton && !viewLink) return;
  event.preventDefault();
  if (!categories.length) return;
  if (categoryButton) return loadMenuItems(categoryButton.dataset.category);
  const view = viewLink.dataset.view || ({
    "home-link": "home", "nav-home": "home", "nav-menu": "menu", "nav-specials": "specials"
  })[viewLink.id];
  if (view === "home") showHome();
  else if (view === "menu") showCategories();
  else if (view === "specials") loadMenuItems(chosenCategoryShortName);
  else if (view === "about") showAbout();
});

// Sayfa açılırken iki JSON dosyasını AJAX ile getir.
Promise.all([
  ajaxGetJson("data/categories.json"),
  ajaxGetJson("data/menu_items.json")
]).then(([loadedCategories, loadedItems]) => {
  if (!Array.isArray(loadedCategories) || !loadedCategories.length || !Array.isArray(loadedItems)) {
    throw new Error("Menü verileri beklenen biçimde değil.");
  }
  categories = loadedCategories;
  menuItems = loadedItems;
  showHome();
}).catch(error => {
  main.innerHTML = `<p class="error">Veriler yüklenemedi. Siteyi yerel sunucuyla aç (README.txt dosyasına bak).</p>`;
  console.error(error);
});
