export const showInfoToast = (msg) => {
    const body = document.querySelector('body');
    const toast = document.createElement('div');
    toast.className = 'info-toast';
    toast.textContent = msg;
    body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2000);
}