function createPagination(container, totalPages, currentPage, onPageChange) {
  container.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'pagination';

  function createPageItem(page, text = page, disabled = false, active = false) {
    const li = document.createElement('li');
    li.className = 'page-item';
    if (disabled) li.classList.add('disabled');
    if (active) li.classList.add('active');

    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = text;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (!disabled && !active) onPageChange(page);
    });

    li.appendChild(a);
    return li;
  }

  ul.appendChild(
    createPageItem(Math.max(1, currentPage - 1), 'Prev', currentPage === 1),
  );

  // Hàm tạo ellipsis
  function createEllipsis() {
    const li = document.createElement('li');
    li.className = 'page-item disabled';
    const span = document.createElement('span');
    span.className = 'page-link';
    span.textContent = '...';
    li.appendChild(span);
    return li;
  }

  if (totalPages <= 7) {
    // Hiện tất cả trang nếu ít hơn hoặc bằng 7 trang
    for (let i = 1; i <= totalPages; i++) {
      ul.appendChild(createPageItem(i, i, false, i === currentPage));
    }
  } else {
    // Luôn hiển thị trang 1
    ul.appendChild(createPageItem(1, 1, false, currentPage === 1));

    // Nếu currentPage > 4 thì show ellipsis
    if (currentPage > 4) {
      ul.appendChild(createEllipsis());
    }

    // Hiển thị các trang xung quanh currentPage (±1 trang)
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      ul.appendChild(createPageItem(i, i, false, i === currentPage));
    }

    // Nếu currentPage cách cuối > 3 thì show ellipsis
    if (currentPage < totalPages - 3) {
      ul.appendChild(createEllipsis());
    }

    // Luôn hiển thị trang cuối
    ul.appendChild(
      createPageItem(totalPages, totalPages, false, currentPage === totalPages),
    );
  }

  ul.appendChild(
    createPageItem(
      Math.min(totalPages, currentPage + 1),
      'Next',
      currentPage === totalPages,
    ),
  );
  container.appendChild(ul);
}
