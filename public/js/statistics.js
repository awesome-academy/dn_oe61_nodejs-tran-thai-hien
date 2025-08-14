document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const btnApply = document.getElementById('btnApply');

  const totalVenuesSummaryEl = document.getElementById('sm-totalVenues');
  const totalSpacesSummaryEl = document.getElementById('sm-totalSpaces');
  const totalBookingsSummaryEl = document.getElementById('sm-totalBookings');
  const totalRevenueSummaryEl = document.getElementById('sm-totalRevenue');
  const totalUsersSummaryEl = document.getElementById('sm-totalUsers');

  const totalBookingsEl = document.getElementById('totalBookings');
  const totalRevenueEl = document.getElementById('totalRevenue');
  const totalUsersEl = document.getElementById('totalUsers');
  const venueSelectEl = document.getElementById('venueSelect');

  const topUsersTable = document.getElementById('topUsers');
  const topVenuesTable = document.getElementById('topVenues');
  const topUsersLimitEl = document.getElementById('topUsersLimit');
  const topVenuesLimitEl = document.getElementById('topVenuesLimit');

  let charts = {};
  function initVenueSelect2() {
    $('#venueSelect').select2({
      placeholder: 'Select a venue',
      allowClear: true,
      width: '100%',
    });
  }
  async function fetchData(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const json = await res.json();
    if (!json.success || json.statusCode !== 200) {
      console.error(`API error from ${url}:`, json);
      throw new Error(json.message || 'Error fetching data');
    }
    console.log(`Data from ${url}:`, json.payload);
    return json.payload || {};
  }

  async function fetchList(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const json = await res.json();
    if (!json.success || json.statusCode !== 200) {
      console.error(`API error from ${url}:`, json);
      throw new Error(json.message || 'Error fetching list');
    }
    const arr = Array.isArray(json.payload)
      ? json.payload
      : Array.isArray(json.payload?.data)
        ? json.payload.data
        : [];
    console.log(`List data from ${url}:`, arr);
    return arr;
  }

  async function loadAllVenues() {
    let allVenues = [];
    let totalPages = 1;
    const pageSize = 50;

    try {
      for (let page = 1; page <= totalPages; page++) {
        const res = await fetch(`/venues?page=${page}&pageSize=${pageSize}`);
        const json = await res.json();

        if (json.success) {
          if (page === 1) {
            totalPages = json.payload.meta.totalPages;
          }
          allVenues = allVenues.concat(json.payload.data);
        }
      }

      venueSelectEl.innerHTML = '<option value="">All Venues</option>';
      allVenues.forEach((v) => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.name;
        venueSelectEl.appendChild(opt);
      });
      initVenueSelect2();
    } catch (err) {
      console.error('Error loading venues:', err);
    }
  }

  function renderChart(id, type, labels, data, colors) {
    if (charts[id]) charts[id].destroy();
    const ctx = document.getElementById(id).getContext('2d');
    charts[id] = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: id,
            data,
            backgroundColor: colors,
            borderColor: colors,
            fill: type !== 'line',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  function renderTable(el, rows, nameKey, valueKey) {
    el.innerHTML = '';
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[nameKey]}</td><td>${r[valueKey]}</td>`;
      el.appendChild(tr);
    });
  }

  async function loadTopUsers(dateParams) {
    try {
      const limitUsers = topUsersLimitEl.value || 5;
      const usersData = await fetchList(
        `/statistics/users/top-booking?${dateParams}&limit=${limitUsers}`,
      );
      renderTable(topUsersTable, usersData, 'name', 'totalBookings');
    } catch (err) {
      console.error('Load top users error:', err);
    }
  }

  async function loadTopVenues(dateParams) {
    try {
      const limitVenues = topVenuesLimitEl.value || 5;
      const venuesData = await fetchList(
        `/statistics/venues/top-booking?${dateParams}&limit=${limitVenues}`,
      );
      renderTable(topVenuesTable, venuesData, 'name', 'totalBookings');
    } catch (err) {
      console.error('Load top venues error:', err);
    }
  }

  async function loadStatistics() {
    try {
      const start = startDateInput.value;
      const end = endDateInput.value;
      const venueId = venueSelectEl.value;

      const dateParams = new URLSearchParams();
      if (start) dateParams.append('startDate', start);
      if (end) dateParams.append('endDate', end);

      const venueParams = new URLSearchParams(dateParams);
      if (venueId) venueParams.append('venueId', venueId);

      const summary = await fetchData('/statistics');
      totalVenuesSummaryEl.textContent = summary.totalVenues || 0;
      totalSpacesSummaryEl.textContent = summary.totalSpaces || 0;
      totalBookingsSummaryEl.textContent = summary.totalBookings || 0;
      totalRevenueSummaryEl.textContent = (
        summary.totalRevenues || 0
      ).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
      totalUsersSummaryEl.textContent = summary.totalUsers || 0;

      const bookings = await fetchData(`/statistics/bookings?${venueParams}`);
      const revenues = await fetchData(`/statistics/revenues?${venueParams}`);
      const users = await fetchData(`/statistics/users?${dateParams}`);

      totalBookingsEl.textContent = bookings.total || 0;
      totalRevenueEl.textContent = revenues.total || 0;
      totalUsersEl.textContent = users.total || 0;

      // Render charts
      if (bookings.byStatus?.length > 0) {
        renderChart(
          'bookingsByStatus',
          'pie',
          bookings.byStatus.map((s) => s.status),
          bookings.byStatus.map((s) => s.total),
          ['#4CAF50', '#FFC107', '#F44336', '#2196F3'],
        );
      }
      if (bookings.byType?.length > 0) {
        renderChart(
          'bookingsByType',
          'pie',
          bookings.byType.map((s) => s.type),
          bookings.byType.map((s) => s.total),
          ['#3F51B5', '#009688', '#E91E63'],
        );
      }
      renderChart(
        'bookingsByMonth',
        'bar',
        bookings.byMonth?.map((m) => m.month) || [],
        bookings.byMonth?.map((m) => m.total) || [],
        ['#2196F3'],
      );
      renderChart(
        'revenueByMonth',
        'bar',
        revenues.byMonth?.map((m) => m.month) || [],
        revenues.byMonth?.map((m) => m.total) || [],
        ['#FF9800'],
      );
      renderChart(
        'usersByStatus',
        'pie',
        users.byStatus?.map((s) => s.status) || [],
        users.byStatus?.map((s) => s.total) || [],
        ['#4CAF50', '#F44336'],
      );
      renderChart(
        'usersByMonth',
        'line',
        users.byMonth?.map((m) => m.month) || [],
        users.byMonth?.map((m) => m.total) || [],
        ['#673AB7'],
      );

      // Load top tables
      await Promise.all([
        loadTopUsers(dateParams.toString()),
        loadTopVenues(dateParams.toString()),
      ]);
    } catch (err) {
      console.error('Load statistics error:', err);
      alert(err.message || 'Failed to load statistics');
    }
  }

  btnApply.addEventListener('click', loadStatistics);

  if (topUsersLimitEl) {
    topUsersLimitEl.addEventListener('change', () => {
      const start = startDateInput.value;
      const end = endDateInput.value;
      const dateParams = new URLSearchParams();
      if (start) dateParams.append('startDate', start);
      if (end) dateParams.append('endDate', end);
      loadTopUsers(dateParams.toString());
    });
  }

  if (topVenuesLimitEl) {
    topVenuesLimitEl.addEventListener('change', () => {
      const start = startDateInput.value;
      const end = endDateInput.value;
      const dateParams = new URLSearchParams();
      if (start) dateParams.append('startDate', start);
      if (end) dateParams.append('endDate', end);
      loadTopVenues(dateParams.toString());
    });
  }

  loadAllVenues();
  loadStatistics();
});
