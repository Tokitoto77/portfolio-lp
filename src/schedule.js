const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbx59GPGqZXH9ZWUZTm9X-gjAOX2j9C-WduMEiikL9WJvs2aBUqjwIuhHN7JBQOLBco/exec';

document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
});

async function fetchSchedule() {
    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">読み込み中...</td></tr>';

    try {
        const response = await fetch(GAS_API_URL);
        const data = await response.json();

        renderSchedule(data, tbody);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        let msg = 'スケジュールの読み込みに失敗しました。';
        if (error.message.includes('Failed to fetch')) {
            msg += '<br><small>※アクセスがブロックされました。Google Apps Scriptのデプロイ設定（全員に公開）を確認してください。</small>';
        }
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #d9534f;">${msg}</td></tr>`;
    }
}

function renderSchedule(events, tbody) {
    tbody.innerHTML = ''; // Clear loading

    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">現在予定されているレッスンはありません。</td></tr>';
        return;
    }

    // 1. Group events by date (e.g., "1/7") to handle rowspan
    const eventsByDate = {};
    events.forEach(event => {
        // Make a unique key for date grouping. 
        // The API returns 'date' like "1/7", 'weekDay' like "Wed".
        // We can use the 'date' field as key.
        const dateKey = `${event.date} (${event.weekDay})`;
        if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
    });

    // 2. Build HTML
    // We need to alternate background colors for days? 
    // The original design had .bg-gray on alternate days.
    let dayIndex = 0;

    Object.keys(eventsByDate).forEach(dateStr => {
        const dailyEvents = eventsByDate[dateStr];
        const isOddDay = dayIndex % 2 !== 0; // 0=White, 1=Gray, 2=White...
        const bgClass = isOddDay ? 'bg-gray' : '';

        dailyEvents.forEach((evt, index) => {
            const tr = document.createElement('tr');

            // 1st Column: Date (Only for the first row of the day)
            if (index === 0) {
                const tdDate = document.createElement('td');
                tdDate.rowSpan = dailyEvents.length;
                tdDate.className = `date-cell ${bgClass}`;
                tdDate.textContent = dateStr; // e.g., "1/7 (Wed)"
                tr.appendChild(tdDate);
            }

            // 2nd Column: Time
            const tdTime = document.createElement('td');
            tdTime.className = bgClass;
            tdTime.textContent = `${evt.startTime} - ${evt.endTime}`;
            tr.appendChild(tdTime);

            // 3rd Column: Class Name + Tag
            const tdClass = document.createElement('td');
            tdClass.className = bgClass;

            // Determine tag class based on type
            let tagClass = 'basic'; // default
            if (evt.type.includes('マシン')) tagClass = 'machine';
            else if (evt.type.includes('ミックス')) tagClass = 'mix';
            else if (evt.type.includes('マット')) tagClass = 'basic';

            tdClass.innerHTML = `
        <span class="class-tag ${tagClass}">${evt.type}</span>
        ${evt.title}
      `;
            tr.appendChild(tdClass);

            // 4th Column: Status
            const tdStatus = document.createElement('td');
            tdStatus.className = bgClass;
            let statusHtml = '';
            if (evt.status.includes('◎')) statusHtml = '<span class="status-ok">◎</span>';
            else if (evt.status.includes('△')) statusHtml = '<span class="status-few">△</span>';
            else if (evt.status.includes('×') || evt.status.includes('満')) statusHtml = '<span class="status-full">×</span>';
            else statusHtml = `<span>${evt.status}</span>`;
            tdStatus.innerHTML = statusHtml;
            tr.appendChild(tdStatus);

            // 5th Column: Book Button
            const tdBook = document.createElement('td');
            tdBook.className = bgClass;

            if (evt.status.includes('×') || evt.status.includes('満')) {
                tdBook.innerHTML = '<span class="text-disabled">満席</span>';
            } else {
                // Create a link to the reservation form with pre-filled params
                const params = new URLSearchParams({
                    date: evt.date, // e.g., "1/7"
                    time: evt.startTime, // e.g., "10:00"
                    class: evt.type
                });
                tdBook.innerHTML = `<a href="reservation.html?${params.toString()}" class="btn-book">予約</a>`;
            }
            tr.appendChild(tdBook);

            tbody.appendChild(tr);
        });

        dayIndex++;
    });
}
