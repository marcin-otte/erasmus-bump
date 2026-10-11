const AVAILABLE_FIELDS = [
  { id: 'phone', label: 'Phone', icon: 'bi bi-whatsapp', type: 'tel', autocomplete: 'tel', placeholder: '+48 123 456 789' },
  { id: 'instagram', label: 'Instagram', icon: 'bi bi-instagram', type: 'text', autocomplete: 'off', placeholder: '@username' },
  { id: 'email', label: 'Email', icon: 'bi bi-envelope', type: 'email', autocomplete: 'email', placeholder: 'you@example.com' },
  { id: 'snapchat', label: 'Snapchat', icon: 'bi bi-snapchat', type: 'text', autocomplete: 'off', placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'bi bi-linkedin', type: 'text', autocomplete: 'off', placeholder: 'username' },
  { id: 'drink', label: 'Favorite drink', icon: 'bi bi-cup-straw', type: 'text', autocomplete: 'off', placeholder: 'e.g. Gin Tonic' },
];

const STORAGE_KEY = 'peerbump_profile';

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const savedData = loadProfile();

let activeFields = savedData?.activeFields || [
  { id: 'phone', value: '' },
  { id: 'instagram', value: '' },
];

let inactiveFields = savedData?.inactiveFields || [];

const nameInput = document.getElementById('name');
const activeContainer = document.getElementById('active-fields');
const inactiveContainer = document.getElementById('inactive-fields');
const fieldSelector = document.getElementById('field-selector');
const profileForm = document.getElementById('profile-form');

if (savedData?.name) {
  nameInput.value = savedData.name;
}

function saveProfile() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: nameInput.value,
      activeFields,
      inactiveFields,
    })
  );
}

function getFieldMeta(id) {
  return AVAILABLE_FIELDS.find(f => f.id === id) || {
    id,
    label: id,
    icon: 'bi bi-tag',
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
                <input 
                  type="text" 
                  data-type="custom-label" 
                  data-index="${index}" 
                  value="${field.label}" 
                  placeholder="Field name (e.g. Discord)"
                >
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
                <label><i class="bi bi-tag" style="margin-right: 0.4rem;"></i>${field.label || 'Custom field'}</label>
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

  if (e.target.dataset.type === 'custom-label') {
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

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  saveProfile();

  const btn = profileForm.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Saved!';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1000);
});

const profileCard = document.getElementById('profile-card');
const roomActions = document.getElementById('room-actions');
const btnHost = document.getElementById('btn-host');
const btnJoinToggle = document.getElementById('btn-join-toggle');
const joinManual = document.getElementById('join-manual');
const manualRoomInput = document.getElementById('manual-room-input');
const btnManualJoin = document.getElementById('btn-manual-join');

const guestBanner = document.getElementById('guest-banner');
const guestRoomId = document.getElementById('guest-room-id');
const guestStatus = document.getElementById('guest-status');
const guestActions = document.getElementById('guest-actions');
const btnSendContact = document.getElementById('btn-send-contact');
const btnLeaveRoom = document.getElementById('btn-leave-room');

const hostView = document.getElementById('host-view');
const hostRoomId = document.getElementById('host-room-id');
const hostLinkText = document.getElementById('host-link-text');
const qrCodeContainer = document.getElementById('qrcode');
const btnCloseRoom = document.getElementById('btn-close-room');
const connectedCount = document.getElementById('connected-count');
const connectedPeersList = document.getElementById('connected-peers-list');
const btnBump = document.getElementById('btn-bump');

let currentRoomId = null;
let peerInstance = null;
let hostConnection = null;
const connectedPeers = new Map();

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomPeerId(roomId) {
  return `peerbump-${roomId.toLowerCase()}`;
}

function updateHostPeersList() {
  const count = connectedPeers.size;
  connectedCount.textContent = count;
  btnBump.disabled = count === 0;
  btnBump.textContent = count === 0 ? 'Bump Contacts' : `Bump (${count})`;

  connectedPeersList.innerHTML = Array.from(connectedPeers.values())
    .map(p => `
      <span style="background: var(--pico-card-background-color, #2b303c); border: 1px solid var(--pico-muted-border-color); padding: 0.2rem 0.6rem; border-radius: 1rem;">
        <small>${escapeHtml(p.name)}</small>
      </span>
    `)
    .join('');
}

function enterHostMode(roomId) {
  currentRoomId = roomId || generateRoomId();
  profileCard.style.display = 'none';
  hostView.style.display = 'block';
  hostRoomId.textContent = currentRoomId;

  const baseUrl = window.location.protocol === 'file:'
    ? 'https://marcin-otte.github.io/erasmus-bump/'
    : `${window.location.origin}${window.location.pathname}`;
  const joinUrl = `${baseUrl.replace(/\/$/, '')}/?room=${currentRoomId}`;
  hostLinkText.textContent = joinUrl;

  qrCodeContainer.innerHTML = '';
  new QRCode(qrCodeContainer, {
    text: joinUrl,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });

  if (peerInstance) {
    peerInstance.destroy();
  }

  connectedPeers.clear();
  updateHostPeersList();

  const peerId = getRoomPeerId(currentRoomId);
  peerInstance = new Peer(peerId);

  peerInstance.on('connection', conn => {
    conn.on('data', data => {
      if (data?.type === 'JOIN') {
        connectedPeers.set(conn.peer, { conn, name: data.name || 'Anonymous' });
        updateHostPeersList();
        conn.send({ type: 'WELCOME', room: currentRoomId });
      }
    });

    conn.on('close', () => {
      connectedPeers.delete(conn.peer);
      updateHostPeersList();
    });

    conn.on('error', () => {
      connectedPeers.delete(conn.peer);
      updateHostPeersList();
    });
  });

  peerInstance.on('error', err => {
    if (err.type === 'unavailable-id') {
      enterHostMode(generateRoomId());
    }
  });
}

function closeHostMode() {
  if (peerInstance) {
    peerInstance.destroy();
    peerInstance = null;
  }
  connectedPeers.clear();
  updateHostPeersList();

  currentRoomId = null;
  hostView.style.display = 'none';
  profileCard.style.display = 'block';
  qrCodeContainer.innerHTML = '';
}

function enterGuestMode(roomId) {
  currentRoomId = roomId.trim().toUpperCase();
  profileCard.style.display = 'block';
  hostView.style.display = 'none';
  guestBanner.style.display = 'block';
  guestRoomId.textContent = currentRoomId;
  guestRoomId.style.color = '';
  guestStatus.textContent = 'Connecting to host...';
  guestStatus.style.color = '';
  roomActions.style.display = 'none';
  guestActions.style.display = 'block';

  const newUrl = `${window.location.origin}${window.location.pathname}?room=${currentRoomId}`;
  window.history.replaceState({}, '', newUrl);

  if (peerInstance) {
    peerInstance.destroy();
  }

  peerInstance = new Peer();

  peerInstance.on('open', () => {
    const targetHostId = getRoomPeerId(currentRoomId);
    hostConnection = peerInstance.connect(targetHostId, { reliable: true });

    hostConnection.on('open', () => {
      const myName = nameInput.value.trim() || 'Anonymous';
      hostConnection.send({ type: 'JOIN', name: myName });
      guestStatus.textContent = 'Connected to host!';
      guestStatus.style.color = 'var(--pico-color-green-500, #43a047)';
      guestRoomId.style.color = '';
    });

    hostConnection.on('data', data => {
      if (data?.type === 'WELCOME') {
        guestStatus.textContent = 'Connected to host! Ready.';
        guestStatus.style.color = 'var(--pico-color-green-500, #43a047)';
        guestRoomId.style.color = '';
      }
    });

    hostConnection.on('close', () => {
      guestStatus.textContent = 'Disconnected from host.';
      guestStatus.style.color = 'var(--pico-color-red-500, #e53935)';
      guestRoomId.style.color = 'var(--pico-color-red-500, #e53935)';
    });

    hostConnection.on('error', () => {
      guestStatus.textContent = 'Connection error.';
      guestStatus.style.color = 'var(--pico-color-red-500, #e53935)';
      guestRoomId.style.color = 'var(--pico-color-red-500, #e53935)';
    });
  });

  peerInstance.on('error', () => {
    guestStatus.textContent = 'Could not connect to host.';
    guestStatus.style.color = 'var(--pico-color-red-500, #e53935)';
    guestRoomId.style.color = 'var(--pico-color-red-500, #e53935)';
  });
}

function leaveGuestMode() {
  if (hostConnection) {
    hostConnection.close();
    hostConnection = null;
  }
  if (peerInstance) {
    peerInstance.destroy();
    peerInstance = null;
  }

  currentRoomId = null;
  guestRoomId.style.color = '';
  guestStatus.style.color = '';
  guestBanner.style.display = 'none';
  guestActions.style.display = 'none';
  roomActions.style.display = 'block';

  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, '', cleanUrl);
}

btnHost.addEventListener('click', () => enterHostMode());
btnCloseRoom.addEventListener('click', closeHostMode);

btnJoinToggle.addEventListener('click', () => {
  joinManual.style.display = joinManual.style.display === 'none' ? 'block' : 'none';
});

btnManualJoin.addEventListener('click', () => {
  const val = manualRoomInput.value.trim();
  if (val) {
    enterGuestMode(val);
  }
});

btnLeaveRoom.addEventListener('click', leaveGuestMode);

btnSendContact.addEventListener('click', () => {
  const original = btnSendContact.textContent;
  btnSendContact.textContent = 'Sent!';
  btnSendContact.disabled = true;

  setTimeout(() => {
    btnSendContact.textContent = original;
    btnSendContact.disabled = false;
  }, 1000);
});

const urlParams = new URLSearchParams(window.location.search);
const initialRoom = urlParams.get('room');
if (initialRoom) {
  enterGuestMode(initialRoom);
}

render();
