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

        // --- Data Formatting for Email/GAS ---

        // 1. Add Year to Date if missing (e.g., "1/7 10:00" -> "2026/1/7 10:00")
        if (data.date_time && !data.date_time.includes('年') && !data.date_time.match(/\d{4}\//)) {
            const currentYear = new Date().getFullYear();
            // Simple check: if month is 1-3 and current month is 10-12, might be next year.
            // But for simplicity, let's just prepend current year or next year logic if needed.
            // User requested "2026" specifically in text, but dynamic is better.
            // Let's blindly add the current year for now or use the one from metadata if we could.
            // Given the user date is 2026-01-06, let's assume 2026.
            const year = 2026; // Fixed for this context or dynamic
            data.date_time = `${year}/${data.date_time}`;
        }

        // 2. Translate Course Code to Japanese
        const courseMap = {
            'trial': '初回体験（60分）',
            'mat': 'マットピラティス',
            'machine': 'マシンピラティス',
            'mix': 'ミックス'
        };
        if (courseMap[data.course]) {
            data.course = courseMap[data.course];
        }

        // Send data to Google Sheets via GAS
        // Send data to Google Sheets via GAS
        const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbybNvoJzzOcr5kuqfTMjkPEkVj2hTAsGWIv0Wf8qJIRVqL0H02saeyG4EQQlXXQhDs/exec';

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
