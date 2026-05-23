type Dije = { url: string; name: string };
type CategoryBases = Record<string, string[]>;

interface State {
  step: number;
  category: string | null;
  base: string | null;
  charm: Dije | null;
}

function validateCategoryBases(data: unknown): CategoryBases {
  if (typeof data !== 'object' || data === null) return {};
  const result: CategoryBases = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      result[key] = value as string[];
    } else {
      console.warn(`La categoría "${key}" tiene datos inválidos y será omitida.`);
    }
  }
  return result;
}

function validateDijes(data: unknown): Dije[] {
  if (!Array.isArray(data)) return [];
  return (data as unknown[]).filter((dije): dije is Dije => {
    const ok = typeof dije === 'object' && dije !== null && typeof (dije as any).url === 'string' && typeof (dije as any).name === 'string';
    if (!ok) console.warn('Un dije fue omitido por tener datos incompletos:', dije);
    return ok;
  }) as Dije[];
}

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('customizer-container');
  if (!container) return;

  const rawBases = JSON.parse(container.dataset.bases || '{}');
  const rawDijes = JSON.parse(container.dataset.dijes || '[]');

  const categoryBases = validateCategoryBases(rawBases);
  const dijes = validateDijes(rawDijes);

  // Elements (narrow types when possible)
  const progressFill = document.getElementById('progress-fill') as HTMLElement | null;
  const basesCarousel = document.getElementById('bases-carousel') as HTMLElement | null;
  const charmsGrid = document.getElementById('charms-grid') as HTMLElement | null;
  const emptyState = document.getElementById('empty-state') as HTMLElement | null;
  const previewBase = document.getElementById('preview-base') as HTMLImageElement | null;
  const previewCharmContainer = document.getElementById('preview-charm-container') as HTMLElement | null;
  const previewCharm = document.getElementById('preview-charm') as HTMLImageElement | null;
  const finishBtn = document.getElementById('finish-btn') as HTMLButtonElement | null;
  const backTo1 = document.getElementById('back-to-1') as HTMLElement | null;
  const backTo2 = document.getElementById('back-to-2') as HTMLElement | null;
  const resetBtn = document.getElementById('reset-btn') as HTMLElement | null;

  if (!progressFill || !basesCarousel || !charmsGrid || !emptyState || !previewBase || !previewCharmContainer || !previewCharm || !finishBtn || !backTo1 || !backTo2 || !resetBtn) {
    console.warn('Personalizer: elementos requeridos no encontrados, abortando inicialización.');
    return;
  }

  // State
  let state: State = { step: 1, category: null, base: null, charm: null };

  const stepEls = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-result')
  ];

  const stepDots = Array.from(document.querySelectorAll('.step-dot')) as HTMLElement[];

  function goToStep(newStep: number) {
    const currentIdx = state.step <= 3 ? state.step - 1 : 3;
    const currentEl = stepEls[currentIdx];
    if (currentEl) currentEl.classList.remove('is-visible');

    state.step = newStep;
    const fillPercent = newStep <= 1 ? 0 : newStep === 2 ? 50 : 100;
    progressFill.style.width = `${fillPercent}%`;

    stepDots.forEach((dot, i) => {
      const dotCircle = dot.querySelector('.dot-circle');
      const dotSpan = dotCircle?.querySelector('span');
      if (!dotCircle || !dotSpan) return;
      dot.classList.remove('is-active', 'is-done');

      if (i + 1 < state.step) {
        dot.classList.add('is-done');
        dotSpan.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else if (i + 1 === state.step) {
        dot.classList.add('is-active');
        dotSpan.textContent = `${i + 1}`;
      } else {
        dotSpan.textContent = `${i + 1}`;
      }
    });

    const newIdx = newStep <= 3 ? newStep - 1 : 3;
    const newEl = stepEls[newIdx];
    setTimeout(() => { if (newEl) newEl.classList.add('is-visible'); }, 220);
  }

  // render dijes
  charmsGrid.innerHTML = '';
  dijes.forEach((dije, i) => {
    const button = document.createElement('button');
    button.className = 'charm-card';
    button.dataset.index = String(i);
    button.setAttribute('aria-label', `Seleccionar dije ${dije.name}`);
    button.style.animationDelay = `${i * 60}ms`;

    const img = document.createElement('img');
    img.src = dije.url;
    img.alt = dije.name;
    img.loading = 'lazy';

    button.appendChild(img);
    charmsGrid.appendChild(button);
  });

  function resetPreview() {
    previewBase.classList.remove('is-shown');
    previewCharmContainer.classList.remove('is-shown');
    emptyState.classList.remove('is-hidden');
  }

  // category buttons
  Array.from(document.querySelectorAll('.cat-card')).forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = (btn as HTMLElement).dataset.cat;
      if (!cat) return;

      state.category = cat;
      state.base = null;
      state.charm = null;
      resetPreview();

      const bases = categoryBases[cat] || [];
      basesCarousel.innerHTML = bases.map((url, i) => `\n        <button class="base-card" data-url="${url}" style="animation-delay:${i * 70}ms">\n          <img src="${url}" alt="Base ${i + 1}" loading="lazy" />\n          <span class="base-label">Opción ${i + 1}</span>\n          <div class="base-ring"></div>\n        </button>`).join('');

      Array.from(basesCarousel.querySelectorAll('.base-card')).forEach((baseEl) => {
        baseEl.addEventListener('click', () => {
          Array.from(basesCarousel.querySelectorAll('.base-card')).forEach((el) => el.classList.remove('is-selected'));
          baseEl.classList.add('is-selected');

          state.base = (baseEl as HTMLElement).dataset.url || null;

          if (state.base) {
            emptyState.classList.add('is-hidden');
            previewBase.src = state.base;
            previewBase.classList.add('is-shown');
          }

          setTimeout(() => goToStep(3), 500);
        });
      });

      goToStep(2);
    });
  });

  backTo1.addEventListener('click', () => goToStep(1));

  backTo2.addEventListener('click', () => {
    state.charm = null;
    Array.from(charmsGrid.querySelectorAll('.charm-card')).forEach((el) => el.classList.remove('is-selected'));
    previewCharmContainer.classList.remove('is-shown');
    finishBtn.disabled = true;
    goToStep(2);
  });

  Array.from(charmsGrid.querySelectorAll('.charm-card')).forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt((btn as HTMLElement).dataset.index || '0', 10);
      const charm = dijes[index];
      if (!charm) return;

      Array.from(charmsGrid.querySelectorAll('.charm-card')).forEach((el) => el.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      state.charm = charm;
      const posMap: Record<string, string> = {
        collares: 'bottom: 18%; left: 50%; transform: translateX(-50%); width: 56px; height: 56px;',
        pulseras: 'top: 50%; left: 22%; transform: translateY(-50%); width: 44px; height: 44px;',
        anillos: 'top: 32%; left: 50%; transform: translateX(-50%); width: 40px; height: 40px;',
        aretes: 'bottom: 22%; left: 50%; transform: translateX(-50%); width: 48px; height: 48px;'
      };

      previewCharm.style.cssText = posMap[state.category || ''] || posMap.aretes;
      previewCharm.src = charm.url;
      previewCharmContainer.classList.add('is-shown');
      finishBtn.disabled = false;
    });
  });

  finishBtn.addEventListener('click', () => goToStep(4));

  resetBtn.addEventListener('click', () => {
    // Ensure we transition UI first from whatever step we're on back to step 1
    goToStep(1);

    // Then clear state and UI selections
    state = { step: 1, category: null, base: null, charm: null };
    resetPreview();
    Array.from(charmsGrid.querySelectorAll('.charm-card')).forEach((el) => el.classList.remove('is-selected'));
    Array.from(document.querySelectorAll('.base-card')).forEach((el) => el.classList.remove('is-selected'));
    finishBtn.disabled = true;
  });
});

export {};
