const AVAILABLE_FIELDS = [
  { id: 'phone', label: 'Phone', icon: 'bi bi-whatsapp', type: 'tel', autocomplete: 'tel', placeholder: '+48 123 456 789' },
  { id: 'instagram', label: 'Instagram', icon: 'bi bi-instagram', type: 'text', autocomplete: 'off', placeholder: '@username' },
  { id: 'email', label: 'Email', icon: 'bi bi-envelope', type: 'email', autocomplete: 'email', placeholder: 'you@example.com' },
  { id: 'snapchat', label: 'Snapchat', icon: 'bi bi-snapchat', type: 'text', autocomplete: 'off', placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'bi bi-linkedin', type: 'text', autocomplete: 'off', placeholder: 'username' },
  { id: 'drink', label: 'Favorite drink', icon: 'bi bi-cup-straw', type: 'text', autocomplete: 'off', placeholder: 'e.g. Gin Tonic' },
];

let activeFields = [
  { id: 'phone', value: '' },
  { id: 'instagram', value: '' },
];

let inactiveFields = [];

const activeContainer = document.getElementById('active-fields');
const inactiveContainer = document.getElementById('inactive-fields');
const fieldSelector = document.getElementById('field-selector');

function getFieldMeta(id) {
  return AVAILABLE_FIELDS.find(f => f.id === id) || {
    id,
    label: id,
    icon: '',
    type: 'text',
    placeholder: '',
  };
}

function render() {
  activeContainer.innerHTML = activeFields.length
    ? activeFields
        .map((field, index) => {
          if (field.isCustom) {
            return `
              <div>
                <fieldset role="group" style="margin-bottom: 0.5rem;">
                  <input 
                    type="text" 
                    maxlength="2" 
                    data-type="custom-icon" 
                    data-index="${index}" 
                    value="${field.icon || '✏️'}" 
                    style="max-width: 4rem; text-align: center; font-size: 1.1rem; padding: 0.5rem;"
                    title="Tap to change emoji"
                  >
                  <input 
                    type="text" 
                    data-type="custom-label" 
                    data-index="${index}" 
                    value="${field.label}" 
                    placeholder="Field name (e.g. Discord)"
                  >
                </fieldset>
                <fieldset role="group">
                  <input 
                    type="text" 
                    data-type="custom-value" 
                    data-index="${index}" 
                    value="${field.value}" 
                    placeholder="Value"
                  >
                  <button type="button" class="outline secondary" data-action="deactivate" data-index="${index}">−</button>
                </fieldset>
              </div>
            `;
          }

          const meta = getFieldMeta(field.id);
          return `
            <div>
              <label><i class="${meta.icon}" style="margin-right: 0.4rem;"></i>${meta.label}</label>
              <fieldset role="group">
                <input 
                  type="${meta.type}" 
                  name="${meta.id}" 
                  autocomplete="${meta.autocomplete || 'off'}" 
                  data-index="${index}" 
                  value="${field.value}" 
                  placeholder="${meta.placeholder}"
                >
                <button type="button" class="outline secondary" data-action="deactivate" data-index="${index}">−</button>
              </fieldset>
            </div>
          `;
        })
        .join('')
    : '<p><small>No active fields.</small></p>';

  inactiveContainer.innerHTML = inactiveFields.length
    ? inactiveFields
        .map((field, index) => {
          if (field.isCustom) {
            return `
              <div>
                <label>${field.icon || '✏️'} ${field.label || 'Custom field'}</label>
                <fieldset role="group">
                  <input 
                    type="text" 
                    data-type="custom-value" 
                    data-index="${index}" 
                    value="${field.value}" 
                    placeholder="Value"
                  >
                  <button type="button" class="outline" data-action="activate" data-index="${index}">+</button>
                  <button type="button" class="outline secondary" data-action="remove" data-index="${index}">✕</button>
                </fieldset>
              </div>
            `;
          }

          const meta = getFieldMeta(field.id);
          return `
            <div>
              <label><i class="${meta.icon}" style="margin-right: 0.4rem;"></i>${meta.label}</label>
              <fieldset role="group">
                <input 
                  type="${meta.type}" 
                  name="${meta.id}" 
                  autocomplete="${meta.autocomplete || 'off'}" 
                  data-index="${index}" 
                  value="${field.value}" 
                  placeholder="${meta.placeholder}"
                >
                <button type="button" class="outline" data-action="activate" data-index="${index}">+</button>
                <button type="button" class="outline secondary" data-action="remove" data-index="${index}">✕</button>
              </fieldset>
            </div>
          `;
        })
        .join('')
    : '<p><small>No saved fields.</small></p>';

  const activeIds = new Set(activeFields.map(f => f.id));
  const availableOptions = AVAILABLE_FIELDS.filter(f => !activeIds.has(f.id));

  fieldSelector.innerHTML = `
    <option value="" disabled selected>+ Add field...</option>
    ${availableOptions
      .map(f => `<option value="${f.id}">${f.label}</option>`)
      .join('')}
    <option value="__custom__">Custom field...</option>
  `;
}

activeContainer.addEventListener('input', e => {
  const index = e.target.dataset.index;
  if (index === undefined) return;

  if (e.target.dataset.type === 'custom-icon') {
    activeFields[index].icon = e.target.value;
  } else if (e.target.dataset.type === 'custom-label') {
    activeFields[index].label = e.target.value;
  } else if (e.target.dataset.type === 'custom-value') {
    activeFields[index].value = e.target.value;
  } else {
    activeFields[index].value = e.target.value;
  }
});

inactiveContainer.addEventListener('input', e => {
  const index = e.target.dataset.index;
  if (index === undefined) return;

  if (e.target.dataset.type === 'custom-value') {
    inactiveFields[index].value = e.target.value;
  } else {
    inactiveFields[index].value = e.target.value;
  }
});

activeContainer.addEventListener('click', e => {
  if (e.target.dataset.action === 'deactivate') {
    const index = Number(e.target.dataset.index);
    const [movedField] = activeFields.splice(index, 1);
    const hasValue = movedField.value.trim() !== '';
    const hasLabel = movedField.isCustom && movedField.label.trim() !== '';

    if (hasValue || hasLabel) {
      inactiveFields.unshift(movedField);
    }
    render();
  }
});

inactiveContainer.addEventListener('click', e => {
  const action = e.target.dataset.action;
  const index = Number(e.target.dataset.index);

  if (action === 'activate') {
    const [movedField] = inactiveFields.splice(index, 1);
    activeFields.push(movedField);
    render();
  } else if (action === 'remove') {
    inactiveFields.splice(index, 1);
    render();
  }
});

fieldSelector.addEventListener('change', e => {
  const selectedId = e.target.value;
  if (!selectedId) return;

  if (selectedId === '__custom__') {
    activeFields.push({
      id: 'custom_' + Date.now(),
      label: '',
      icon: '✏️',
      value: '',
      isCustom: true,
    });
    render();
    return;
  }

  const inactiveIndex = inactiveFields.findIndex(f => f.id === selectedId);
  if (inactiveIndex !== -1) {
    const [movedField] = inactiveFields.splice(inactiveIndex, 1);
    activeFields.push(movedField);
  } else {
    activeFields.push({ id: selectedId, value: '' });
  }

  render();
});

render();
