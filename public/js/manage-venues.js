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
  let selectedVenueId = null;
  let selectedAction = null;
  const confirmModalEl = document.getElementById('confirmActionModal');
  const confirmModal = new bootstrap.Modal(confirmModalEl);
  const confirmActionTitle = document.getElementById('confirmActionTitle');
  const confirmActionMessage = document.getElementById('confirmActionMessage');
  const confirmActionBtn = document.getElementById('confirmActionBtn');
  const blockReasonContainer = document.getElementById('blockReasonContainer');
  const blockReasonInput = document.getElementById('blockReason');
  let currentPage = 1;
  let pageSize = parseInt(pageSizeSelect?.value, 10) || 10;
  let venues = [];
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
  function updateData() {
    fetchVenues(currentPage, pageSize, keySearch);
  }
  const triggerUpdate = debounce(updateData, 600);
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view-venue-btn')) {
      const venueId = e.target.getAttribute('data-venue-id');
      console.log('abc click', venueId);
      window.location.href = `/dashboard/venues/${venueId}`;
    }
  });
  document.addEventListener('click', function (e) {
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('approve-venue-btn')) {
        blockReasonContainer.style.display = 'none';
        selectedVenueId = e.target.getAttribute('data-venue-id');
        const venueName = e.target.getAttribute('data-venue-name');
        const ownerName = e.target.getAttribute('data-owner-name');
        console.log('SelectedVenueName:: ', venueName);
        selectedAction = 'approve';
        confirmActionTitle.textContent = 'Approve Venue';
        confirmActionMessage.innerHTML = `Are you sure you want to approve venue <strong>${venueName}</strong> owned by <strong>${ownerName}</strong>?`;
        confirmActionBtn.className = 'btn btn-success';
        confirmModal.show();
      }
    });
    if (e.target.classList.contains('block-venue-btn')) {
      blockReasonContainer.style.display = 'block';
      blockReasonInput.value = '';
      selectedVenueId = e.target.getAttribute('data-venue-id');
      const venueName = e.target.getAttribute('data-venue-name');
      const ownerName = e.target.getAttribute('data-owner-name');
      selectedAction = 'block';
      console.log('SelectedVenueId:: ', selectedVenueId);
      confirmActionTitle.textContent = 'Block Venue';
      confirmActionMessage.innerHTML = `Are you sure you want to block venue <strong>${venueName}</strong> owned by <strong>${ownerName}</strong>?`;
      confirmActionBtn.className = 'btn btn-danger';
      confirmModal.show();
    }
  });
  async function fetchVenues(currentPage, pageSize, search) {
    try {
      LoadingOverlay.show();
      const res = await fetch(
        `/admin/venues?page=${currentPage}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
        { credentials: 'include' },
      );
      const json = await res.json();

      if (res.status === 401) {
        showErrorToast(json.message || 'Phiên đăng nhập đã hết hạn.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }

      if (!json.success) throw new Error('Failed to fetch venues');

      venues = json.payload.data || [];
      const paginations = json.payload.meta || {};
      const { currentPage: page, totalPages } = paginations;

      venues.forEach((v) => {
        rawData[v.id] = { ...v };
      });

      renderTable(venues);

      if (paginationContainer) {
        createPagination(paginationContainer, totalPages, page, (newPage) => {
          currentPage = newPage;
          fetchVenues(newPage, pageSize, keySearch);
        });
      }
    } catch (err) {
      console.error('Fetch venues error', err);
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">Không thể tải danh sách venues</td></tr>';
    } finally {
      LoadingOverlay.hide();
    }
  }

  fetchVenues(currentPage, pageSize, keySearch);

  pageSizeSelect.addEventListener('change', () => {
    pageSize = parseInt(pageSizeSelect.value, 10);
    triggerUpdate();
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.trim();
      keySearch = searchTerm;
      triggerUpdate();
    });
  }

  clearChangesBtn.addEventListener('click', () => {
    pendingChanges.clear();
    document.querySelectorAll('tbody tr').forEach((tr) => {
      const venueId = tr.dataset.venueId;
      const checkbox = tr.querySelector('.venue-checkbox');
      const statusSelectElem = tr.querySelector('.status-select');

      if (checkbox) checkbox.checked = false;

      const original = {
        status: rawData[venueId]?.status || 'PENDING',
      };

      if (statusSelectElem) {
        statusSelectElem.value = original.status;
        statusSelectElem.disabled = true;
      }
    });
    updatePreviewButtonVisibility();
    updateButtonClearChanges();
  });

  function renderTable(venues) {
    tableBody.innerHTML = '';
    venues.forEach((venue) => {
      const pendingChange = pendingChanges.get(venue.id);
      const displayVenue = pendingChange
        ? { ...venue, ...pendingChange }
        : venue;

      const tr = document.createElement('tr');
      tr.dataset.venueId = String(displayVenue.id);
      const tdCheck = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'venue-checkbox';
      checkbox.dataset.id = displayVenue.id;
      tdCheck.appendChild(checkbox);
      tr.appendChild(tdCheck);

      const tdId = document.createElement('td');
      tdId.textContent = displayVenue.id;
      tr.appendChild(tdId);

      const tdName = document.createElement('td');
      tdName.textContent = displayVenue.name || '';
      tr.appendChild(tdName);

      const tdOwner = document.createElement('td');
      tdOwner.textContent = displayVenue.ownerName || '';
      tr.appendChild(tdOwner);

      const tdStreet = document.createElement('td');
      tdStreet.textContent = displayVenue.street || '';
      tr.appendChild(tdStreet);

      const tdCity = document.createElement('td');
      tdCity.textContent = displayVenue.city || '';
      tr.appendChild(tdCity);

      const tdStatus = document.createElement('td');
      const limitedStatuses = ['PENDING', 'APPROVED'];

      let statusSel = null;
      function statusBadgeClass(status) {
        switch (status) {
          case 'APPROVED':
            return 'badge bg-success';
          case 'PENDING':
            return 'badge bg-warning text-dark';
          case 'BLOCKED':
            return 'badge bg-danger';
          default:
            return 'badge bg-secondary';
        }
      }
      function renderStatusOptions(selectElem, statuses, currentStatus) {
        selectElem.innerHTML = '';
        statuses.forEach((s) => {
          const op = document.createElement('option');
          op.value = s;
          op.textContent = s.charAt(0) + s.slice(1).toLowerCase();
          if (currentStatus === s) op.selected = true;
          selectElem.appendChild(op);
        });
      }

      if (displayVenue.status === 'PENDING') {
        statusSel = document.createElement('select');
        statusSel.className = 'form-select form-select-sm status-select';
        statusSel.disabled = true;
        renderStatusOptions(statusSel, limitedStatuses, venue.status);
        tdStatus.appendChild(statusSel);
      } else {
        statusSel = null;
        const span = document.createElement('span');
        span.className = statusBadgeClass(displayVenue.status);
        span.textContent =
          displayVenue.status.charAt(0) +
          displayVenue.status.slice(1).toLowerCase();
        tdStatus.appendChild(span);
      }
      tr.appendChild(tdStatus);
      // Actions
      const tdActions = document.createElement('td');

      if (currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR') {
        tdActions.innerHTML = `
    <button class="btn btn-outline-info btn-sm me-1 view-venue-btn" type="button" data-venue-id="${displayVenue.id}">View</button>
  `;

        if (displayVenue.status === 'PENDING') {
          tdActions.innerHTML += `
      <button class="btn btn-outline-success btn-sm approve-venue-btn" type="button" data-venue-id="${displayVenue.id}" data-venue-name="${displayVenue.name}" data-owner-name="${displayVenue.ownerName}">Approve</button>
    `;
        } else if (displayVenue.status === 'APPROVED') {
          tdActions.innerHTML += `
      <button class="btn btn-outline-danger btn-sm block-venue-btn" type="button" data-venue-id="${displayVenue.id}" data-venue-name="${displayVenue.name}" data-owner-name="${displayVenue.ownerName}">Block</button>
    `;
        }
      }

      tr.appendChild(tdActions);

      tableBody.appendChild(tr);

      checkbox.addEventListener('change', () => {
        if (!statusSel) return;

        if (checkbox.checked) {
          if (currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR') {
            statusSel.disabled = false;
            if (!limitedStatuses.includes(statusSel.value)) {
              statusSel.value = 'PENDING';
            }
            renderStatusOptions(statusSel, limitedStatuses, statusSel.value);
          }
        } else {
          renderStatusOptions(
            statusSel,
            limitedStatuses,
            rawData[venue.id]?.status || 'PENDING',
          );
          statusSel.disabled = true;
          if (pendingChanges.has(venue.id)) pendingChanges.delete(venue.id);
          updatePreviewButtonVisibility();
          updateButtonClearChanges();
          consoleLogPending();
        }
      });

      if (statusSel) {
        statusSel.addEventListener('change', () => {
          if (!checkbox.checked) return;
          const newStatus = statusSel.value;
          const originalStatus = rawData[venue.id]?.status || 'PENDING';

          if (newStatus !== originalStatus) {
            pendingChanges.set(venue.id, { id: venue.id, status: newStatus });
          } else {
            pendingChanges.delete(venue.id);
          }
          updatePreviewButtonVisibility();
          updateButtonClearChanges();
          consoleLogPending();
        });
      }

      if (pendingChanges.has(venue.id)) {
        checkbox.checked = true;
        if (
          statusSel &&
          (currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR')
        ) {
          statusSel.disabled = false;
        }
      }
    });

    if (selectAll) {
      selectAll.checked = false;
      selectAll.addEventListener('change', () => {
        const checked = selectAll.checked;
        document.querySelectorAll('.venue-checkbox').forEach((cb) => {
          cb.checked = checked;
          cb.dispatchEvent(new Event('change'));
        });
      });
    }
  }

  function consoleLogPending() {
    console.log('Pending changes:', Array.from(pendingChanges.values()));
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

      if (changes.status)
        diffTexts.push(`Status: ${original.status} → ${changes.status}`);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" class="preview-checkbox" data-id="${id}" checked></td>
        <td>${id}</td>
        <td>${escapeHtml(original.name)}</td>
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
      console.log('Updates venues:: ', updates);

      try {
        const res = await fetch('/admin/venues/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            venues: updates,
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
          const venuesUpdated = json?.payload || [];
          venuesUpdated.forEach((venueUpdate) => {
            const venueIdx = venues.findIndex((v) => v.id === venueUpdate.id);
            if (venueIdx !== -1) {
              venues[venueIdx] = venueUpdate;
              rawData[venueUpdate.id] = { ...venueUpdate };
            }
          });
          renderTable(venues);
          document.querySelectorAll('.venue-checkbox').forEach((cb) => {
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
      } catch (err) {
        console.error('Update venues error:', err);
        showErrorToast('Có lỗi xảy ra khi cập nhật');
      }
    });
  confirmActionBtn.addEventListener('click', async function () {
    if (!selectedVenueId || !selectedAction) return;

    let statusUpdated;
    if (selectedAction === 'approve') {
      statusUpdated = 'APPROVED';
    } else if (selectedAction === 'block') {
      statusUpdated = 'BLOCKED';
    }
    let reason = null;
    if (selectedAction === 'block') {
      reason = blockReasonInput.value.trim();
      if (!reason) {
        alert('Please provide a reason for blocking.');
        return;
      }
    }
    try {
      const res = await fetch(
        `/admin/venues/${selectedVenueId}/${selectedAction}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusUpdated, reason }),
        },
      );

      const data = await res.json();
      if (res.status === 401) {
        showErrorToast(data.message || 'Phiên đăng nhập đã hết hạn.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      if (res.status >= 400 && res.status < 500) {
        showErrorToast(data.message || 'Yêu cầu không hợp lệ.');
        return;
      }
      if (!res.ok) {
        showErrorToast(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }
      if (data.success) {
        Toastify({
          text: `${selectedAction.toUpperCase()} successful!`,
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'green',
        }).showToast();
        const venueUpdated = data.payload;
        const venueIdx = venues.findIndex((v) => v.id === venueUpdated.id);
        if (venueIdx != -1) {
          venues[venueIdx] = venueUpdated;
          rawData[venueUpdated.id] = { ...venueUpdated };
        }
        renderTable(venues);
        document.querySelectorAll('.venue-checkbox').forEach((cb) => {
          cb.checked = false;
          cb.dispatchEvent(new Event('change'));
        });
        pendingChanges.clear();
        updatePreviewButtonVisibility();
        updateButtonClearChanges();
        if (confirmModal) confirmModal.hide();
      } else {
        alert(data.message || 'Action failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Action failed due to a network error.');
    }
  });
});
