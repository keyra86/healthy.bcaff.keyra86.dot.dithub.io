// Basic helpers
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

const currency = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Demo products
const PRODUCTS = [
  { id: 'D001', name: 'Chia Pudding Berry', price: 28000, cat: 'dessert', img: 'assets/images/slide1.png', tags: ['chia', 'berry', 'puding'] },
  { id: 'D002', name: 'Greek Yogurt Granola', price: 30000, cat: 'dessert', img: 'assets/images/slide2.png', tags: ['yogurt', 'granola'] },
  { id: 'S001', name: 'Oatmeal Banana Cookies', price: 24000, cat: 'snack', img: 'assets/images/slide3.png', tags: ['oat', 'banana', 'cookies'] },
  { id: 'M001', name: 'Chicken Quinoa Bowl', price: 48000, cat: 'makanan', img: 'assets/images/slide1.png', tags: ['quinoa', 'bowl'] },
  { id: 'M002', name: 'Tofu Veggie Wrap', price: 42000, cat: 'makanan', img: 'assets/images/slide2.png', tags: ['wrap', 'vegan'] },
  { id: 'B001', name: 'Matcha Oat Latte', price: 26000, cat: 'minuman', img: 'assets/images/slide3.png', tags: ['matcha', 'oat', 'latte'] },
  { id: 'B002', name: 'Cold-Pressed Orange', price: 22000, cat: 'minuman', img: 'assets/images/slide1.png', tags: ['jus', 'orange'] },
];

// State
let CART = JSON.parse(localStorage.getItem('healthybcaff_cart') || '[]');

function saveCart() {
  localStorage.setItem('healthybcaff_cart', JSON.stringify(CART));
}

function cartCount() {
  return CART.reduce((s, i) => s + i.qty, 0);
}

function cartTotal() {
  return CART.reduce((s, i) => s + i.qty * i.price, 0);
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function renderProducts() {
  const grid = $('#product-grid');
  const search = $('#search').value.trim().toLowerCase();
  const cat = $('#category').value;

  const filtered = PRODUCTS.filter(p => {
    const hay = (p.name + ' ' + p.tags.join(' ') + ' ' + p.cat).toLowerCase();
    const okCat = cat === 'all' || p.cat === cat;
    return okCat && hay.includes(search);
  });

  grid.innerHTML = filtered.map(p => `
    <div class="card reveal">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <strong>${p.name}</strong>
        <span class="price">${currency(p.price)}</span>
        <div class="add-row">
          <div class="qty">
            <button class="dec" aria-label="Kurangi">-</button>
            <span>1</span>
            <button class="inc" aria-label="Tambah">+</button>
          </div>
          <button class="btn primary add">Tambah</button>
        </div>
      </div>
    </div>
  `).join('');

  // bind qty + add
  $$('.card').forEach((card, idx) => {
    let qty = 1;
    const p = filtered[idx];
    const qEl = $('.qty span', card);
    $('.dec', card).addEventListener('click', () => { qty = Math.max(1, qty - 1); qEl.textContent = qty; });
    $('.inc', card).addEventListener('click', () => { qty += 1; qEl.textContent = qty; });
    $('.add', card).addEventListener('click', () => {
      const found = CART.find(i => i.id === p.id);
      if (found) found.qty += qty;
      else CART.push({ ...p, qty });
      saveCart();
      updateCartBadge();
      showToast('Ditambahkan ke keranjang');
    });
  });

  reveal();
}

function updateCartBadge() {
  $('#cart-count').textContent = cartCount();
  $('#cart-total').textContent = currency(cartTotal());
}

function openCart(open = true) {
  $('#cart-drawer').classList.toggle('open', open);
  renderCart();
}

function renderCart() {
  const wrap = $('#cart-items');
  if (!CART.length) {
    wrap.innerHTML = `<p>Keranjang kosong.</p>`;
    updateCartBadge();
    return;
  }
  wrap.innerHTML = CART.map((i, idx) => `
    <div class="cart-item">
      <img src="${i.img}" alt="${i.name}">
      <div>
        <div><strong>${i.name}</strong></div>
        <div class="muted">${currency(i.price)} • x${i.qty}</div>
      </div>
      <div style="display:grid; gap:6px;">
        <button class="btn outline small dec" data-i="${idx}">-</button>
        <button class="btn outline small inc" data-i="${idx}">+</button>
        <button class="btn ghost small del" data-i="${idx}">Hapus</button>
      </div>
    </div>
  `).join('');
  updateCartBadge();

  $$('.cart-item .dec').forEach(b => b.addEventListener('click', e => {
    const i = +e.currentTarget.dataset.i; CART[i].qty = Math.max(1, CART[i].qty - 1); saveCart(); renderCart();
  }));
  $$('.cart-item .inc').forEach(b => b.addEventListener('click', e => {
    const i = +e.currentTarget.dataset.i; CART[i].qty += 1; saveCart(); renderCart();
  }));
  $$('.cart-item .del').forEach(b => b.addEventListener('click', e => {
    const i = +e.currentTarget.dataset.i; CART.splice(i,1); saveCart(); renderCart();
  }));
}

function reveal() {
  const els = $$('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add('in');
    });
  }, { threshold: .12 });
  els.forEach(el => io.observe(el));
}

function sliderInit() {
  const slides = $$('.slide');
  let i = 0;
  const show = (n) => {
    slides.forEach(s => s.classList.remove('is-active'));
    slides[n].classList.add('is-active');
    i = n;
  };
  $('#prev-slide').addEventListener('click', () => show((i - 1 + slides.length) % slides.length));
  $('#next-slide').addEventListener('click', () => show((i + 1) % slides.length));
  setInterval(() => show((i + 1) % slides.length), 4800);
}

function bindUI() {
  $('#open-cart').addEventListener('click', () => openCart(true));
  $('#close-cart').addEventListener('click', () => openCart(false));
  $('#clear-cart').addEventListener('click', () => { CART = []; saveCart(); renderCart(); showToast('Keranjang dibersihkan'); });
  $('#go-checkout').addEventListener('click', () => {
    openCart(false);
    document.getElementById('cust-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Isi formulir untuk checkout');
  });

  $('#search').addEventListener('input', renderProducts);
  $('#category').addEventListener('change', renderProducts);

  // Checkout form (simulated)
  $('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!CART.length) { showToast('Keranjang masih kosong'); return; }
    const data = {
      name: $('#cust-name').value.trim(),
      phone: $('#cust-phone').value.trim(),
      address: $('#cust-address').value.trim(),
      items: CART.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      total: cartTotal(),
      ts: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'order-healthy-bcaff.json';
    a.click();
    URL.revokeObjectURL(url);

    showToast('Order tersimpan. Terima kasih!');
    // (opsional) reset cart
    CART = []; saveCart(); renderCart(); updateCartBadge();
  });

  // BGM toggle
  const audio = document.getElementById('bgm');
  const toggle = document.getElementById('toggle-audio');
  let isOn = false;
  toggle.addEventListener('click', () => {
    if (!isOn) { audio.volume = 0.25; audio.play(); toggle.textContent = '♫⏸'; }
    else { audio.pause(); toggle.textContent = '♫'; }
    isOn = !isOn;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  sliderInit();
  bindUI();
  updateCartBadge();
});
