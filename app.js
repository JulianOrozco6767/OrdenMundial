/**
 * ORDEN MUNDIAL - INTERACTIVE SLIDE DECK ENGINE
 * Presentador: Samuel Orozco | Universidad Pedagógica y Tecnológica de Colombia (UPTC)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const slideIndicator = document.getElementById('slideIndicator');
  const slideTitleDisplay = document.getElementById('slideTitleDisplay');
  const progressBar = document.getElementById('progressBar');

  const btnEditMode = document.getElementById('btnEditMode');
  const btnOverview = document.getElementById('btnOverview');
  const btnFullscreen = document.getElementById('btnFullscreen');

  const overviewModal = document.getElementById('overviewModal');
  const btnCloseOverview = document.getElementById('btnCloseOverview');
  const overviewBackdrop = document.getElementById('overviewBackdrop');
  const overviewGrid = document.getElementById('overviewGrid');
  const toast = document.getElementById('toast');

  let isEditMode = false;

  // 1. Initial State & Local Storage Restore for Edits
  const savedEdits = localStorage.getItem('orden_mundial_slides_edits');
  if (savedEdits) {
    try {
      const parsed = JSON.parse(savedEdits);
      document.querySelectorAll('.editable').forEach((el, idx) => {
        if (parsed[idx] !== undefined) {
          el.innerHTML = parsed[idx];
        }
      });
    } catch (e) {
      console.warn('Could not parse saved edits', e);
    }
  }

  // 2. Navigation Core
  function updateSlide(newIndex) {
    if (newIndex < 0 || newIndex >= totalSlides) return;

    slides[currentSlideIndex].classList.remove('active');
    if (newIndex > currentSlideIndex) {
      slides[currentSlideIndex].classList.add('prev-slide');
    } else {
      slides[currentSlideIndex].classList.remove('prev-slide');
    }

    currentSlideIndex = newIndex;
    const currentSlide = slides[currentSlideIndex];
    currentSlide.classList.remove('prev-slide');
    currentSlide.classList.add('active');

    // Update Counter & Title
    const formattedNum = String(currentSlideIndex + 1).padStart(2, '0');
    slideIndicator.textContent = `${formattedNum} / ${String(totalSlides).padStart(2, '0')}`;
    
    const slideTitle = currentSlide.getAttribute('data-title') || `Diapositiva ${currentSlideIndex + 1}`;
    slideTitleDisplay.textContent = slideTitle;

    // Update Progress Bar
    const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Disable/Enable buttons
    btnPrev.disabled = currentSlideIndex === 0;
    btnNext.disabled = currentSlideIndex === totalSlides - 1;
    btnPrev.style.opacity = currentSlideIndex === 0 ? '0.4' : '1';
    btnNext.style.opacity = currentSlideIndex === totalSlides - 1 ? '0.4' : '1';

    // Scroll to top of slide if on mobile
    currentSlide.scrollTop = 0;
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      updateSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      updateSlide(currentSlideIndex - 1);
    }
  }

  btnPrev.addEventListener('click', prevSlide);
  btnNext.addEventListener('click', nextSlide);

  // 3. Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // If typing inside an editable field, don't trigger slide jumps!
    if (document.activeElement && document.activeElement.isContentEditable) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        updateSlide(0);
        break;
      case 'End':
        e.preventDefault();
        updateSlide(totalSlides - 1);
        break;
      case 'e':
      case 'E':
        toggleEditMode();
        break;
      case 'o':
      case 'O':
        toggleOverview();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'Escape':
        closeOverview();
        break;
    }
  });

  // 4. Touch Swipes (Mobile & Tablet)
  let touchStartX = 0;
  let touchEndX = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
    }
  }

  // 5. Live Edit Mode
  function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode-active', isEditMode);
    btnEditMode.classList.toggle('active', isEditMode);

    const editableElements = document.querySelectorAll('.editable');
    editableElements.forEach(el => {
      el.contentEditable = isEditMode ? 'true' : 'false';
    });

    if (isEditMode) {
      showToast('✏️ Modo Edición activado: Haz clic en cualquier texto para cambiarlo');
    } else {
      saveEdits();
      showToast('💾 Cambios guardados localmente');
    }
  }

  function saveEdits() {
    const edits = [];
    document.querySelectorAll('.editable').forEach((el, idx) => {
      edits[idx] = el.innerHTML;
    });
    localStorage.setItem('orden_mundial_slides_edits', JSON.stringify(edits));
  }

  // Auto-save on blur while in edit mode
  document.addEventListener('focusout', (e) => {
    if (isEditMode && e.target.classList.contains('editable')) {
      saveEdits();
    }
  });

  btnEditMode.addEventListener('click', toggleEditMode);

  // 6. Slide Overview Grid
  function buildOverviewGrid() {
    overviewGrid.innerHTML = '';
    slides.forEach((slide, index) => {
      const thumb = document.createElement('div');
      thumb.className = `overview-thumb ${index === currentSlideIndex ? 'current' : ''}`;
      
      const title = slide.getAttribute('data-title') || `Diapositiva ${index + 1}`;
      thumb.innerHTML = `
        <span class="thumb-num">Diapositiva ${index + 1} de ${totalSlides}</span>
        <strong class="thumb-title">${title}</strong>
      `;

      thumb.addEventListener('click', () => {
        updateSlide(index);
        closeOverview();
      });

      overviewGrid.appendChild(thumb);
    });
  }

  function toggleOverview() {
    const isOpen = overviewModal.classList.contains('open');
    if (isOpen) {
      closeOverview();
    } else {
      buildOverviewGrid();
      overviewModal.classList.add('open');
    }
  }

  function closeOverview() {
    overviewModal.classList.remove('open');
  }

  btnOverview.addEventListener('click', toggleOverview);
  btnCloseOverview.addEventListener('click', closeOverview);
  overviewBackdrop.addEventListener('click', closeOverview);

  // 7. Fullscreen Toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('Pantalla completa no disponible');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  btnFullscreen.addEventListener('click', toggleFullscreen);

  // Toast Helper
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Initialize
  updateSlide(0);
});
