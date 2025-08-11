let userId = null;
let currentPage = 1;
let isLoading = false;
let totalPages = 1;
let socketInstance = null;
const socketUrl = document.getElementById('socketConfig')?.dataset.socketUrl;
function showToast(message, type = 'info') {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    backgroundColor:
      type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff',
    stopOnFocus: true,
  }).showToast();
}
document.querySelector('#logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  LoadingOverlay.show();
  try {
    const res = await fetch('/users/logout', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();

    if (res.ok) {
      showToast(data.message || 'Logout successfully', 'success');
    } else {
      showToast(data.message || 'Logout failed', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Logout error, please try again', 'error');
  } finally {
    LoadingOverlay.hide();
    setTimeout(() => (window.location.href = '/login'), 1500);
  }
});

async function loadUserProfile() {
  try {
    const res = await fetch(`/users/profile`, { credentials: 'include' });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error(`Lỗi khi lấy profile: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      alert(data.message || 'Không lấy được dữ liệu user');
      return;
    }

    const user = data.payload;
    const navLink = document.querySelector('.nav-link.dropdown-toggle');
    if (navLink) {
      navLink.innerHTML = `<i class="fas fa-user-circle me-1"></i> ${user.name}`;
    }
    userId = user.id;
    loadNotifications();
    connectSocket(userId);
  } catch (err) {
    console.error('Profile error:', err);
  }
}

async function loadNotifications(page = 1) {
  if (isLoading || page > totalPages) return;
  isLoading = true;

  try {
    const res = await fetch(`/notifications/me?page=${page}`, {
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    if (!res.ok) throw new Error(`Lỗi khi load thông báo: ${res.status}`);

    const data = await res.json();
    if (data.success) {
      const { data: notifications, meta } = data.payload;
      totalPages = meta.totalPages;
      renderNotifications(notifications, true);
      updateBadgeCount();
      currentPage++;
    } else {
      throw new Error(data.message || 'Không load được thông báo');
    }
  } catch (err) {
    console.error('Load notifications error:', err);
  } finally {
    isLoading = false;
  }
}

function createNotificationItem(notif) {
  const li = document.createElement('li');
  li.classList.add('px-3', 'py-2', 'notification-item');
  if (!notif.isRead) li.classList.add('bg-light');
  li.style.cursor = 'pointer';
  li.dataset.id = notif.id;

  li.innerHTML = `
    <div>
      <strong>
        ${notif.title}
        ${!notif.isRead ? '<span class="dot ms-1"></span>' : ''}
      </strong>
      <div class="small text-muted">${new Date(notif.createdAt).toLocaleString()}</div>
      <div>${notif.message}</div>
    </div>
  `;
  return li;
}

function renderNotifications(list, append = false) {
  const dropdown = document.getElementById('notificationDropdown');
  if (!dropdown) return;

  const emptyState = dropdown.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  if (!append) dropdown.innerHTML = '';

  if (list.length === 0 && !append) {
    dropdown.innerHTML =
      '<li class="text-center text-muted py-2">No notifications</li>';
    return;
  }

  for (const notif of list) {
    const li = createNotificationItem(notif);
    dropdown.appendChild(li);
  }
}

async function updateBadgeCount() {
  try {
    const res = await fetch('/notifications/unread-count', {
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    if (!res.ok)
      throw new Error(`Lỗi khi lấy số thông báo chưa đọc: ${res.status}`);
    const data = await res.json();
    if (data.success) {
      const unread = data.payload;
      const badge = document.getElementById('notificationBadge');
      if (badge) {
        badge.innerText = unread;
        badge.style.display = unread > 0 ? 'inline' : 'none';
      } else {
        console.warn('notificationBadge element not found in DOM');
      }
    }
  } catch (err) {
    console.error('Badge count error:', err);
  }
}

async function markAsRead(id, element) {
  try {
    const res = await fetch(`/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`Lỗi khi đánh dấu đã đọc: ${res.status}`);

    if (element) {
      element.classList.remove('bg-light');
    }
    const dot = element.querySelector('.dot');
    if (dot) {
      dot.remove();
    }
    updateBadgeCount();
  } catch (err) {
    console.error('Mark read error:', err);
  }
}

function connectSocket(userId) {
  if (!socketUrl) {
    console.warn('socketUrl is not defined');
    return;
  }
  if (socketInstance && socketInstance.connected) {
    console.log('Socket already connected');
    return;
  }
  socketInstance = io(`${socketUrl}/notification`, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socketInstance.on('connect', () => {
    showSocketStatus('connected');
    socketInstance.emit('join');
  });
  socketInstance.on(`newNotification`, (notif) => {
    prependNotification(notif);
  });
  socketInstance.on('reconnect_attempt', (attempt) => {
    showSocketStatus('reconnecting');
  });
  socketInstance.on('reconnect_failed', () => {
    showSocketStatus('failed');
  });
  socketInstance.on('disconnected', () => {
    showSocketStatus('disconnected');
  });
}
function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
function showSocketStatus(status) {
  const statusEl = document.getElementById('socketStatus');
  if (!statusEl) return;
  if (status === 'connected') {
    statusEl.innerText = 'Đã kết nối';
    statusEl.style.color = 'green';
    statusEl.style.background = '#d4edda';
  } else if (status === 'disconnected') {
    statusEl.innerText = 'Mất kết nối';
    statusEl.style.color = 'red';
    statusEl.style.background = '#f8d7da';
  } else if (status === 'reconnecting') {
    statusEl.innerText = 'Đang kết nối lại...';
    statusEl.style.color = 'orange';
    statusEl.style.background = '#fff3cd';
  } else if (status === 'failed') {
    statusEl.innerText = 'Không thể kết nối lại';
    statusEl.style.color = 'gray';
    statusEl.style.background = '#f5c6cb';
  }
  statusEl.style.display = 'block';
  statusEl.style.padding = '8px 12px';
  statusEl.style.marginBottom = '8px';
  statusEl.style.borderRadius = '4px';
  statusEl.style.fontWeight = 'bold';
  statusEl.style.transition = 'opacity 0.5s ease';
  if (status === 'connected') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }
}

function prependNotification(notif) {
  const dropdown = document.getElementById('notificationDropdown');
  if (!dropdown) return;

  const emptyState = dropdown.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const li = createNotificationItem(notif);
  dropdown.prepend(li);
  updateBadgeCount();
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  document.addEventListener('click', function (e) {
    const item = e.target.closest('.notification-item');
    if (item && item.dataset.id) {
      markAsRead(item.dataset.id, item);
    }
  });

  const dropdown = document.getElementById('notificationDropdown');
  if (dropdown) {
    dropdown.addEventListener('scroll', function () {
      if (this.scrollTop + this.clientHeight >= this.scrollHeight - 5) {
        loadNotifications(currentPage);
      }
    });
  } else {
    console.warn('notificationDropdown element not found in DOM');
  }
});
