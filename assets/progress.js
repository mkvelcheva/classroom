/* Resource IDs are permanent; lesson order and titles never enter storage keys. */
(() => {
  const course = document.querySelector('[data-course]');
  if (!course) return;
  const boxes = [...course.querySelectorAll('[data-resource]')];
  const meter = course.querySelector('progress');
  const text = course.querySelector('[data-progress-text]');
  const note = course.querySelector('[data-storage-note]');
  const key = box => `classroom:v1:${course.dataset.course}:${box.dataset.resource}`;
  const unavailable = () => { note.textContent = 'Записването е недостъпно. Отметките важат само за текущото отваряне.'; };
  function update() {
    const count = boxes.filter(box => box.checked).length;
    meter.value = boxes.length ? count / boxes.length * 100 : 0;
    text.textContent = `Прегледани: ${count} от ${boxes.length} материала`;
  }
  boxes.forEach(box => {
    try { box.checked = localStorage.getItem(key(box)) === '1'; } catch { unavailable(); }
    box.addEventListener('change', () => {
      try { localStorage.setItem(key(box), box.checked ? '1' : '0'); } catch { unavailable(); }
      update();
    });
  });
  window.addEventListener('storage', event => {
    boxes.forEach(box => {
      if (event.key === null || event.key === key(box)) {
        try { box.checked = localStorage.getItem(key(box)) === '1'; } catch { unavailable(); }
      }
    });
    update();
  });
  const units = [...course.querySelectorAll('details')];
  const toggle = course.querySelector('[data-toggle-all]');
  const syncToggle = () => { toggle.textContent = units.some(unit => unit.open) ? 'Сгъни всички' : 'Разгъни всички'; };
  toggle.hidden = units.length === 0;
  toggle.addEventListener('click', () => {
    const open = !units.some(unit => unit.open);
    units.forEach(unit => { unit.open = open; });
    syncToggle();
  });
  units.forEach(unit => unit.addEventListener('toggle', syncToggle));
  update();
})();
