/* FUDGO — comportamiento global del sitio */
(() => {
  'use strict';

  const storage = {
    get(key, fallback) {
      try { return localStorage.getItem(key) ?? fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* almacenamiento no disponible */ }
    }
  };

  const state = {
    lang: storage.get('fudgo-lang', 'es') === 'en' ? 'en' : 'es',
    dict: {}
  };

  const translate = (key) => {
    const entry = state.dict[key];
    return entry && typeof entry[state.lang] === 'string' ? entry[state.lang] : '';
  };

  function renderLegalContent() {
    const terms = document.getElementById('terms-content');
    const privacy = document.getElementById('privacy-content');

    if (terms) {
      terms.replaceChildren();
      for (let i = 1; i <= 11; i += 1) {
        const key = `terms.s${i}`;
        const title = translate(`${key}.title`);
        if (!title) continue;

        const section = document.createElement('section');
        const heading = document.createElement('h2');
        heading.textContent = title;
        section.append(heading);

        const parts = [
          translate(`${key}.prefix`),
          (i === 1 || i === 2) ? 'FUDGO' : '',
          translate(`${key}.p`),
          translate(`${key}.suffix`)
        ].filter(Boolean);
        if (parts.length) {
          const paragraph = document.createElement('p');
          paragraph.textContent = parts.join(' ');
          section.append(paragraph);
        }

        const list = document.createElement('ul');
        for (let j = 1; j <= 5; j += 1) {
          const itemText = translate(`${key}.li${j}`);
          if (!itemText) continue;
          const item = document.createElement('li');
          item.textContent = itemText;
          list.append(item);
        }
        if (list.children.length) section.append(list);

        if (i === 11) {
          const contact = document.createElement('p');
          contact.textContent = 'soporte@fudgo.com · San Pedro Sula, Honduras';
          section.append(contact);
        }
        terms.append(section);
      }
    }

    if (privacy) {
      privacy.replaceChildren();
      for (let i = 1; i <= 10; i += 1) {
        const key = `privacy.s${i}`;
        const title = translate(`${key}.title`);
        if (!title) continue;

        const section = document.createElement('section');
        const heading = document.createElement('h2');
        heading.textContent = title;
        section.append(heading);

        const paragraphText = translate(`${key}.p`);
        if (paragraphText) {
          const paragraph = document.createElement('p');
          paragraph.textContent = paragraphText;
          section.append(paragraph);
        }

        const list = document.createElement('ul');
        for (let j = 1; j <= 6; j += 1) {
          const itemText = translate(`${key}.li${j}`);
          if (!itemText) continue;
          const item = document.createElement('li');
          item.textContent = itemText;
          list.append(item);
        }
        if (list.children.length) section.append(list);
        privacy.append(section);
      }
    }
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = translate(element.dataset.i18n);
      if (value) element.textContent = value;
    });

    const languageButton = document.querySelector('.lang-toggle');
    if (languageButton) {
      languageButton.textContent = state.lang === 'es' ? 'EN' : 'ES';
      languageButton.setAttribute(
        'aria-label',
        state.lang === 'es' ? 'Switch to English' : 'Cambiar a español'
      );
    }
    renderLegalContent();
  }

  async function loadTranslations() {
    try {
      const response = await fetch('translations.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dictionary = await response.json();
      if (!dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)) {
        throw new Error('Formato de traducciones no válido');
      }
      state.dict = dictionary;
    } catch (error) {
      console.warn('Fudgo: no se pudieron cargar las traducciones.', error);
    }
    applyLanguage();
  }

  // Idioma
  document.querySelector('.lang-toggle')?.addEventListener('click', () => {
    state.lang = state.lang === 'es' ? 'en' : 'es';
    storage.set('fudgo-lang', state.lang);
    applyLanguage();
  });

  // Navegación adaptable (compatible con las dos estructuras de encabezado existentes)
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-header .nav');

  function closeMenu() {
    navigation?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  }

  menuButton?.addEventListener('click', () => {
    const isOpen = navigation?.classList.toggle('open') ?? false;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Encabezado: vidrio al desplazarse
  const header = document.querySelector('.site-header');
  let scrollTicking = false;
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateHeader);
      scrollTicking = true;
    }
  }, { passive: true });
  updateHeader();

  // Tema claro / oscuro
  const themeButton = document.querySelector('.theme-toggle');
  const savedTheme = storage.get('fudgo-theme', 'dark');
  let activeTheme = savedTheme === 'light' ? 'light' : 'dark';

  function applyTheme(theme) {
    activeTheme = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('light', activeTheme === 'light');
    if (themeButton) {
      const isLight = activeTheme === 'light';
      themeButton.setAttribute('aria-checked', String(isLight));
      themeButton.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
      themeButton.setAttribute('title', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    }
    storage.set('fudgo-theme', activeTheme);
  }

  applyTheme(activeTheme);
  themeButton?.addEventListener('click', () => {
    applyTheme(activeTheme === 'light' ? 'dark' : 'light');
  });

  // Selección de plan desde las tarjetas de precios
  document.querySelectorAll('[data-plan]').forEach((element) => {
    element.addEventListener('click', () => {
      const planField = document.getElementById('plan');
      if (planField) {
        planField.value = element.dataset.plan || '';
        planField.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  // Campo de ciudad personalizada
  const cityField = document.getElementById('city');
  const customCityWrap = document.getElementById('custom-city-wrap');
  const customCityField = customCityWrap?.querySelector('input');

  function updateCustomCity() {
    const showCustomCity = cityField?.value === 'Otro';
    customCityWrap?.classList.toggle('hidden', !showCustomCity);
    if (customCityField) {
      customCityField.required = Boolean(showCustomCity);
      if (!showCustomCity) customCityField.value = '';
    }
  }
  cityField?.addEventListener('change', updateCustomCity);
  updateCustomCity();

  // Formulario de afiliación
  const form = document.getElementById('affiliate-form');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const status = document.getElementById('form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton || submitButton.disabled) return;

    const originalButtonText = submitButton.textContent;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.city = data.city === 'Otro' ? (data.customCity || '').trim() : data.city;
    data.phone = `${data.countryCode || '+504'} ${data.phone || ''}`.trim();
    data.termsAccepted = formData.has('termsAcceptedCheckbox') ? 'Sí' : 'No';
    delete data.countryCode;
    delete data.customCity;
    delete data.termsAcceptedCheckbox;

    // Campo trampa para reducir envíos automatizados; no sustituye protección antispam del servidor.
    if (data.website) return;
    delete data.website;

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = state.lang === 'es' ? 'Enviando…' : 'Sending…';
    if (status) status.textContent = '';

    try {
      const response = await fetch('https://formsubmit.co/ajax/contact@fudgo.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ...data,
          _subject: 'Nueva solicitud de afiliación Fudgo',
          _template: 'table',
          _captcha: 'false'
        })
      });

      let result = {};
      try { result = await response.json(); } catch { /* respuesta no JSON */ }
      if (!response.ok || result.success === false || result.success === 'false') {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      window.location.assign('gracias.html');
    } catch (error) {
      console.error('Fudgo: error al enviar el formulario.', error);
      if (status) {
        status.textContent = state.lang === 'es'
          ? 'No se pudo enviar la solicitud. Intenta nuevamente o escríbenos a info@fudgo.com.'
          : 'Your request could not be sent. Please try again or email info@fudgo.com.';
        status.setAttribute('role', 'alert');
      }
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = translate('aff.form.submit') || originalButtonText || 'AFÍLIATE';
    }
  });

  loadTranslations();




  /* =========================================================
   GALERÍA FUDGO - CARRUSEL AUTOMÁTICO
========================================================= */

  (function () {

    const gallery = document.querySelector('.phone-gallery');

    if (!gallery) return;

    const slides = Array.from(
      gallery.querySelectorAll('.phone-slide')
    );

    const indicators = gallery.querySelector('.phone-gallery-indicators');
    const previousButton = gallery.querySelector('.phone-prev');
    const nextButton = gallery.querySelector('.phone-next');

    if (
      slides.length < 2 ||
      !indicators ||
      !previousButton ||
      !nextButton
    ) {
      console.error('Fudgo: no se encontraron todos los elementos de la galería.');
      return;
    }

    let currentSlide = 0;
    let autoplayInterval = null;

    const autoplayDelay = 3500;

    /* Crear indicadores de navegación */

    indicators.innerHTML = '';

    slides.forEach((slide, index) => {

      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = 'phone-gallery-dot';

      dot.setAttribute(
        'aria-label',
        `Mostrar captura ${index + 1}`
      );

      dot.addEventListener('click', () => {
        showSlide(index);
        restartAutoplay();
      });

      indicators.appendChild(dot);

    });

    const dots = Array.from(
      indicators.querySelectorAll('.phone-gallery-dot')
    );

    /* Cambiar imagen */

    function showSlide(index) {

      const previousIndex = currentSlide;

      currentSlide = (index + slides.length) % slides.length;

      if (currentSlide === previousIndex) return;

      slides.forEach((slide, i) => {

        slide.classList.remove('active', 'previous');

        /* Eliminar cualquier posición asignada desde JavaScript */
        slide.style.removeProperty('transform');

        if (i === currentSlide) {

          slide.classList.add('active');

        } else if (i === previousIndex) {

          slide.classList.add('previous');

        }

      });

      /* Actualizar indicadores */

      dots.forEach((dot, i) => {

        const active = i === currentSlide;

        dot.classList.toggle('active', active);

        dot.setAttribute(
          'aria-current',
          active ? 'true' : 'false'
        );

      });

    }

    /* Navegación */

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function previousSlide() {
      showSlide(currentSlide - 1);
    }

    nextButton.addEventListener('click', () => {

      nextSlide();
      restartAutoplay();

    });

    previousButton.addEventListener('click', () => {

      previousSlide();
      restartAutoplay();

    });

    /* Reproducción automática */

    function startAutoplay() {

      if (autoplayInterval !== null || document.hidden) return;

      autoplayInterval = setInterval(() => {

        nextSlide();

      }, autoplayDelay);

    }

    function stopAutoplay() {

      if (autoplayInterval !== null) {

        clearInterval(autoplayInterval);
        autoplayInterval = null;

      }

    }

    function restartAutoplay() {

      stopAutoplay();
      startAutoplay();

    }

    /* Control de visibilidad de la página */

    document.addEventListener('visibilitychange', () => {

      if (document.hidden) {

        stopAutoplay();

      } else {

        startAutoplay();

      }

    });

    /* Inicializar galería */

    slides.forEach((slide) => {

      slide.classList.remove('active', 'previous');

      /* Evitar conflictos con estilos en línea */
      slide.style.removeProperty('transform');

    });

    dots.forEach((dot) => {

      dot.classList.remove('active');
      dot.removeAttribute('aria-current');

    });

    currentSlide = 0;

    slides[0].classList.add('active');

    dots[0].classList.add('active');
    dots[0].setAttribute('aria-current', 'true');

    /* Iniciar reproducción */

    startAutoplay();

  })();

})();
