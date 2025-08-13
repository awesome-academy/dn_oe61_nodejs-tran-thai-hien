document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('tbody');
  const selectAll = document.getElementById('select-all');
  const currentUserEl = document.getElementById('currentUserConfig');
  const currentUser = currentUserEl
    ? JSON.parse(currentUserEl.dataset.currentUser)
    : null;
  const currentUserRole = currentUser?.role || 'USER';
  const paginationContainer = document.getElementById('paginationContainer');
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const searchInput = document.getElementById('inputSearch');
  const clearChangesBtn = document.getElementById('clearChangesBtn');
  let currentPage = 1;
  let pageSize = parseInt(pageSizeSelect?.value, 10) || 0;
  let users;
  let keySearch = '';
  const rawData = {};
  const pendingChanges = new Map();
  const updatePreviewButtonVisibility = () => {
    const previewBtn = document.getElementById('previewUpdatesBtn');
    if (!previewBtn) return;
    if (pendingChanges.size > 0) {
      previewBtn.style.display = 'inline-block';
    } else {
      previewBtn.style.display = 'none';
    }
  };
  const updateButtonClearChanges = () => {
    if (!clearChangesBtn) return;
    if (pendingChanges.size > 0) {
      clearChangesBtn.style.display = 'inline-block';
    } else {
      clearChangesBtn.style.display = 'none';
    }
  };
  function showErrorToast(message) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#f44336',
    }).showToast();
  }
  function debounce(fn, delay) {
    let timeoutid;
    return function (...args) {
      clearTimeout(timeoutid);
      timeoutid = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  async function fetchUsers(currentPage, pageSize, search) {
    try {
      const res = await fetch(
        `/admin/users?page=${currentPage}&pageSize=${pageSize}&search=${search}`,
        {
          credentials: 'include',
        },
      );
      const json = await res.json();
      if (res.status === 401) {
        showErrorToast(json.message || 'Phiên đăng nhập đã hết hạn.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      if (!json.success) throw new Error('Failed to fetch users');
      users = (json.payload.data || []).filter(
        (user) => user.id !== currentUser.sub,
      );
      paginations = json.payload.meta || {};
      const { currentPage: page, totalPages } = paginations;
      // fill rawData
      users.forEach((u) => {
        rawData[u.id] = { ...u };
      });
      renderTable(users);
      if (paginationContainer) {
        createPagination(paginationContainer, totalPages, page, (newPage) => {
          currentPage = newPage;
          fetchUsers(newPage, pageSize, keySearch);
        });
      }
    } catch (err) {
      console.error('Fetch users error', err);
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">Không thể tải danh sách người dùng</td></tr>';
    }
  }
  fetchUsers(currentPage, pageSize, keySearch);
  pageSizeSelect.addEventListener('change', () => {
    pageSize = parseInt(pageSizeSelect.value, 10);
    fetchUsers(currentPage, pageSize, keySearch);
  });
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((e) => {
        const searchTerm = e.target.value.trim();
        keySearch = searchTerm;
        fetchUsers(currentPage, pageSize, searchTerm);
      }, 300),
    );
  }
  clearChangesBtn.addEventListener('click', () => {
    pendingChanges.clear();
    document.querySelectorAll('tbody tr').forEach((tr) => {
      const userId = tr.dataset.userId;
      const checkbox = tr.querySelector('.user-checkbox');
      const roleSelect = tr.querySelector('.role-select');
      const statusSelectElem = tr.querySelector('.status-select');
      const verifySelectElem = tr.querySelector('.verify-select');
      if (checkbox) checkbox.checked = false;
      const original = {
        role: rawData[userId]?.role || 'USER',
        status: rawData[userId]?.status || 'PENDING',
        isVerified: String(Boolean(rawData[userId]?.isVerified)),
      };

      if (roleSelect) {
        roleSelect.value = original.role;
        roleSelect.disabled = true;
      }
      if (statusSelectElem) {
        statusSelectElem.value = original.status;
        statusSelectElem.disabled = true;
      }
      if (verifySelectElem) {
        verifySelectElem.value = original.isVerified;
        verifySelectElem.disabled = true;
      }
    });
    updatePreviewButtonVisibility();
    updateButtonClearChanges();
  });
  function renderTable(users) {
    tableBody.innerHTML = '';
    users.forEach((user) => {
      const pendingChange = pendingChanges.get(user.id);
      const displayUser = pendingChange ? { ...user, ...pendingChange } : user;
      const tr = document.createElement('tr');
      tr.dataset.userId = String(displayUser.id);

      const tdCheck = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'user-checkbox';
      checkbox.dataset.id = displayUser.id;
      tdCheck.appendChild(checkbox);
      tr.appendChild(tdCheck);

      // ID
      const tdId = document.createElement('td');
      tdId.textContent = displayUser.id;
      tr.appendChild(tdId);

      // User info
      const tdUser = document.createElement('td');
      tdUser.className = 'd-flex align-items-center';
      tdUser.innerHTML = `
      <img src="/images/default-avatar.png" alt="avatar" class="rounded-circle me-2" width="40" height="40">
      <div>
        <strong>${escapeHtml(displayUser.name)}</strong>
        <div class="text-muted small">@${escapeHtml(displayUser.userName)}</div>
      </div>
    `;
      tr.appendChild(tdUser);

      // Email
      const tdEmail = document.createElement('td');
      tdEmail.textContent = displayUser.email || '';
      tr.appendChild(tdEmail);

      // Role column
      const tdRole = document.createElement('td');
      if (currentUserRole === 'ADMIN') {
        const roleSel = document.createElement('select');
        roleSel.className = 'form-select form-select-sm role-select';
        roleSel.disabled = true;
        ['USER', 'MODERATOR', 'ADMIN'].forEach((r) => {
          const op = document.createElement('option');
          op.value = r;
          op.textContent = r.charAt(0) + r.slice(1).toLowerCase();
          if ((displayUser.role || 'USER') === r) op.selected = true;
          roleSel.appendChild(op);
        });
        tdRole.appendChild(roleSel);
      } else {
        const span = document.createElement('span');
        span.className = roleBadgeClass(displayUser.role);
        span.textContent = displayUser.role || 'USER';
        tdRole.appendChild(span);
      }
      tr.appendChild(tdRole);

      // Status column
      const tdStatus = document.createElement('td');
      const statusSel = document.createElement('select');
      statusSel.className = 'form-select form-select-sm status-select';
      statusSel.disabled = true;
      ['ACTIVE', 'PENDING', 'DEACTIVED'].forEach((s) => {
        const op = document.createElement('option');
        op.value = s;
        op.textContent = s.charAt(0) + s.slice(1).toLowerCase();
        if ((displayUser.status || 'PENDING') === s) op.selected = true;
        statusSel.appendChild(op);
      });
      tdStatus.appendChild(statusSel);
      tr.appendChild(tdStatus);

      // Verified column
      const tdVerify = document.createElement('td');
      if (currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR') {
        const verifySel = document.createElement('select');
        verifySel.className = 'form-select form-select-sm verify-select';
        verifySel.disabled = true;
        const op1 = document.createElement('option');
        op1.value = 'true';
        op1.textContent = 'Verified';
        const op2 = document.createElement('option');
        op2.value = 'false';
        op2.textContent = 'Not Verified';
        verifySel.appendChild(op1);
        verifySel.appendChild(op2);
        verifySel.value = String(Boolean(displayUser.isVerified));
        tdVerify.appendChild(verifySel);
      } else {
        const span = document.createElement('span');
        span.className = displayUser.isVerified
          ? 'badge bg-primary'
          : 'badge bg-secondary';
        span.textContent = displayUser.isVerified ? 'Verified' : 'Not Verified';
        tdVerify.appendChild(span);
      }
      tr.appendChild(tdVerify);

      // Actions
      const tdActions = document.createElement('td');
      tdActions.innerHTML = `
      <button class="btn btn-outline-primary btn-sm me-1">Edit</button>
      <button class="btn btn-outline-danger btn-sm">Delete</button>
    `;
      tr.appendChild(tdActions);
      tableBody.appendChild(tr);

      const roleSelect = tr.querySelector('.role-select');
      const statusSelectElem = tr.querySelector('.status-select');
      const verifySelectElem = tr.querySelector('.verify-select');

      const original = {
        role: rawData[user.id]?.role || 'USER',
        status: rawData[user.id]?.status || 'PENDING',
        isVerified: String(Boolean(rawData[user.id]?.isVerified)),
      };

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          if (currentUserRole === 'ADMIN') {
            if (roleSelect) roleSelect.disabled = false;
            if (statusSelectElem) statusSelectElem.disabled = false;
            if (verifySelectElem) verifySelectElem.disabled = false;
          } else if (currentUserRole === 'MODERATOR') {
            if (statusSelectElem) statusSelectElem.disabled = false;
            if (verifySelectElem) verifySelectElem.disabled = false;
          }
        } else {
          if (roleSelect) {
            roleSelect.value = original.role;
            roleSelect.disabled = true;
          }
          if (statusSelectElem) {
            statusSelectElem.value = original.status;
            statusSelectElem.disabled = true;
          }
          if (verifySelectElem) {
            verifySelectElem.value = original.isVerified;
            verifySelectElem.disabled = true;
          }
          if (pendingChanges.has(user.id)) pendingChanges.delete(user.id);
          updatePreviewButtonVisibility();
          updateButtonClearChanges();
          consoleLogPending();
        }
      });
      const onSelectChange = () => {
        if (!checkbox.checked) return;
        const newRole = roleSelect ? roleSelect.value : null;
        const newStatus = statusSelectElem ? statusSelectElem.value : null;
        const newIsVerified = verifySelectElem
          ? String(verifySelectElem.value)
          : null;
        if (
          newRole !== original.role ||
          newStatus !== original.status ||
          newIsVerified !== original.isVerified
        ) {
          const changeData = { id: user.id };

          if (newRole !== original.role) {
            changeData.role = newRole;
          }
          if (newStatus !== original.status) {
            changeData.status = newStatus;
          }
          if (newIsVerified !== original.isVerified) {
            changeData.isVerified = newIsVerified === 'true';
          }

          pendingChanges.set(user.id, changeData);
        } else {
          pendingChanges.delete(user.id);
        }
        updatePreviewButtonVisibility();
        updateButtonClearChanges();
        consoleLogPending();
      };

      if (roleSelect) roleSelect.addEventListener('change', onSelectChange);
      if (statusSelectElem)
        statusSelectElem.addEventListener('change', onSelectChange);
      if (verifySelectElem)
        verifySelectElem.addEventListener('change', onSelectChange);
      if (pendingChanges.has(user.id)) {
        checkbox.checked = true;
        if (currentUserRole === 'ADMIN') {
          if (roleSelect) roleSelect.disabled = false;
          if (statusSelectElem) statusSelectElem.disabled = false;
          if (verifySelectElem) verifySelectElem.disabled = false;
        } else if (currentUserRole === 'MODERATOR') {
          if (statusSelectElem) statusSelectElem.disabled = false;
          if (verifySelectElem) verifySelectElem.disabled = false;
        }
      }
    });
    if (selectAll) {
      selectAll.checked = false;
      selectAll.addEventListener('change', () => {
        const checked = selectAll.checked;
        document.querySelectorAll('.user-checkbox').forEach((cb) => {
          cb.checked = checked;
          cb.dispatchEvent(new Event('change'));
        });
      });
    }
  }
  function consoleLogPending() {
    console.log('Pending changes:', Array.from(pendingChanges.values()));
  }
  function roleBadgeClass(role) {
    switch (role) {
      case 'ADMIN':
        return 'badge bg-info text-dark';
      case 'MODERATOR':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-success';
    }
  }
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  document.getElementById('previewUpdatesBtn').addEventListener('click', () => {
    const tbody = document.getElementById('previewTableBody');
    tbody.innerHTML = '';
    pendingChanges.forEach((changes, id) => {
      const original = rawData[id];
      const diffTexts = [];
      if (changes.role)
        diffTexts.push(`Role: ${original.role} → ${changes.role}`);
      if (changes.status)
        diffTexts.push(`Status: ${original.status} → ${changes.status}`);
      if ('isVerified' in changes)
        diffTexts.push(
          `Verified: ${original.isVerified} → ${changes.isVerified}`,
        );
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" class="preview-checkbox" data-id="${id}" checked></td>
        <td>${id}</td>
        <td>${original.userName}</td>
        <td>${diffTexts.join('<br>')}</td>
      `;
      tbody.appendChild(tr);
    });
    const previewCheckboxes = tbody.querySelectorAll('.preview-checkbox');
    previewCheckboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        const checkedCount = tbody.querySelectorAll(
          '.preview-checkbox:checked',
        ).length;
        document.getElementById('confirmUpdateBtn').disabled =
          checkedCount === 0;
      });
    });
    document.getElementById('confirmUpdateBtn').disabled =
      previewCheckboxes.length === 0;
    new bootstrap.Modal(document.getElementById('updatePreviewModal')).show();
  });
  document
    .getElementById('confirmUpdateBtn')
    .addEventListener('click', async () => {
      const selectedIds = Array.from(
        document.querySelectorAll('.preview-checkbox:checked'),
      ).map((cb) => parseInt(cb.dataset.id));
      const updates = selectedIds.map((id) => pendingChanges.get(id));
      const res = await fetch('/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          users: updates,
        }),
      });
      const json = await res.json();
      if (res.status === 401) {
        showErrorToast(json.message || 'Phiên đăng nhập đã hết hạn.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      if (res.status >= 400 && res.status < 500) {
        showErrorToast(json.message || 'Yêu cầu không hợp lệ.');
        return;
      }
      if (!res.ok) {
        showErrorToast(json.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }
      if (res.ok && json.success) {
        Toastify({
          text: json.message,
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: '#4CAF50',
        }).showToast();
        const usersUpadted = json?.payload || [];
        usersUpadted.forEach((userUpdate) => {
          const userIdx = users.findIndex((user) => user.id === userUpdate.id);
          if (userIdx !== -1) {
            users[userIdx] = userUpdate;
            rawData[userUpdate.id] = { ...userUpdate };
          }
        });
        renderTable(users);
        document.querySelectorAll('.user-checkbox').forEach((cb) => {
          cb.checked = false;
          cb.dispatchEvent(new Event('change'));
        });
        pendingChanges.clear();
        updatePreviewButtonVisibility();
        updateButtonClearChanges();
        const modalEl = document.getElementById('updatePreviewModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      } else {
        alert(json.message || 'Update failed');
      }
    });
});
