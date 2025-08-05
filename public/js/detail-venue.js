document.addEventListener('DOMContentLoaded', async function () {
  function getVenueIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return isNaN(date) ? '' : date.toLocaleDateString();
  }

  const el = {
    title: document.querySelector('#building-title'),
    subtitle: document.querySelector('#building-subtitle'),
    status: document.querySelector('#building-status'),
    description: document.querySelector('#building-description'),
    address: document.querySelector('#building-address'),
    created: document.querySelector('#building-created'),
    ownerName: document.querySelector('#owner-name'),
    ownerEmail: document.querySelector('#owner-email'),
    ownerNameSidebar: document.querySelector('#owner-name-sidebar'),
    ownerEmailSidebar: document.querySelector('#owner-email-sidebar'),
    ownerPhoneSidebar: document.querySelector('#owner-phone-sidebar'),
    ownerBuildingSidebar: document.querySelector('#owner-building-sidebar'),
    latLng: document.querySelector('#lat-lng'),
    amenitiesContainer: document.querySelector('.amenities-container'),
    spacesRow: document.querySelector('#spaces-row'),
    loadingOverlay: document.getElementById('loading-overlay'),
  };
  function showLoading() {
    el.loadingOverlay.style.display = 'flex';
  }
  function hideLoading() {
    el.loadingOverlay.style.display = 'none';
  }
  const venueId = getVenueIdFromPath();

  try {
    showLoading();
    const res = await fetch(`/admin/venues/${venueId}`);
    const data = await res.json();
    if (!data.success || !data.payload) {
      console.error('API error:', data.message || 'Unknown error');
      Toastify({
        text: `${data.message || 'Không thể tải dữ liệu'}`,
        duration: 4000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#ff0000"',
      }).showToast();
      return;
    }
    const b = data.payload;
    // Render hero
    el.title.textContent = b.name || 'Unnamed Building';
    el.subtitle.textContent = `${b.street || ''}${b.city ? ', ' + b.city : ''}`;

    // Render basic info
    el.status.textContent = b.status || 'UNKNOWN';
    el.description.textContent = `Located in the heart of ${b.city || ''}, ${b.name || ''} offers premium office spaces and meeting rooms with modern amenities.`;
    el.address.textContent = `${b.street || ''}${b.city ? ', ' + b.city : ''}`;
    el.created.textContent = formatDate(b.createdDate);

    // Owner info
    if (b.owner) {
      const ownerName = b.owner.name || 'Unknown';
      const ownerEmail = b.owner.email || '';
      const ownerPhone = b.owner.phone || '';
      const ownerBuilding = b.name || '';

      el.ownerName.textContent = ownerName;
      el.ownerEmail.textContent = ownerEmail;
      el.ownerNameSidebar.textContent = ownerName;
      el.ownerEmailSidebar.textContent = ownerEmail || 'N/A';
      el.ownerPhoneSidebar.textContent = ownerPhone || 'N/A';
      el.ownerBuildingSidebar.textContent = ownerBuilding;
    }

    // Lat/Lng
    el.latLng.textContent = `Latitude: ${b.latitude || ''} • Longitude: ${b.longitude || ''}`;

    // Nếu có tọa độ => vẽ bản đồ Leaflet
    if (b.latitude && b.longitude) {
      initMapLeaflet(
        parseFloat(b.latitude),
        parseFloat(b.longitude),
        b.name || 'Vị trí',
      );
    }

    // Amenities
    el.amenitiesContainer.innerHTML = '';
    if (Array.isArray(b.amenities) && b.amenities.length) {
      b.amenities.forEach((a) => {
        const span = document.createElement('span');
        span.className = 'amenity-badge';
        span.innerHTML = `<i class="fas fa-check me-2"></i>${a.name}`;
        el.amenitiesContainer.appendChild(span);
      });
    } else {
      el.amenitiesContainer.innerHTML =
        '<small class="text-muted">No amenities listed</small>';
    }

    // Spaces
    el.spacesRow.innerHTML = '';
    if (Array.isArray(b.spaces) && b.spaces.length) {
      b.spaces.forEach((s) => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
          <div class="card space-card">
            <img class="card-img-top" src="/images/default-space.jpg" alt="${s.name || ''}">
            <div class="card-body">
              <h5 class="card-title">${s.name || ''}</h5>
              <p class="text-muted">${s.type || ''} • Capacity: ${s.capacity || 0}</p>
              <p class="card-text">${s.description || ''}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-primary">Available</span>
                <a class="btn btn-sm btn-outline-primary" href="#">View Details</a>
              </div>
            </div>
          </div>
        `;
        el.spacesRow.appendChild(col);
      });
    } else {
      el.spacesRow.innerHTML =
        '<div class="col"><small class="text-muted">No spaces available</small></div>';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    Toastify({
      text: 'Không thể tải dữ liệu toà nhà. Vui lòng thử lại',
      duration: 4000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ff0000"',
    }).showToast();
  } finally {
    hideLoading();
  }
});

function initMapLeaflet(lat, lng, title) {
  const map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${title}</b><br>Lat: ${lat}, Lng: ${lng}`)
    .openPopup();
}
