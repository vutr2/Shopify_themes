/* TrngSm theme — interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Menu drawer ---------- */
  const drawer = $('#MenuDrawer');
  const openBtn = $('[data-drawer-open]');
  const openDrawer = () => {
    if (!drawer) return;
    drawer.hidden = false;
    openBtn && openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = $('a, button', drawer.querySelector('.drawer__panel'));
    first && first.focus();
  };
  const closeDrawer = () => {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    openBtn && openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    openBtn && openBtn.focus();
  };
  openBtn && openBtn.addEventListener('click', openDrawer);
  $$('[data-drawer-close]').forEach(el => el.addEventListener('click', closeDrawer));

  /* ---------- Search panel ---------- */
  const searchBtn = $('[data-search-toggle]');
  const searchPanel = $('#SearchPanel');
  searchBtn && searchBtn.addEventListener('click', () => {
    const open = searchPanel.hidden;
    searchPanel.hidden = !open;
    searchBtn.setAttribute('aria-expanded', String(open));
    if (open) $('input[type=search]', searchPanel).focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeDrawer();
    if (searchPanel && !searchPanel.hidden) { searchPanel.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); searchBtn.focus(); }
    hideToast();
  });

  /* ---------- Collection sort ---------- */
  $$('[data-sort]').forEach(sel => sel.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', sel.value);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  }));

  /* ---------- Cart page: reveal update button when qty changes ---------- */
  $$('[data-line-qty]').forEach(input => input.addEventListener('change', () => {
    const btn = $('[data-update-btn]');
    if (btn) btn.hidden = false;
  }));

  /* ---------- Toast + cart count ---------- */
  const toast = $('#CartToast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    $('[data-toast-msg]', toast).textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }
  function hideToast() { if (toast) toast.hidden = true; }
  $$('[data-toast-close]').forEach(b => b.addEventListener('click', hideToast));

  async function refreshCartCount() {
    try {
      const res = await fetch(window.routes.cart_url + '.js', { headers: { Accept: 'application/json' } });
      const cart = await res.json();
      $$('[data-cart-count]').forEach(el => { el.textContent = cart.item_count; el.hidden = cart.item_count === 0; });
      $$('[data-cart-link]').forEach(el => el.setAttribute('aria-label', `Cart, ${cart.item_count} items`));
    } catch (e) { /* count refreshes on next page load */ }
  }

  /* ---------- Product page ---------- */
  $$('[data-product-section]').forEach(section => {
    const jsonEl = $('[data-product-json]', section);
    const form = $('.product-form', section);
    if (!jsonEl || !form) return;

    const variants = JSON.parse(jsonEl.textContent);
    const idInput = $('[data-variant-id]', form);
    const addBtn = $('[data-add-btn]', form);
    const errEl = $('[data-form-error]', form);
    const priceNow = $('[data-price-now]', section);
    const priceWas = $('[data-price-was]', section);
    const pricePct = $('[data-price-pct]', section);
    const fieldsets = $$('.opt', section);

    const selected = () => fieldsets.map(fs => {
      const checked = $('input:checked', fs);
      return checked ? checked.value : null;
    });

    const markAvailability = () => {
      // Grey out option values that have no available variant given the other current selections.
      const current = selected();
      fieldsets.forEach((fs, i) => {
        $$('input[type=radio]', fs).forEach(input => {
          const combo = current.slice();
          combo[i] = input.value;
          const match = variants.find(v => v.options.every((o, j) => o === combo[j]));
          const label = input.nextElementSibling;
          label && label.classList.toggle('is-unavailable', !match || !match.available);
        });
      });
    };

    const update = () => {
      const opts = selected();
      fieldsets.forEach((fs, i) => { const l = $('[data-opt-label]', fs); if (l) l.textContent = opts[i]; });
      const v = variants.find(x => x.options.every((o, i) => o === opts[i]));
      markAvailability();

      if (!v) {
        addBtn.disabled = true;
        addBtn.textContent = 'Unavailable';
        return;
      }
      idInput.value = v.id;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? 'Add to cart' : 'Sold out';
      priceNow.textContent = v.price;
      if (v.compare) { priceWas.textContent = v.compare; priceWas.hidden = false; } else { priceWas.hidden = true; }
      if (v.pct > 0) { pricePct.textContent = `-${v.pct}%`; pricePct.hidden = false; } else { pricePct.hidden = true; }

      const url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url.toString());

      if (v.media) {
        const m = $(`[data-media-id="${v.media}"]`, section);
        if (m) {
          const gallery = $('[data-gallery]', section);
          if (gallery.scrollWidth > gallery.clientWidth + 4) {
            gallery.scrollTo({ left: m.offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
          }
        }
      }
    };

    fieldsets.forEach(fs => fs.addEventListener('change', update));
    if (fieldsets.length) markAvailability();

    // Quantity stepper
    const qty = $('input[name=quantity]', form);
    $$('[data-qty]', form).forEach(btn => btn.addEventListener('click', () => {
      const next = Math.max(1, (parseInt(qty.value, 10) || 1) + parseInt(btn.dataset.qty, 10));
      qty.value = next;
    }));

    // AJAX add to cart (the dynamic checkout button keeps its own behaviour)
    form.addEventListener('submit', async e => {
      e.preventDefault();
      errEl.hidden = true;
      addBtn.disabled = true;
      const label = addBtn.textContent;
      addBtn.textContent = 'Adding…';
      try {
        const res = await fetch(window.routes.cart_add_url + '.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.description || 'Could not add this item. Try again.');
        await refreshCartCount();
        showToast(`${data.product_title} added to cart`);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.hidden = false;
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = label;
      }
    });
  });
})();
