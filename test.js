const dayjs = require('dayjs');

function getCurrentMonthDays() {
    // Lấy ngày hiện tại
    const now = dayjs();

    // Lấy ngày đầu tháng hiện tại
    const startOfMonth = now.startOf('month');

    // Mảng chứa các ngày trong tháng
    const daysInMonth = [];
    let currentDay = startOfMonth;

    // Thêm các ngày vào mảng từ ngày đầu tháng đến ngày hiện tại
    while (currentDay.isBefore(now, 'day') || currentDay.isSame(now, 'day')) {
        daysInMonth.push(currentDay.format('YYYY-MM-DD')); // Thêm ngày vào mảng
        currentDay = currentDay.add(1, 'day'); // Chuyển đến ngày tiếp theo
    }

    return daysInMonth;
}

const days = getCurrentMonthDays();
console.log(days);