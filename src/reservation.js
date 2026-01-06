document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    const timeParam = params.get('time');
    const classParam = params.get('class');
    const typeParam = params.get('type'); // 'trial' or regular class types

    // 2. Pre-fill form fields
    const dateTimeInput = document.getElementById('date-time');
    const courseSelect = document.getElementById('course');

    if (dateParam && timeParam) {
        dateTimeInput.value = `${dateParam} ${timeParam}`;
        // Make it readonly if selected from schedule to prevent errors
        // dateTimeInput.readOnly = true; 
    }

    if (typeParam === 'trial') {
        courseSelect.value = 'trial';
    } else if (classParam) {
        // Try to match partial text for class types
        if (classParam.includes('マット')) courseSelect.value = 'mat';
        else if (classParam.includes('マシン')) courseSelect.value = 'machine';
        else if (classParam.includes('ミックス')) courseSelect.value = 'mix';
    }

    // 3. Handle Form Submission
    const form = document.getElementById('reservation-form');
    const formWrapper = document.getElementById('form-wrapper');
    const thanksMessage = document.getElementById('thanks-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state (change button text)
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = '送信中...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        // Send data to Google Sheets via GAS
        // Send data to Google Sheets via GAS
        const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyGkz77EQI9Ag8YcwIMi6WGNvnzzOSAoBX9cPzVAUpKeiuiGDqlIuK80gzAkTgSipc/exec';

        try {
            // Google Apps Script requires Content-Type: text/plain to avoid CORS preflight issues
            await fetch(GAS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(data)
            });

            // GAS redirects on success, which fetch follows but might result in opaque response.
            // We assume success if no network error occurred.

            // Hide form and show success message
            formWrapper.style.display = 'none';
            thanksMessage.classList.add('visible');

            // Scroll to top of message
            thanksMessage.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Submission Error:', error);
            alert('送信エラー: ' + error.message + '\n(GASの設定やネットワークを確認してください)');
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
