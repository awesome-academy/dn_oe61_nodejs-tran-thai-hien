document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('tbody');
  const paginationContainer = document.getElementById('paginationContainer');
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const searchInput = document.getElementById('inputSearch');
  const startDateInput = document.getElementById('startDate'); // input type="date"
  const endDateInput = document.getElementById('endDate'); // input type="date"
  const sortBySelect = document.getElementById('sortBySelect');
  const statusContainer = document.getElementById('statusFilterContainer');
  const statusesEl = document.getElementById('bookingStatutesConfig');
  const statuses = statusesEl ? JSON.parse(statusesEl.dataset.statuses) : null;
  console.log('Statustes:: ', statuses);
  let currentPage = 1;
  let pageSize = parseInt(pageSizeSelect?.value, 10) || 10;
  let bookings = [];
  let selectedStatuses = new Set();
  const state = {
    keySearch: '',
    startDate: '',
    endDate: '',
    sortBy: '',
    direction: '',
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
  async function fetchAndRenderStatusCounts(keySearch, startDate, endDate) {
    try {
      LoadingOverlay.show();
      const params = new URLSearchParams();
      if (keySearch) params.append('spaceName', keySearch);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await fetch(`/bookings/status?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || 'Failed to fetch status counts');
      const counts = json.payload.counts;

      const allStatuses = statuses;
      statusContainer.innerHTML = '';

      for (const status of allStatuses) {
        const count = counts[status] ?? 0;

        const checkboxId = `status-${status.toLowerCase()}`;

        const wrapper = document.createElement('label');
        wrapper.className =
          'status-checkbox d-inline-flex align-items-center me-3 cursor-pointer';
        wrapper.style.gap = '0.25rem';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = status;
        checkbox.checked = selectedStatuses.has(status);

        checkbox.addEventListener('change', () => {
          if (checkbox.checked) selectedStatuses.add(status);
          else selectedStatuses.delete(status);
          updateData();
        });

        const badge = document.createElement('span');
        badge.className = statusBadgeClass(status);
        badge.style.marginLeft = '0.3rem';
        badge.textContent = count; // hiển thị cả 0

        const labelText = document.createTextNode(status);

        wrapper.appendChild(checkbox);
        wrapper.appendChild(labelText);
        wrapper.appendChild(badge);

        statusContainer.appendChild(wrapper);
      }
    } catch (err) {
      console.error('Error fetching status counts:', err);
      statusContainer.textContent = 'Failed to load status data';
    } finally {
      LoadingOverlay.hide();
    }
  }

  async function fetchBookings(
    page,
    size,
    search,
    start,
    end,
    statuses,
    sortBy,
    direction,
  ) {
    try {
      LoadingOverlay.show();
      const statusFilter = Array.from(statuses);
      console.log('Status filteR:: ', statusFilter);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('pageSize', size);
      if (search) params.append('spaceName', search);
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (statuses && statuses.size > 0) {
        statuses.forEach((status) => {
          params.append('statuses', status);
        });
      }
      if (sortBy) params.append('sortBy', sortBy);
      if (direction) params.append('direction', direction);
      const res = await fetch(`/bookings?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();

      if (res.status === 401) {
        showErrorToast(json.message || 'Phiên đăng nhập đã hết hạn.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      if (!json.success)
        throw new Error(json.message || 'Failed to fetch bookings');

      bookings = json.payload.data || [];
      const meta = json.payload.meta || {};
      const { currentPage: pageFetched = 1, totalPages = 1 } = meta;

      renderTable(bookings);

      if (paginationContainer) {
        createPagination(
          paginationContainer,
          totalPages,
          pageFetched,
          (newPage) => {
            currentPage = newPage;
            fetchBookings(
              currentPage,
              pageSize,
              state.keySearch,
              state.startDate,
              state.endDate,
              selectedStatuses,
              state.sortBy,
              state.direction,
            );
          },
        );
      }
    } catch (err) {
      console.error('Fetch bookings error', err);
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">Unable to load booking list</td></tr>';
    } finally {
      LoadingOverlay.hide();
    }
  }
  function statusBadgeClass(status) {
    switch (status) {
      case 'CANCELED':
        return 'badge bg-danger';
      case 'PENDING':
        return 'badge bg-warning text-dark';
      case 'CONFIRMED':
        return 'badge bg-primary';
      case 'REJECTED':
        return 'badge bg-danger';
      case 'COMPLETED':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }
  function renderTable(bookings) {
    tableBody.innerHTML = '';

    if (bookings.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="10" class="text-center">There are no bookings</td></tr>';
      return;
    }
    bookings.forEach((booking) => {
      const tr = document.createElement('tr');

      // Checkbox
      const tdCheck = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'venue-checkbox';
      checkbox.dataset.id = booking.id;
      tdCheck.appendChild(checkbox);
      tr.appendChild(tdCheck);

      // ID
      const tdId = document.createElement('td');
      tdId.textContent = booking.id;
      tr.appendChild(tdId);

      // Space Name
      const tdSpaceName = document.createElement('td');
      tdSpaceName.textContent = booking.space?.name || '';
      tr.appendChild(tdSpaceName);

      // Type (space type)
      const tdType = document.createElement('td');
      tdType.textContent = booking.space?.type || '';
      tr.appendChild(tdType);

      // Address
      const tdAddress = document.createElement('td');
      tdAddress.textContent = booking.space?.venueName || '';
      tr.appendChild(tdAddress);

      // Start - End Time
      const tdTime = document.createElement('td');
      tdTime.textContent = `${formatDateTime(booking.startTime)} - ${formatDateTime(booking.endTime)}`;
      tr.appendChild(tdTime);

      // Total Price
      const tdPrice = document.createElement('td');
      tdPrice.textContent = formatCurrency(booking.totalPrice);
      tr.appendChild(tdPrice);

      // Owner (user name)
      const tdOwner = document.createElement('td');
      tdOwner.textContent = booking.user?.name || '';
      tr.appendChild(tdOwner);

      // Status
      const tdStatus = document.createElement('td');
      const spanStatus = document.createElement('span');
      spanStatus.textContent = booking.status || '';
      spanStatus.className = statusBadgeClass(booking.status);
      tdStatus.appendChild(spanStatus);
      tr.appendChild(tdStatus);
      const tdActions = document.createElement('td');
      const btnView = document.createElement('button');
      btnView.textContent = 'View';
      btnView.className = 'btn btn-outline-info btn-sm me-1 view-venue-btn';
      tdActions.appendChild(btnView);
      tr.appendChild(tdActions);

      tableBody.appendChild(tr);
    });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  function formatCurrency(value) {
    if (typeof value !== 'number') return '';
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  }
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  pageSizeSelect.addEventListener('change', () => {
    pageSize = parseInt(pageSizeSelect.value, 10);
    fetchBookings(
      currentPage,
      pageSize,
      state.keySearch,
      state.startDate,
      state.endDate,
      selectedStatuses,
      state.sortBy,
      state.direction,
    );
  });
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      const val = e.target.value || '';
      const [field = '', dir = 'asc'] = val.split('_');
      const allowedFields = ['startTime', 'totalPrice'];
      const allowedDirs = ['asc', 'desc'];
      if (allowedFields.includes(field) && allowedDirs.includes(dir)) {
        state.sortBy = field;
        state.direction = dir;
      } else {
        state.sortBy = '';
        state.direction = '';
      }
      fetchBookings(
        currentPage,
        pageSize,
        state.keySearch,
        state.startDate,
        state.endDate,
        selectedStatuses,
        state.sortBy,
        state.direction,
      );
    });
  }
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((e) => {
        state.keySearch = e.target.value.trim();
        updateData();
      }, 300),
    );
  }

  if (startDateInput) {
    startDateInput.addEventListener('change', (e) => {
      state.startDate = e.target.value;
      updateData();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', (e) => {
      state.endDate = e.target.value;
      updateData();
    });
  }
  updateData();
  function updateData() {
    fetchBookings(
      currentPage,
      pageSize,
      state.keySearch,
      state.startDate,
      state.endDate,
      selectedStatuses,
      state.sortBy,
      state.direction,
    );
    fetchAndRenderStatusCounts(state.keySearch, state.startDate, state.endDate);
  }
});
