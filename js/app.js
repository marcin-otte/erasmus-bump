const AVAILABLE_FIELDS = [
  { id: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', placeholder: '+48 123 456 789' },
  { id: 'instagram', label: 'Instagram', type: 'text', autocomplete: 'username', placeholder: '@username' },
  { id: 'email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'you@example.com' },
  { id: 'snapchat', label: 'Snapchat', type: 'text', autocomplete: 'off', placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn', type: 'text', autocomplete: 'off', placeholder: 'username' },
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
  return AVAILABLE_FIELDS.find(f => f.id === id);
}

function render() {
  activeContainer.innerHTML = activeFields.length
    ? activeFields
        .map((field, index) => {
          const meta = getFieldMeta(field.id);
          return `
            <div>
              <label>${meta.label}</label>
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
          const meta = getFieldMeta(field.id);
          return `
            <div>
              <label>${meta.label}</label>
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
  `;

  fieldSelector.disabled = availableOptions.length === 0;
}

activeContainer.addEventListener('input', e => {
  const index = e.target.dataset.index;
  if (index !== undefined) {
    activeFields[index].value = e.target.value;
  }
});

inactiveContainer.addEventListener('input', e => {
  const index = e.target.dataset.index;
  if (index !== undefined) {
    inactiveFields[index].value = e.target.value;
  }
});

activeContainer.addEventListener('click', e => {
  if (e.target.dataset.action === 'deactivate') {
    const index = Number(e.target.dataset.index);
    const [movedField] = activeFields.splice(index, 1);
    if (movedField.value.trim() !== '') {
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
