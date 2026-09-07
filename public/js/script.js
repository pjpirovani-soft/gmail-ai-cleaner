/**
 * GMAIL AI CLEANER - MATERIAL DESIGN 3 CLIENT CONTROLLER
 * Handles interactive ripples, floating labels, Gemini analysis progress,
 * Material data table, pagination, batch actions, and snackbars.
 */

// Application State
const state = {
  correos: [],
  selectedIds: new Set(),
  currentPage: 1,
  pageSize: 5,
  isAnalyzing: false,
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initRipples();
  initFloatingLabels();
  initUserMenu();
  initCustomInstructions();
  initSearchForm();
  initActionButtons();
  initPagination();
  initSelectionControls();
  initPwaSupport();
  initThemeToggle();
  initWarriorMode();
  checkAuthUrlFeedback();
});

function checkAuthUrlFeedback() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      showSnackbar('¡Sesión iniciada con éxito con Google!', 'success', 4000);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('logout') === 'success') {
      showSnackbar('Has cerrado sesión correctamente.', 'info', 4000);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error') === 'auth_failed') {
      showSnackbar('Error al autenticar con Google.', 'error', 5000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (e) {}
}

/* ==========================================================================
   1. Material Ripple Effect
   ========================================================================== */
function initRipples() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.md-btn, .ripple-surface, .md-chip, .md-pagination-btn');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-circle');

    // Dark ripple on light surfaces
    const isLight = target.classList.contains('md-btn-tonal') ||
                    target.classList.contains('md-chip') ||
                    target.classList.contains('md-pagination-btn') ||
                    target.classList.contains('md-user-button');
    if (isLight) {
      circle.classList.add('dark');
    }

    const existing = target.querySelector('.ripple-circle');
    if (existing) {
      existing.remove();
    }

    target.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
}

/* ==========================================================================
   2. Floating Label Inputs
   ========================================================================== */
function initFloatingLabels() {
  const inputs = document.querySelectorAll('.md-input');
  inputs.forEach(input => {
    const checkValue = () => {
      if (input.value.trim() !== '') {
        input.classList.add('has-value');
      } else {
        input.classList.remove('has-value');
      }
    };
    input.addEventListener('input', checkValue);
    input.addEventListener('change', checkValue);
    checkValue();
  });
}

/* ==========================================================================
   3. Quick Filter Chips
   ========================================================================== */
window.setFilter = function(filterQuery) {
  const queryInput = document.getElementById('queryInput');
  if (!queryInput) return;

  queryInput.value = filterQuery;
  queryInput.classList.add('has-value');
  queryInput.focus();

  // Highlight active chip
  document.querySelectorAll('.md-chip-filter').forEach(chip => {
    if (chip.getAttribute('data-filter') === filterQuery) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  showSnackbar(`Filtro "${filterQuery}" aplicado`, 'info', 2500);
};

/* ==========================================================================
   4. User Menu
   ========================================================================== */
function initUserMenu() {
  const userBtn = document.getElementById('userMenuBtn');
  const userMenu = document.getElementById('userMenu');

  if (!userBtn || !userMenu) return;

  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
      userMenu.classList.remove('open');
    }
  });
}

window.handleLogout = function() {
  window.location.href = '/auth/logout';
};

/* ==========================================================================
   5. Search & Progress Bar Management
   ========================================================================== */
function initSearchForm() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.isAnalyzing) return;

    const query = document.getElementById('queryInput').value.trim();
    const limite = parseInt(document.getElementById('limiteInput').value, 10) || 10;

    if (!query) {
      showSnackbar('Por favor ingresa un filtro de búsqueda', 'warning');
      return;
    }

    startAnalysisProgress(limite);

    try {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('limite', String(limite));

      const instruccionesEl = document.getElementById('instruccionesPersonalizadas');
      const instruccionesPersonalizadas = instruccionesEl ? instruccionesEl.value.trim() : '';
      if (instruccionesPersonalizadas) {
        formData.append('instruccionesPersonalizadas', instruccionesPersonalizadas);
      }

      const response = await fetch('/analizar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.status === 401 && data.redirectTo) {
        showSnackbar('Debes conectar tu cuenta de Google. Redirigiendo...', 'info', 3000);
        window.location.href = data.redirectTo;
        return;
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al analizar correos');
      }

      state.correos = data.correos || [];
      state.selectedIds.clear();
      state.currentPage = 1;

      finishAnalysisProgress();

      if (state.correos.length === 0) {
        showSnackbar(data.mensaje || 'No se encontraron correos para este filtro', 'warning');
        document.getElementById('resultadosContainer').classList.add('hidden');
      } else {
        updateSummaryCards();
        renderTable();
        document.getElementById('resultadosContainer').classList.remove('hidden');
        document.getElementById('totalCorreosText').textContent = `${data.total} correos encontrados`;
        showSnackbar(`✅ Se analizaron ${data.total} correos exitosamente`, 'success');

        // Smooth scroll to results
        document.getElementById('resultadosContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      finishAnalysisProgress();
      showSnackbar(`❌ Error: ${error.message}`, 'error', 5000);
    }
  });
}

let progressInterval = null;

function startAnalysisProgress(totalCount) {
  state.isAnalyzing = true;
  const btn = document.getElementById('analizarBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');

  if (btn) btn.disabled = true;
  if (progressContainer) progressContainer.classList.add('active');

  let currentStep = 1;
  const maxSteps = Math.min(totalCount, 10);
  progressBar.style.width = '10%';
  progressText.textContent = `Analizando correo 1 de ${totalCount}...`;

  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (currentStep < maxSteps) {
      currentStep++;
      const percent = Math.min(Math.round((currentStep / maxSteps) * 90), 90);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `Analizando correo ${currentStep} de ${totalCount} con Gemini...`;
    }
  }, 350);
}

function finishAnalysisProgress() {
  state.isAnalyzing = false;
  clearInterval(progressInterval);

  const btn = document.getElementById('analizarBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  if (progressBar) progressBar.style.width = '100%';
  if (progressText) progressText.textContent = 'Completado';

  setTimeout(() => {
    if (progressContainer) progressContainer.classList.remove('active');
    if (btn) btn.disabled = false;
  }, 400);
}

/* ==========================================================================
   6. Summary Cards Update
   ========================================================================== */
function updateSummaryCards() {
  const countEliminar = state.correos.filter(c => c.clasificacion === 'Eliminar').length;
  const countArchivar = state.correos.filter(c => c.clasificacion === 'Archivar').length;
  const countConservar = state.correos.filter(c => c.clasificacion === 'Conservar').length;

  const elEliminar = document.getElementById('badgeEliminar');
  const elArchivar = document.getElementById('badgeArchivar');
  const elConservar = document.getElementById('badgeConservar');

  if (elEliminar) elEliminar.textContent = String(countEliminar);
  if (elArchivar) elArchivar.textContent = String(countArchivar);
  if (elConservar) elConservar.textContent = String(countConservar);
}

/* ==========================================================================
   7. Material Data Table Rendering & Pagination
   ========================================================================== */
function renderTable() {
  const tbody = document.getElementById('tablaCorreos');
  if (!tbody) return;

  tbody.innerHTML = '';

  const total = state.correos.length;
  const totalPages = Math.ceil(total / state.pageSize) || 1;
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = Math.min(startIndex + state.pageSize, total);
  const currentSlice = state.correos.slice(startIndex, endIndex);

  currentSlice.forEach(correo => {
    const isSelected = state.selectedIds.has(correo.id);
    const tr = document.createElement('tr');
    tr.className = isSelected ? 'selected' : '';
    tr.id = `row-${correo.id}`;

    const badgeClass = {
      'Eliminar': 'chip-eliminar',
      'Archivar': 'chip-archivar',
      'Conservar': 'chip-conservar'
    }[correo.clasificacion] || 'chip-conservar';

    const iconSymbol = {
      'Eliminar': 'delete',
      'Archivar': 'archive',
      'Conservar': 'check_circle'
    }[correo.clasificacion] || 'info';

    tr.innerHTML = `
      <td style="width: 44px; text-align: center;">
        <input type="checkbox" 
               class="md-checkbox correo-checkbox" 
               data-id="${correo.id}" 
               ${isSelected ? 'checked' : ''} 
               aria-label="Seleccionar correo">
      </td>
      <td>
        <div style="font-weight: 500; color: var(--md-on-surface); margin-bottom: 2px;">
          ${escapeHtml(correo.asunto || 'Sin asunto')}
        </div>
        <div style="font-size: 12px; color: var(--md-on-surface-variant);">
          ${escapeHtml(correo.resumen || '')}
        </div>
      </td>
      <td style="white-space: nowrap;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--md-on-surface-variant);">account_circle</span>
          <span style="color: var(--md-on-surface-variant);">${escapeHtml(correo.remitente || 'Desconocido')}</span>
        </div>
      </td>
      <td style="white-space: nowrap;">
        <span style="font-size: 12.5px; font-weight: 500; color: var(--md-on-surface-variant);">
          ${formatBytes(correo.sizeBytes || 45000)}
        </span>
      </td>
      <td style="white-space: nowrap;">
        <span class="md-chip md-chip-status ${badgeClass}">
          <span class="material-symbols-outlined" style="font-size: 16px;">${iconSymbol}</span>
          ${correo.clasificacion}
        </span>
      </td>
      <td style="white-space: nowrap;">
        <select class="md-select action-select" data-id="${correo.id}">
          <option value="Eliminar" ${correo.clasificacion === 'Eliminar' ? 'selected' : ''}>🗑️ Eliminar</option>
          <option value="Archivar" ${correo.clasificacion === 'Archivar' ? 'selected' : ''}>📁 Archivar</option>
          <option value="Conservar" ${correo.clasificacion === 'Conservar' ? 'selected' : ''}>✅ Conservar</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updatePaginationControls(startIndex, endIndex, total);
  updateSelectAllCheckbox();
  updateSelectedCountDisplay();
}

function initSelectionControls() {
  const selectAll = document.getElementById('selectAllCheckbox');
  const tbody = document.getElementById('tablaCorreos');

  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const startIndex = (state.currentPage - 1) * state.pageSize;
      const endIndex = Math.min(startIndex + state.pageSize, state.correos.length);
      const currentSlice = state.correos.slice(startIndex, endIndex);

      currentSlice.forEach(c => {
        if (isChecked) {
          state.selectedIds.add(c.id);
        } else {
          state.selectedIds.delete(c.id);
        }
      });
      renderTable();
    });
  }

  if (tbody) {
    tbody.addEventListener('change', (e) => {
      if (e.target.classList.contains('correo-checkbox')) {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) {
          state.selectedIds.add(id);
        } else {
          state.selectedIds.delete(id);
        }
        const row = document.getElementById(`row-${id}`);
        if (row) {
          row.classList.toggle('selected', e.target.checked);
        }
        updateSelectAllCheckbox();
        updateSelectedCountDisplay();
      }

      if (e.target.classList.contains('action-select')) {
        const id = e.target.getAttribute('data-id');
        const newAction = e.target.value;
        const item = state.correos.find(c => c.id === id);
        if (item) {
          item.clasificacion = newAction;
          updateSummaryCards();
          renderTable();
          showSnackbar(`Acción para "${item.asunto.slice(0, 30)}..." cambiada a ${newAction}`, 'info', 2500);
        }
      }
    });
  }
}

function updateSelectAllCheckbox() {
  const selectAll = document.getElementById('selectAllCheckbox');
  if (!selectAll) return;

  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = Math.min(startIndex + state.pageSize, state.correos.length);
  const currentSlice = state.correos.slice(startIndex, endIndex);

  if (currentSlice.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
    return;
  }

  const selectedCount = currentSlice.filter(c => state.selectedIds.has(c.id)).length;
  if (selectedCount === currentSlice.length) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else if (selectedCount > 0) {
    selectAll.checked = false;
    selectAll.indeterminate = true;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }
}

function updateSelectedCountDisplay() {
  const countSpan = document.getElementById('selectedCountText');
  const count = state.selectedIds.size;
  if (countSpan) {
    countSpan.textContent = count > 0 ? `(${count} seleccionados)` : '';
  }

  // Enable/disable selection buttons
  const btnDel = document.getElementById('btnEliminarSeleccionados');
  const btnArch = document.getElementById('btnArchivarSeleccionados');
  if (btnDel) btnDel.disabled = count === 0;
  if (btnArch) btnArch.disabled = count === 0;
}

/* ==========================================================================
   8. Pagination Handlers
   ========================================================================== */
function initPagination() {
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageSizeSelect = document.getElementById('pageSizeSelect');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(state.correos.length / state.pageSize);
      if (state.currentPage < totalPages) {
        state.currentPage++;
        renderTable();
      }
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      state.pageSize = parseInt(e.target.value, 10) || 5;
      state.currentPage = 1;
      renderTable();
    });
  }
}

function updatePaginationControls(start, end, total) {
  const pageRange = document.getElementById('pageRangeText');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (pageRange) {
    pageRange.textContent = total > 0 ? `${start + 1}–${end} de ${total}` : '0 de 0';
  }

  if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
  const totalPages = Math.ceil(total / state.pageSize) || 1;
  if (nextBtn) nextBtn.disabled = state.currentPage >= totalPages;
}

/* ==========================================================================
   9. Action Buttons Execution
   ========================================================================== */
function initActionButtons() {
  // Eliminar seleccionados
  const btnEliminarSel = document.getElementById('btnEliminarSeleccionados');
  if (btnEliminarSel) {
    btnEliminarSel.addEventListener('click', async () => {
      const selected = Array.from(state.selectedIds);
      if (selected.length === 0) return;

      try {
        const formData = new FormData();
        formData.append('accion', 'Eliminar');
        formData.append('ids', JSON.stringify(selected));

        const res = await fetch('/accion-lote', { method: 'POST', body: formData });
        const data = await res.json();

        // Update local state
        state.correos = state.correos.filter(c => !state.selectedIds.has(c.id));
        state.selectedIds.clear();
        updateSummaryCards();
        renderTable();

        showSnackbar(`✅ ${selected.length} correos eliminados correctamente`, 'success');
      } catch (err) {
        showSnackbar(`❌ Error: ${err.message}`, 'error');
      }
    });
  }

  // Archivar seleccionados
  const btnArchivarSel = document.getElementById('btnArchivarSeleccionados');
  if (btnArchivarSel) {
    btnArchivarSel.addEventListener('click', async () => {
      const selected = Array.from(state.selectedIds);
      if (selected.length === 0) return;

      try {
        const formData = new FormData();
        formData.append('accion', 'Archivar');
        formData.append('ids', JSON.stringify(selected));

        const res = await fetch('/accion-lote', { method: 'POST', body: formData });
        const data = await res.json();

        // Update local items to Archivar
        state.correos.forEach(c => {
          if (state.selectedIds.has(c.id)) {
            c.clasificacion = 'Archivar';
          }
        });
        state.selectedIds.clear();
        updateSummaryCards();
        renderTable();

        showSnackbar(`📁 ${selected.length} correos archivados correctamente`, 'success');
      } catch (err) {
        showSnackbar(`❌ Error: ${err.message}`, 'error');
      }
    });
  }

  // Global mode execution
  window.ejecutarLimpieza = async function(modo) {
    const contenedorResultados = document.getElementById('resultadosLimpieza');
    if (!contenedorResultados) return;

    contenedorResultados.innerHTML = `
      <div class="md-card md-card-elevated-1" style="display: flex; align-items: center; gap: 12px; margin-top: 16px;">
        <div class="md-linear-progress" style="width: 100%;">
          <div class="md-linear-progress-bar indeterminate"></div>
        </div>
      </div>
    `;

    try {
      const formData = new FormData();
      formData.append('modo', modo);

      const res = await fetch('/limpiar', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al ejecutar limpieza');
      }

      let summaryTitle = '📋 Resumen de Ejecución';
      let badgeType = 'success';
      if (modo === 'simulacion') {
        summaryTitle = '🔍 Resultados de la Simulación (Sin cambios en Gmail)';
        showSnackbar('Simulación completada con éxito', 'info');
      } else if (modo === 'automatico') {
        summaryTitle = '🚀 Limpieza Automática Completada';
        showSnackbar('🚀 Limpieza automática ejecutada correctamente', 'success');
      } else {
        summaryTitle = '🔄 Modo Interactivo Finalizado';
        showSnackbar('Modo interactivo procesado con confirmaciones', 'success');
      }

      let html = `
        <div class="md-card md-card-elevated-2" style="margin-top: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--md-outline); padding-bottom: 12px;">
            <h4 style="font-size: 16px; font-weight: 500; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined" style="color: var(--md-primary);">task_alt</span>
              ${summaryTitle}
            </h4>
            <span class="md-app-badge">${data.resultados ? data.resultados.length : 0} items</span>
          </div>
          <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
      `;

      data.resultados.forEach(r => {
        const icon = r.accion.includes('Eliminar') ? 'delete' : 
                     r.accion.includes('Archivar') ? 'archive' : 'check_circle';
        const color = r.accion.includes('Eliminar') ? 'var(--md-error)' :
                      r.accion.includes('Archivar') ? 'var(--md-tertiary-hover)' : 'var(--md-secondary)';

        html += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--md-surface-variant); border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span class="material-symbols-outlined" style="color: ${color}; font-size: 20px;">${icon}</span>
              <span style="font-size: 13px; font-weight: 500; color: var(--md-on-surface);">${escapeHtml(r.asunto || 'Sin asunto')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <span style="font-size: 12px; font-weight: 600; color: ${color};">${r.accion}</span>
              <span style="font-size: 11px; background: var(--md-surface); border: 1px solid var(--md-outline); padding: 2px 6px; border-radius: 4px; color: var(--md-on-surface-variant);">${r.estado}</span>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;

      contenedorResultados.innerHTML = html;
    } catch (err) {
      contenedorResultados.innerHTML = `
        <div class="md-card" style="border-left: 4px solid var(--md-error); margin-top: 16px;">
          <p style="color: var(--md-error); margin: 0;">❌ Error: ${escapeHtml(err.message)}</p>
        </div>
      `;
      showSnackbar(`❌ Error: ${err.message}`, 'error', 5000);
    }
  };
}

/* ==========================================================================
   10. Material Snackbar System
   ========================================================================== */
window.showSnackbar = function(message, type = 'info', duration = 4000) {
  let container = document.getElementById('snackbarContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'snackbarContainer';
    container.className = 'md-snackbar-container';
    document.body.appendChild(container);
  }

  const iconMap = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    info: 'info'
  };

  const snackbar = document.createElement('div');
  snackbar.className = `md-snackbar ${type}`;
  snackbar.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 20px;">${iconMap[type] || 'info'}</span>
    <span>${escapeHtml(message)}</span>
    <button class="md-snackbar-close" aria-label="Cerrar notificación">
      <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
    </button>
  `;

  container.appendChild(snackbar);

  // Trigger smooth entrance
  requestAnimationFrame(() => {
    snackbar.classList.add('show');
  });

  const dismiss = () => {
    snackbar.classList.remove('show');
    setTimeout(() => snackbar.remove(), 250);
  };

  snackbar.querySelector('.md-snackbar-close').addEventListener('click', dismiss);
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }
};

/* Helper escape HTML */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ==========================================================================
   10. Progressive Web App (PWA) Engine
   ========================================================================== */
let deferredPwaPrompt = null;

function initPwaSupport() {
  const installBtn = document.getElementById('pwaInstallBtn');
  const menuInstallBtn = document.getElementById('menuInstallPwaBtn');
  const offlineBadge = document.getElementById('offlineBadge');

  // Check if app is already running in standalone mode (installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;

  // Check if running on iOS Safari
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);

  // A. Register Service Worker with error handling and auto-update detection
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registrado exitosamente con scope:', registration.scope);

          // Escuchar nuevas versiones del Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nueva versión disponible');
                showUpdatePrompt(newWorker);
              }
            });
          });
        })
        .catch((error) => {
          console.warn('[PWA] Error al registrar Service Worker:', error);
        });
    });

    // Detectar cuando el nuevo Service Worker toma el control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  // B. Chromium / Android / Desktop Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar
    e.preventDefault();
    deferredPwaPrompt = e;
    console.log('[PWA] Evento beforeinstallprompt capturado');

    if (!isStandalone) {
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.classList.add('pwa-pulse');
      }
      if (menuInstallBtn) {
        menuInstallBtn.style.display = 'flex';
      }
    }
  });

  // Handle Install button clicks
  const triggerInstall = async () => {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      const { outcome } = await deferredPwaPrompt.userChoice;
      console.log(`[PWA] Elección del usuario: ${outcome}`);
      if (outcome === 'accepted') {
        showSnackbar('¡Instalando Gmail AI Cleaner en tu dispositivo!', 'success');
        if (installBtn) installBtn.style.display = 'none';
        if (menuInstallBtn) menuInstallBtn.style.display = 'none';
      }
      deferredPwaPrompt = null;
    } else if (isIOS) {
      openIosInstallModal();
    } else {
      showSnackbar('Para instalar: abre el menú de opciones del navegador y selecciona "Instalar aplicación"', 'info', 6000);
    }
  };

  if (installBtn) {
    installBtn.addEventListener('click', triggerInstall);
  }
  if (menuInstallBtn) {
    menuInstallBtn.addEventListener('click', triggerInstall);
  }

  // Show button on iOS Safari if not already installed
  if (isIOS && !isStandalone) {
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
      installBtn.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-primary);">phone_iphone</span>
        <span>Instalar</span>
      `;
    }
    if (menuInstallBtn) {
      menuInstallBtn.style.display = 'flex';
    }
  }

  // C. Successful installation event
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Gmail AI Cleaner ha sido instalado con éxito');
    if (installBtn) installBtn.style.display = 'none';
    if (menuInstallBtn) menuInstallBtn.style.display = 'none';
    showSnackbar('¡Gmail AI Cleaner se instaló con éxito en tu pantalla principal!', 'success', 5000);
  });

  // D. Offline / Online Connectivity Monitors
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    if (!isOnline) {
      if (offlineBadge) offlineBadge.style.display = 'inline-flex';
      showSnackbar('Sin conexión a Internet. Modo sin conexión activo con datos en caché.', 'warning', 5000);
    } else {
      if (offlineBadge) offlineBadge.style.display = 'none';
      showSnackbar('Conexión a Internet restablecida.', 'success', 3000);
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  if (!navigator.onLine && offlineBadge) {
    offlineBadge.style.display = 'inline-flex';
  }
}

// Modal iOS Safari
window.openIosInstallModal = function() {
  const modal = document.getElementById('iosInstallModal');
  if (modal) modal.style.display = 'flex';
};

window.closeIosInstallModal = function() {
  const modal = document.getElementById('iosInstallModal');
  if (modal) modal.style.display = 'none';
};

// Notification of Service Worker Updates
function showUpdatePrompt(worker) {
  const container = document.getElementById('snackbarContainer');
  if (!container) return;

  const updateBar = document.createElement('div');
  updateBar.className = 'md-snackbar info';
  updateBar.style.backgroundColor = '#174ea6';
  updateBar.style.borderLeft = '4px solid #8ab4f8';
  updateBar.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 20px;">system_update</span>
    <span style="flex: 1;">Nueva versión 2.0 disponible.</span>
    <button id="reloadPwaBtn" style="background: #ffffff; color: #174ea6; border: none; font-weight: 500; font-size: 12px; padding: 4px 10px; border-radius: 12px; cursor: pointer; margin-right: 8px;">
      Actualizar
    </button>
    <button class="md-snackbar-close" aria-label="Cerrar">
      <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
    </button>
  `;

  container.appendChild(updateBar);
  requestAnimationFrame(() => updateBar.classList.add('show'));

  const btn = updateBar.querySelector('#reloadPwaBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  }

  const closeBtn = updateBar.querySelector('.md-snackbar-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      updateBar.classList.remove('show');
      setTimeout(() => updateBar.remove(), 250);
    });
  }
}

/* ==========================================================================
   11. Helper: Format Bytes Utility
   ========================================================================== */
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/* ==========================================================================
   12. Sound Chime & Web Notifications
   ========================================================================== */
function playCompletionChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Pleasant 3-note chord: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + (index * 0.12);
      const stopTime = startTime + 0.6;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(stopTime);
    });
  } catch (err) {
    console.debug('[Audio] Could not play chime:', err);
  }
}

function sendBrowserNotification(title, body) {
  try {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png'
          });
        }
      });
    }
  } catch (err) {
    console.debug('[Notification] Notification error:', err);
  }
}

/* ==========================================================================
   13. Dark Mode Toggle Controller
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const toggleIcon = document.getElementById('themeToggleIcon');
  if (!toggleBtn) return;

  const updateIcon = (isDark) => {
    if (toggleIcon) {
      toggleIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }
    toggleBtn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    toggleBtn.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  };

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateIcon(currentTheme === 'dark');

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gmail_cleaner_theme', newTheme);
    updateIcon(!isDark);
    showSnackbar(newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado', 'info', 2000);
  });
}

/* ==========================================================================
   14. Warrior Mode Controller (Limpieza Total con IA en Lotes de 50)
   ========================================================================== */
function initWarriorMode() {
  const btnStart = document.getElementById('btnWarriorStart');
  const filtroTipoSelect = document.getElementById('filtroTipoSelect');
  const excluirRemitentesInput = document.getElementById('excluirRemitentesInput');
  const incluirRemitentesInput = document.getElementById('incluirRemitentesInput');

  const progressCard = document.getElementById('warriorProgressCard');
  const progressStatusText = document.getElementById('warriorProgressStatusText');
  const batchIndicator = document.getElementById('warriorBatchIndicator');
  const timeRemainingEl = document.getElementById('warriorTimeRemaining');
  const progressBar = document.getElementById('warriorProgressBar');

  const liveEliminarCount = document.getElementById('liveEliminarCount');
  const liveArchivarCount = document.getElementById('liveArchivarCount');
  const liveConservarCount = document.getElementById('liveConservarCount');
  const liveFreedSpace = document.getElementById('liveFreedSpace');

  const summaryCard = document.getElementById('warriorSummaryCard');
  const summaryTotalBadge = document.getElementById('summaryTotalAnalyzedBadge');
  const summaryCountEliminar = document.getElementById('summaryCountEliminar');
  const summaryCountArchivar = document.getElementById('summaryCountArchivar');
  const summaryCountConservar = document.getElementById('summaryCountConservar');
  const summarySpaceToFree = document.getElementById('summarySpaceToFree');

  const btnEliminarTodos = document.getElementById('btnEjecutarEliminarTodos');
  const btnArchivarTodos = document.getElementById('btnEjecutarArchivarTodos');
  const btnRevisarUno = document.getElementById('btnRevisarUnoPorUno');

  const modalConfirmacion = document.getElementById('modalConfirmacionLimpieza');
  const modalTexto = document.getElementById('modalConfirmacionTexto');
  const btnCancelarModal = document.getElementById('btnCancelarModalLimpieza');
  const btnAceptarModal = document.getElementById('btnAceptarModalLimpieza');

  const undoBanner = document.getElementById('undoFloatingBanner');
  const undoText = document.getElementById('undoBannerText');
  const btnDeshacer = document.getElementById('btnDeshacerAccion');

  let currentWarriorState = {
    totalEmails: 0,
    totalBatches: 0,
    batchSize: 50,
    countEliminar: 0,
    countArchivar: 0,
    countConservar: 0,
    freedBytes: 0,
    allProcessedItems: []
  };

  if (!btnStart) return;

  // A. Iniciar Limpieza Total
  btnStart.addEventListener('click', async () => {
    try {
      const filterType = filtroTipoSelect ? filtroTipoSelect.value : 'all';
      const excludeSenders = excluirRemitentesInput ? excluirRemitentesInput.value.trim() : '';
      const includeSenders = incluirRemitentesInput ? incluirRemitentesInput.value.trim() : '';
      const instruccionesInput = document.getElementById('instruccionesPersonalizadas');
      const instruccionesPersonalizadas = instruccionesInput ? instruccionesInput.value.trim() : '';

      // Ask for notification permission early
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      btnStart.disabled = true;
      if (progressCard) progressCard.classList.remove('hidden');
      if (summaryCard) summaryCard.classList.add('hidden');
      if (undoBanner) undoBanner.style.display = 'none';

      // Reset metrics
      if (progressBar) progressBar.style.width = '5%';
      if (progressStatusText) progressStatusText.textContent = 'Preparando escaneo de bandeja...';
      if (batchIndicator) batchIndicator.textContent = 'Iniciando...';
      if (timeRemainingEl) timeRemainingEl.textContent = '⏱️ Estimando tiempo...';
      if (liveEliminarCount) liveEliminarCount.textContent = '0';
      if (liveArchivarCount) liveArchivarCount.textContent = '0';
      if (liveConservarCount) liveConservarCount.textContent = '0';
      if (liveFreedSpace) liveFreedSpace.textContent = '0 B';

      // 1. Preparar escaneo
      const prepRes = await fetch('/api/limpieza-total/preparar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterType,
          excludeSenders,
          includeSenders,
          instruccionesPersonalizadas
        })
      });

      const prepData = await prepRes.json();
      if (prepRes.status === 401 && prepData.redirectTo) {
        showSnackbar('Debes conectar tu cuenta de Google para iniciar el escaneo. Redirigiendo...', 'info', 3000);
        window.location.href = prepData.redirectTo;
        return;
      }
      if (!prepRes.ok || !prepData.success) {
        throw new Error(prepData.error || 'Error al preparar la limpieza total');
      }

      const totalEmails = prepData.totalEmails;
      const totalBatches = prepData.totalBatches;
      const batchSize = prepData.batchSize || 50;

      if (totalEmails === 0) {
        showSnackbar('No se encontraron correos para el filtro seleccionado.', 'info', 4000);
        if (progressCard) progressCard.classList.add('hidden');
        btnStart.disabled = false;
        return;
      }

      currentWarriorState = {
        totalEmails,
        totalBatches,
        batchSize,
        countEliminar: 0,
        countArchivar: 0,
        countConservar: 0,
        freedBytes: 0,
        allProcessedItems: []
      };

      const startTime = performance.now();

      // 2. Procesar lote por lote secuencialmente (en bloques de 50)
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * batchSize + 1;
        const batchEnd = Math.min((batchIndex + 1) * batchSize, totalEmails);

        if (progressStatusText) {
          progressStatusText.textContent = `Analizando correos ${batchStart}–${batchEnd} de ${totalEmails} con Gemini AI...`;
        }
        if (batchIndicator) {
          batchIndicator.textContent = `Lote ${batchIndex + 1} de ${totalBatches}`;
        }

        const batchRes = await fetch('/api/limpieza-total/procesar-lote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchIndex,
            batchSize,
            filterType,
            excludeSenders,
            includeSenders,
            instruccionesPersonalizadas
          })
        });

        const batchData = await batchRes.json();
        if (!batchRes.ok || !batchData.success) {
          throw new Error(batchData.error || `Error en el lote #${batchIndex + 1}`);
        }

        // Acumular resultados
        currentWarriorState.countEliminar += batchData.countEliminar || 0;
        currentWarriorState.countArchivar += batchData.countArchivar || 0;
        currentWarriorState.countConservar += batchData.countConservar || 0;
        currentWarriorState.freedBytes += batchData.batchFreedBytes || 0;
        currentWarriorState.allProcessedItems.push(...(batchData.items || []));

        // Actualizar contadores en vivo
        if (liveEliminarCount) liveEliminarCount.textContent = String(currentWarriorState.countEliminar);
        if (liveArchivarCount) liveArchivarCount.textContent = String(currentWarriorState.countArchivar);
        if (liveConservarCount) liveConservarCount.textContent = String(currentWarriorState.countConservar);
        if (liveFreedSpace) liveFreedSpace.textContent = formatBytes(currentWarriorState.freedBytes);

        // Barra de progreso y cálculo dinámico de tiempo restante
        const cumulative = batchData.cumulativeProcessed || batchEnd;
        const percent = Math.min(100, Math.round((cumulative / totalEmails) * 100));
        if (progressBar) progressBar.style.width = `${percent}%`;

        const elapsedMs = performance.now() - startTime;
        const msPerItem = elapsedMs / cumulative;
        const remainingItems = totalEmails - cumulative;
        const remainingSec = Math.ceil((remainingItems * msPerItem) / 1000);

        if (timeRemainingEl) {
          if (remainingItems > 0 && remainingSec > 0) {
            timeRemainingEl.textContent = remainingSec >= 60 
              ? `⏱️ Tiempo restante: ~${Math.ceil(remainingSec / 60)} min`
              : `⏱️ Tiempo restante: ~${remainingSec} seg`;
          } else {
            timeRemainingEl.textContent = '⏱️ Casi terminado...';
          }
        }
      }

      // 3. Finalización con éxito
      if (progressBar) progressBar.style.width = '100%';
      if (progressStatusText) progressStatusText.textContent = '¡Análisis total completado!';
      if (timeRemainingEl) timeRemainingEl.textContent = '⏱️ Listo';

      // Chime sonoro y notificación Web Push
      playCompletionChime();
      sendBrowserNotification(
        '🧹 Limpieza Total con IA completada',
        `Se analizaron ${totalEmails} correos. ${currentWarriorState.countEliminar} listos para eliminar (${formatBytes(currentWarriorState.freedBytes)} liberables).`
      );

      // Sincronizar estado global con los correos procesados
      state.correos = [...currentWarriorState.allProcessedItems];
      state.currentPage = 1;
      updateSummaryCards();

      // Rellenar y mostrar la tarjeta de resumen final
      if (summaryTotalBadge) {
        summaryTotalBadge.textContent = `${totalEmails} correos analizados`;
      }
      if (summaryCountEliminar) {
        summaryCountEliminar.textContent = String(currentWarriorState.countEliminar);
      }
      if (summaryCountArchivar) {
        summaryCountArchivar.textContent = String(currentWarriorState.countArchivar);
      }
      if (summaryCountConservar) {
        summaryCountConservar.textContent = String(currentWarriorState.countConservar);
      }
      if (summarySpaceToFree) {
        summarySpaceToFree.textContent = formatBytes(currentWarriorState.freedBytes);
      }

      setTimeout(() => {
        if (progressCard) progressCard.classList.add('hidden');
        if (summaryCard) summaryCard.classList.remove('hidden');
        btnStart.disabled = false;
        showSnackbar(`✅ Análisis completado: ${currentWarriorState.countEliminar} correos marcados para eliminar`, 'success', 5000);
      }, 500);

    } catch (err) {
      console.error('Error in Warrior Mode:', err);
      if (progressCard) progressCard.classList.add('hidden');
      btnStart.disabled = false;
      showSnackbar(`❌ Error en Limpieza Total: ${err.message}`, 'error', 5000);
    }
  });

  // B. Botón "Eliminar todos los marcados" -> Abre Modal de Confirmación
  if (btnEliminarTodos) {
    btnEliminarTodos.addEventListener('click', () => {
      const count = currentWarriorState.countEliminar;
      const space = formatBytes(currentWarriorState.freedBytes);

      if (count === 0) {
        showSnackbar('No hay correos marcados para eliminar en este análisis.', 'info', 3000);
        return;
      }

      if (modalTexto) {
        modalTexto.innerHTML = `Se moverán <strong>${count} correos</strong> a la Papelera de tu cuenta de Gmail, liberando aproximadamente <strong>${space}</strong> de espacio.`;
      }
      if (modalConfirmacion) {
        modalConfirmacion.style.display = 'flex';
      }
    });
  }

  // Cancelar Modal
  if (btnCancelarModal) {
    btnCancelarModal.addEventListener('click', () => {
      if (modalConfirmacion) modalConfirmacion.style.display = 'none';
    });
  }

  // C. Confirmar Limpieza Masiva (Mover a Papelera)
  if (btnAceptarModal) {
    btnAceptarModal.addEventListener('click', async () => {
      try {
        if (modalConfirmacion) modalConfirmacion.style.display = 'none';

        const res = await fetch('/api/limpieza-total/ejecutar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'eliminar_todos' })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Error al mover correos a la papelera');
        }

        // Mostrar barra flotante de DESHACER
        if (undoBanner) {
          if (undoText) {
            undoText.textContent = `🗑️ Se enviaron ${data.trashedCount} correos a la papelera. Liberaste ${data.freedFormatted}.`;
          }
          undoBanner.style.display = 'flex';
        }

        // Actualizar datos locales
        state.correos = state.correos.filter(c => c.clasificacion !== 'Eliminar');
        state.selectedIds.clear();
        currentWarriorState.countEliminar = 0;
        if (summaryCountEliminar) summaryCountEliminar.textContent = '0';
        if (summarySpaceToFree) summarySpaceToFree.textContent = '0 B';

        updateSummaryCards();
        renderTable();

        showSnackbar(`🗑️ ${data.message}`, 'success', 6000);
      } catch (err) {
        showSnackbar(`❌ Error al eliminar: ${err.message}`, 'error', 5000);
      }
    });
  }

  // D. Botón "Archivar todos los marcados"
  if (btnArchivarTodos) {
    btnArchivarTodos.addEventListener('click', async () => {
      try {
        const count = currentWarriorState.countArchivar;
        if (count === 0) {
          showSnackbar('No hay correos marcados para archivar.', 'info', 3000);
          return;
        }

        const res = await fetch('/api/limpieza-total/ejecutar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'archivar_todos' })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Error al archivar correos');
        }

        state.correos.forEach(c => {
          if (c.clasificacion === 'Archivar') {
            c.clasificacion = 'Conservar';
          }
        });

        currentWarriorState.countArchivar = 0;
        if (summaryCountArchivar) summaryCountArchivar.textContent = '0';
        updateSummaryCards();
        renderTable();

        showSnackbar(`📁 ${data.message}`, 'success', 5000);
      } catch (err) {
        showSnackbar(`❌ Error al archivar: ${err.message}`, 'error', 5000);
      }
    });
  }

  // E. Botón "Revisar uno por uno"
  if (btnRevisarUno) {
    btnRevisarUno.addEventListener('click', () => {
      const resultadosContainer = document.getElementById('resultadosContainer');
      const tableContainer = document.getElementById('tableContainer');

      if (resultadosContainer) resultadosContainer.classList.remove('hidden');
      renderTable();

      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // F. Botón Deshacer (Restaurar correos)
  if (btnDeshacer) {
    btnDeshacer.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/limpieza-total/deshacer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'No se pudo deshacer la acción');
        }

        if (undoBanner) undoBanner.style.display = 'none';

        // Recargar el análisis para refrescar
        showSnackbar(`↩️ ${data.message}`, 'success', 6000);
        btnStart.click();
      } catch (err) {
        showSnackbar(`❌ Error al deshacer: ${err.message}`, 'error', 5000);
      }
    });
  }
}

/* ==========================================================================
   15. Custom Instructions for Gemini Controller
   ========================================================================== */
function initCustomInstructions() {
  const textarea = document.getElementById('instruccionesPersonalizadas');
  const counter = document.getElementById('charCountInstructions');
  const btnClear = document.getElementById('btnClearInstructions');
  const storageKey = 'gmail_cleaner_custom_instructions';

  if (!textarea) return;

  // Restore saved instructions from localStorage
  const saved = localStorage.getItem(storageKey);
  if (saved && !textarea.value) {
    textarea.value = saved;
  }

  // Update character count and UI state
  function updateState() {
    const len = textarea.value.length;
    if (counter) {
      counter.textContent = `${len} / 500`;
      if (len >= 480) {
        counter.style.color = 'var(--md-error)';
        counter.style.fontWeight = '700';
      } else if (len >= 400) {
        counter.style.color = 'var(--md-tertiary)';
        counter.style.fontWeight = '600';
      } else {
        counter.style.color = 'var(--md-on-surface-variant)';
        counter.style.fontWeight = '500';
      }
    }

    if (btnClear) {
      btnClear.style.display = len > 0 ? 'inline-flex' : 'none';
    }

    // Save automatically
    if (len > 0) {
      localStorage.setItem(storageKey, textarea.value);
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  textarea.addEventListener('input', updateState);
  textarea.addEventListener('change', updateState);

  // Focus and blur styling effects
  textarea.addEventListener('focus', () => {
    const card = document.getElementById('instruccionesGeminiCard');
    if (card) {
      card.style.borderColor = 'var(--md-primary)';
      card.style.boxShadow = '0 0 0 3px rgba(26, 115, 232, 0.15)';
    }
  });

  textarea.addEventListener('blur', () => {
    const card = document.getElementById('instruccionesGeminiCard');
    if (card) {
      card.style.borderColor = 'var(--md-outline)';
      card.style.boxShadow = 'var(--md-elevation-1)';
    }
  });

  // Initial state check
  updateState();

  // Expose global helper methods for suggestions
  window.insertInstruction = function(text) {
    if (!textarea) return;
    const current = textarea.value.trim();
    if (!current) {
      textarea.value = text;
    } else if (current.includes(text)) {
      showSnackbar('Esta regla ya está incluida en tus instrucciones', 'info', 3000);
      return;
    } else {
      const combined = `${current} ${text}`;
      if (combined.length > 500) {
        showSnackbar('No se puede agregar: supera el límite de 500 caracteres', 'warning', 4000);
        return;
      }
      textarea.value = combined;
    }
    updateState();
    textarea.focus();
    showSnackbar('Regla agregada a las instrucciones de Gemini', 'info', 3000);
  };

  window.clearInstructions = function() {
    if (!textarea) return;
    textarea.value = '';
    updateState();
    textarea.focus();
    showSnackbar('Instrucciones personalizadas eliminadas', 'info', 2500);
  };
}


