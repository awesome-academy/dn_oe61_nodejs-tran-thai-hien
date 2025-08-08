document.addEventListener('DOMContentLoaded', () => {
  const userSearch = document.getElementById('userSearch');
  const userList = document.getElementById('userList');
  const chatWith = document.getElementById('chatWith');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  let activeUserId = null;
  let activeUserName = '';
  let currentUserId = parseInt(localStorage.getItem('currentUserId'), 10);
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

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      } else if (res.status === 409) {
        alert(data.message || 'Không lấy được dữ liệu users');
        return;
      } else if (res.status === 500) {
        alert(data.message || 'Internal Server Error');
        return;
      }

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
      } else {
        chatWith.textContent =
          data.message || 'Không thể tải danh sách người dùng';
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
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      } else if (res.status === 409) {
        alert(data.message || 'Không tải được tin nhắn');
        return;
      } else if (res.status === 500) {
        alert(data.message || 'Internal Server Error');
        return;
      }
      if (data.success) {
        const messages = data.payload.data;
        totalPages = data.payload.meta.totalPages;
        currentPage = data.payload.meta.currentPage;

        if (scrollToBottomFlag) {
          messages.forEach((msg) => {
            renderMessage(msg, true); // append
          });
          scrollToBottom();
        } else {
          const previousHeight = chatMessages.scrollHeight;
          messages.reverse().forEach((msg) => {
            renderMessage(msg, false);
          });
          const newHeight = chatMessages.scrollHeight;
          chatMessages.scrollTop += newHeight - previousHeight;
        }
      }
    } catch (err) {
      alert('Internal Server Error');
    }

    isLoading = false;
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

  function renderMessage({ senderId, content, sentAt }, append = true) {
    currentUserId = parseInt(currentUserId, 10);
    senderId = parseInt(senderId, 10);
    const isOwnMessage = senderId === currentUserId;
    const div = document.createElement('div');
    div.className = `chat-message ${isOwnMessage ? 'own' : ''}`;
    div.innerHTML = `
    <div class="sender">${isOwnMessage ? 'You' : activeUserName}</div>
    <div class="message">${content}</div>
    <div class="time">${new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;
    if (append) {
      const wasNearBottom = isNearBottom(chatMessages);
      chatMessages.appendChild(div);
      if (wasNearBottom) {
        scrollToBottom();
      }
    } else {
      chatMessages.insertBefore(div, chatMessages.firstChild);
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
      socket.emit('join');
      fetchUsers();
      showSocketStatus(true);
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
    socket.on('disconnect', (reason) => {
      console.warn('Socket disconected:: ', reason);
      showSocketStatus(false, reason);
    });
  }
  connectSocket();
  window.addEventListener('beforeunload', () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });
  function showSocketStatus(isConnected, reason = '') {
    const statusBar = document.getElementById('socketStatus');
    if (!statusBar) return;
    if (isConnected) {
      statusBar.textContent = 'Kết nối thành công..';
      statusBar.style.background = '#d4edda';
    } else {
      statusBar.textContent = `Mất kết nối với server:: ${reason || 'Không rõ'}`;
      statusBar.style.background = '#f8d7da';
    }
    statusBar.style.display = 'inline-block';
    if (isConnected) {
      setTimeout(() => {
        statusBar.style.display = 'none';
      }, 5000);
    }
  }
});
