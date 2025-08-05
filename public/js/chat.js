document.addEventListener('DOMContentLoaded', () => {
  const userSearch = document.getElementById('userSearch');
  const userList = document.getElementById('userList');
  const chatWith = document.getElementById('chatWith');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  let activeUserId = null;
  let activeUserName = '';
  let currentUserId = localStorage.getItem('currentUserId');
  let socket = null;
  let debounceTimer = null;
  let onlineUsers = [];
  let currentPage = 1;
  let totalPages = 1;
  let isLoading = false;
  const socketUrl = document.getElementById('socketConfig')?.dataset.socketUrl;
  function isNearBottom(container) {
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < 50
    );
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  async function fetchUsers(search = '') {
    try {
      chatWith.textContent = 'Loading...';
      const res = await fetch(`/users?search=${encodeURIComponent(search)}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.success) {
        const filteredUsers = data.payload.data.filter(
          (u) => u.id != currentUserId,
        );
        renderUsers(filteredUsers);
        if (!activeUserId && filteredUsers.length > 0) {
          selectUser(filteredUsers[0]);
        } else if (filteredUsers.length === 0) {
          chatWith.textContent = 'No users available';
        }
      }
    } catch (err) {
      console.error(err);
      chatWith.textContent = 'Failed to load users';
    }
  }

  function renderUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.className = `list-group-item user-item ${user.id === activeUserId ? 'active' : ''}`;
      li.dataset.userId = user.id;
      li.innerHTML = `
        <img class="avatar me-2" src="https://placehold.co/40" alt="User">
        <span class="name">${user.name}</span>
        <span class="online-dot ms-auto"></span>
      `;
      li.addEventListener('click', () => selectUser(user));
      userList.appendChild(li);
    });
    updateOnlineStatus();
  }

  async function selectUser(user) {
    activeUserId = user.id;
    activeUserName = user.name;
    currentPage = 1;
    totalPages = 1;
    chatMessages.innerHTML = '';

    document
      .querySelectorAll('.user-item')
      .forEach((el) => el.classList.remove('active'));
    const activeEl = document.querySelector(
      `.user-item[data-user-id="${user.id}"]`,
    );
    if (activeEl) activeEl.classList.add('active');

    const dot = activeEl.querySelector('.online-dot');
    const isOnline = dot && dot.style.background === 'rgb(76, 175, 80)';

    chatWith.innerHTML = `
    Chat with ${user.name} 
    <span class="online-dot" style="margin-left:8px; background:${isOnline ? '#4CAF50' : '#ccc'}"></span>
  `;

    await fetchMessages(user.id, currentPage, true);
  }

  async function fetchMessages(
    otherUserId,
    page = 1,
    scrollToBottomFlag = false,
  ) {
    if (isLoading || page > totalPages) return;
    isLoading = true;

    try {
      const res = await fetch(
        `/chats/${otherUserId}/history?page=${page}&pageSize=20`,
        {
          credentials: 'include',
        },
      );
      const data = await res.json();

      if (data.success) {
        const messages = data.payload.data;
        totalPages = data.payload.meta.totalPages;
        currentPage = data.payload.meta.currentPage;

        if (scrollToBottomFlag) {
          messages.forEach((msg) => {
            const div = createMessageDiv(msg);
            chatMessages.appendChild(div); // append
          });
          scrollToBottom();
        } else {
          const previousHeight = chatMessages.scrollHeight;
          messages.reverse().forEach((msg) => {
            const div = createMessageDiv(msg);
            chatMessages.insertBefore(div, chatMessages.firstChild);
          });
          const newHeight = chatMessages.scrollHeight;
          chatMessages.scrollTop += newHeight - previousHeight;
        }
      }
    } catch (err) {
      console.error(err);
    }

    isLoading = false;
  }
  function createMessageDiv(msg) {
    const div = document.createElement('div');
    div.className = `chat-message ${msg.senderId === currentUserId ? 'own' : ''}`;
    div.innerHTML = `
    <div class="sender">${msg.senderId === currentUserId ? 'You' : msg.senderName}</div>
    <div class="message">${msg.content}</div>
    <div class="time">${new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;
    return div;
  }
  chatMessages.addEventListener('scroll', async () => {
    if (chatMessages.scrollTop <= 50 && currentPage < totalPages) {
      await fetchMessages(activeUserId, currentPage + 1);
    }
  });

  userSearch.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchUsers(userSearch.value);
    }, 300);
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = chatInput.value.trim();
    if (!content || !activeUserId) return;
    const message = { toReceiverId: activeUserId, content };
    socket.emit('sendMessage', message);
    renderMessage({ senderId: currentUserId, content, sentAt: new Date() });
    chatInput.value = '';
    scrollToBottom();
  });

  function renderMessage({ senderId, content, sentAt }) {
    const div = document.createElement('div');
    div.className = `chat-message ${senderId === currentUserId ? 'own' : ''}`;
    div.innerHTML = `
      <div class="sender">${senderId === currentUserId ? 'You' : activeUserName}</div>
      <div class="message">${content}</div>
      <div class="time">${new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    const wasNearBottom = isNearBottom(chatMessages);
    chatMessages.appendChild(div);
    if (wasNearBottom) {
      scrollToBottom();
    }
  }
  function updateOnlineStatus() {
    document.querySelectorAll('.user-item').forEach((el) => {
      const userId = parseInt(el.dataset.userId);
      const dot = el.querySelector('.online-dot');
      if (dot) {
        dot.style.background = onlineUsers.includes(userId)
          ? '#4CAF50'
          : '#ccc';
      }
    });
  }

  function connectSocket() {
    socket = io(`${socketUrl}/chat`, { withCredentials: true });
    socket.on('connect', () => {
      currentUserId = localStorage.getItem('currentUserId');
      socket.emit('join', { userId: currentUserId });
      fetchUsers();
    });
    socket.on('newMessage', (msg) => {
      if (msg.senderId === activeUserId || msg.receiverId === activeUserId) {
        renderMessage(msg);
      }
    });
    socket.on('onlineUsers', (users) => {
      onlineUsers = users.map((id) => id);
      console.log('Calll online users!!!::', onlineUsers);
      updateOnlineStatus();
    });
  }

  connectSocket();
  window.addEventListener('beforeunload', () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });
});
