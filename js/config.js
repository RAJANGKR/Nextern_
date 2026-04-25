const CONFIG = {
  API_BASE: 'https://nextern-production.up.railway.app'
};

function showToast(message, type = 'success', duration = 3000) {
  const existing = document.getElementById('nextern-toast');
  if (existing) existing.remove();
  const colors = {
    success: { bg: '#F0FDF4', border: '#86EFAC', text: '#16A34A' },
    error:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#DC2626' },
    info:    { bg: '#EEF2FF', border: '#A5B4FC', text: '#6C63FF' },
    warning: { bg: '#FFF7ED', border: '#FCD34D', text: '#D97706' }
  };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.id = 'nextern-toast';
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;
    background:${c.bg};border:1px solid ${c.border};color:${c.text};
    padding:12px 18px;border-radius:10px;font-family:Inter,sans-serif;
    font-size:0.85rem;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,0.1);
    z-index:9999;transform:translateY(80px);opacity:0;
    transition:all 0.3s ease;max-width:360px;`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
