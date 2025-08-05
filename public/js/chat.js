let socket;
let currentUser;
let openChats = {};
let notificationCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  currentUser = parseJwt(token).sub;

  socket = io('http://localhost:3000', { auth: { token } });
  socket.on('connect', () => console.log('Connected as', currentUser));
  socket.on('newMessage', (msg) => handleIncomingMessage(msg));

  document.getElementById('searchInput').addEventListener('input', loadUsers);
  loadUsers();
});

async function loadUsers() {
  const q = document.getElementById('searchInput').value || '';
  const res = await fetch(`/users/search?q=${q}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const users = await res.json();
  const list = document.getElementById('userList');
  list.innerHTML = '';
  users.forEach((u) => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.textContent = u.name;
    li.onclick = () => openChatBox(u);
    list.appendChild(li);
  });
}

function openChatBox(user) {
  if (openChats[user.id]) return;
  const box = document.createElement('div');
  box.className = 'card mb-2';
  box.innerHTML = `
    <div class="card-header">${user.name}</div>
    <div class="card-body chat-card" id="messages-${user.id}"></div>
    <div class="card-footer">
      <input type="text" class="form-control mb-1" id="input-${user.id}" placeholder="Type message...">
      <button class="btn btn-sm btn-primary w-100" onclick="sendMessage(${user.id})">Send</button>
    </div>`;
  document.getElementById('chatBoxes').appendChild(box);
  openChats[user.id] = true;
}

function sendMessage(receiverId) {
  const input = document.getElementById(`input-${receiverId}`);
  const content = input.value.trim();
  if (!content) return;
  socket.emit('sendMessage', { toReceiverId: receiverId, content });
  appendMessage(receiverId, { senderId: currentUser, content });
  input.value = '';
}

function handleIncomingMessage(msg) {
  if (!openChats[msg.senderId]) {
    notificationCount++;
    document.getElementById('notifBadge').textContent = notificationCount;
    document.getElementById('notifBadge').style.display = 'inline-block';
  }
  appendMessage(msg.senderId, msg);
}

function appendMessage(userId, msg) {
  const box = document.getElementById(`messages-${userId}`);
  if (!box) return;
  const div = document.createElement('div');
  div.innerHTML = `<b>${msg.senderId === currentUser ? 'You' : 'User ' + msg.senderId}:</b> ${msg.content}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  currentUser = parseJwt(token).sub;

  socket = io('http://localhost:3000', { auth: { token } });
  socket.on('connect', () => console.log('Connected as', currentUser));
  socket.on('newMessage', (msg) => handleIncomingMessage(msg));

  document.getElementById('searchInput').addEventListener('input', loadUsers);
  loadUsers();
});

async function loadUsers() {
  const q = document.getElementById('searchInput').value || '';
  const res = await fetch(`/users/search?q=${q}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const users = await res.json();
  const list = document.getElementById('userList');
  list.innerHTML = '';
  users.forEach((u) => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.textContent = u.name;
    li.onclick = () => openChatBox(u);
    list.appendChild(li);
  });
}

function openChatBox(user) {
  if (openChats[user.id]) return;
  const box = document.createElement('div');
  box.className = 'card mb-2';
  box.innerHTML = `
    <div class="card-header">${user.name}</div>
    <div class="card-body chat-card" id="messages-${user.id}"></div>
    <div class="card-footer">
      <input type="text" class="form-control mb-1" id="input-${user.id}" placeholder="Type message...">
      <button class="btn btn-sm btn-primary w-100" onclick="sendMessage(${user.id})">Send</button>
    </div>`;
  document.getElementById('chatBoxes').appendChild(box);
  openChats[user.id] = true;
}

function sendMessage(receiverId) {
  const input = document.getElementById(`input-${receiverId}`);
  const content = input.value.trim();
  if (!content) return;
  socket.emit('sendMessage', { toReceiverId: receiverId, content });
  appendMessage(receiverId, { senderId: currentUser, content });
  input.value = '';
}

function handleIncomingMessage(msg) {
  if (!openChats[msg.senderId]) {
    notificationCount++;
    document.getElementById('notifBadge').textContent = notificationCount;
    document.getElementById('notifBadge').style.display = 'inline-block';
  }
  appendMessage(msg.senderId, msg);
}

function appendMessage(userId, msg) {
  const box = document.getElementById(`messages-${userId}`);
  if (!box) return;
  const div = document.createElement('div');
  div.innerHTML = `<b>${msg.senderId === currentUser ? 'You' : 'User ' + msg.senderId}:</b> ${msg.content}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}
