document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('tbody');
  const paginationContainer = document.getElementById('paginationContainer');
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const searchInput = document.getElementById('inputSearch');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const sortBySelect = document.getElementById('sortBySelect');
  const statusContainer = document.getElementById('statusFilterContainer');
  const paymentState = {
    currentPage: 1,
    pageSize: parseInt(pageSizeSelect?.value, 10) || 10,
    payments: [],
    selectedStatuses: new Set(),
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
  const triggerUpdate = debounce(updateData, 600);

  async function fetchAndRenderStatusCounts(keySearch, startDate, endDate) {
    try {
      LoadingOverlay.show();
      if (!statusContainer) throw Error('Status container is not defined');
      const params = new URLSearchParams();
      if (keySearch) params.append('spaceName', keySearch);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await fetch(`/payments/status?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || 'Failed to fetch status counts');
      const counts = json.payload.counts;

      const allStatuses = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];

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
        checkbox.checked = paymentState.selectedStatuses.has(status);

        checkbox.addEventListener('change', () => {
          if (checkbox.checked) paymentState.selectedStatuses.add(status);
          else paymentState.selectedStatuses.delete(status);
          updateData();
        });

        const badge = document.createElement('span');
        badge.className = statusBadgeClass(status);
        badge.style.marginLeft = '0.3rem';
        badge.textContent = count;

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
  async function fetchPayments(
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

      const res = await fetch(`/payments/history?${params.toString()}`, {
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
        throw new Error(json.message || 'Failed to fetch payments');

      paymentState.payments = json.payload.data || [];
      const meta = json.payload.meta || {};
      const { currentPage: pageFetched = 1, totalPages = 1 } = meta;
      renderTable(paymentState.payments);

      if (paginationContainer) {
        createPagination(
          paginationContainer,
          totalPages,
          pageFetched,
          (newPage) => {
            paymentState.currentPage = newPage;
            fetchPayments(
              paymentState.currentPage,
              paymentState.pageSize,
              paymentState.keySearch,
              paymentState.startDate,
              paymentState.endDate,
              paymentState.selectedStatuses,
              sortBy,
              direction,
            );
          },
        );
      }
    } catch (err) {
      console.error('Fetch payments error', err);
      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="9" class="text-center text-danger">Unable to load payment list</td></tr>';
      }
    } finally {
      LoadingOverlay.hide();
    }
  }

  function statusBadgeClass(status) {
    switch (status) {
      case 'PAID':
        return 'badge bg-success';
      case 'PENDING':
        return 'badge bg-warning text-dark';
      case 'FAILED':
        return 'badge bg-danger';
      case 'REFUNDED':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }

  function renderTable(payments) {
    if (!tableBody) {
      alert('Table is not defined');
      return;
    }
    tableBody.innerHTML = '';
    if (payments.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="9" class="text-center">There are no payments</td></tr>';
      return;
    }
    payments.forEach((payment) => {
      const tr = document.createElement('tr');

      // ID
      const tdId = document.createElement('td');
      tdId.textContent = payment.id;
      tr.appendChild(tdId);

      // Space (name/type)
      const tdSpace = document.createElement('td');
      tdSpace.innerHTML = `<strong>${escapeHtml(payment.space?.name || '')}</strong><br><small>${escapeHtml(payment.space?.type.replace('_', ' ') || '')}</small>`;
      tr.appendChild(tdSpace);

      // Time (start - end)
      const tdTime = document.createElement('td');
      tdTime.innerHTML = `${formatDateTime(payment.booking?.startTime)} - ${formatDateTime(payment.booking?.endTime)}`;
      tr.appendChild(tdTime);

      // Owner
      const tdPayer = document.createElement('td');
      tdPayer.textContent = payment.user?.name || '';
      tr.appendChild(tdPayer);

      // Amount
      const tdAmount = document.createElement('td');
      tdAmount.textContent = formatCurrency(payment.amount);
      tr.appendChild(tdAmount);

      // Method
      const tdMethod = document.createElement('td');
      tdMethod.textContent = payment.method.replace('_', ' ') || '';
      tr.appendChild(tdMethod);

      // Status
      const tdStatus = document.createElement('td');
      const spanStatus = document.createElement('span');
      spanStatus.textContent = payment.status || '';
      spanStatus.className = statusBadgeClass(payment.status);
      tdStatus.appendChild(spanStatus);
      tr.appendChild(tdStatus);
      //   Paidat
      const tdPaidAt = document.createElement('td');
      const spanPaidAt = document.createElement('span');
      spanPaidAt.textContent = `${formatDateTime(payment.createdAt) || ''} `;
      tdPaidAt.appendChild(spanPaidAt);
      tr.appendChild(tdPaidAt);
      // Actions
      const tdActions = document.createElement('td');
      const btnView = document.createElement('button');
      btnView.textContent = 'View';
      btnView.className = 'btn btn-outline-info btn-sm view-payment-btn';
      btnView.dataset.paymentId = payment.id;
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
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', () => {
      paymentState.pageSize = parseInt(pageSizeSelect.value, 10);
      fetchPayments(
        paymentState.currentPage,
        paymentState.pageSize,
        paymentState.keySearch,
        paymentState.startDate,
        paymentState.endDate,
        paymentState.selectedStatuses,
        paymentState.sortBy,
        paymentState.direction,
      );
    });
  }
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      const val = e.target.value || '';
      const [field = '', dir = 'asc'] = val.split('_');
      const allowedFields = ['paidAt', 'amount'];
      const allowedDirs = ['asc', 'desc'];
      if (allowedFields.includes(field) && allowedDirs.includes(dir)) {
        paymentState.sortBy = field;
        paymentState.direction = dir;
      } else {
        paymentState.sortBy = '';
        paymentState.direction = '';
      }
      fetchPayments(
        paymentState.currentPage,
        paymentState.pageSize,
        paymentState.keySearch,
        paymentState.startDate,
        paymentState.endDate,
        paymentState.selectedStatuses,
        paymentState.sortBy,
        paymentState.direction,
      );
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      paymentState.keySearch = e.target.value.trim();
      triggerUpdate();
    });
  }

  if (startDateInput) {
    startDateInput.addEventListener('change', (e) => {
      paymentState.startDate = e.target.value;
      triggerUpdate();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', (e) => {
      paymentState.endDate = e.target.value;
      triggerUpdate();
    });
  }

  updateData();

  function updateData() {
    fetchPayments(
      paymentState.currentPage,
      paymentState.pageSize,
      paymentState.keySearch,
      paymentState.startDate,
      paymentState.endDate,
      paymentState.selectedStatuses,
      paymentState.sortBy,
      paymentState.direction,
    );
    fetchAndRenderStatusCounts(
      paymentState.keySearch,
      paymentState.startDate,
      paymentState.endDate,
    );
  }
});
