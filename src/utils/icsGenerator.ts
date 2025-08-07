import type { CalendarEvent } from "../types/CalendarEvent";

// Получаем текущий год
const getCurrentYear = () => new Date().getFullYear();

// Форматируем дату события, обновляя год, если он в прошлом
const adjustEventDate = (date: string): string => {
    const [year, month, day] = date.split("-").map(Number);
    const currentYear = getCurrentYear();

    // Если год меньше текущего — заменяем на текущий
    const correctedYear = year < currentYear ? currentYear : year;

    const correctedDate = new Date(correctedYear, month - 1, day);

    // Если дата всё ещё в прошлом — добавляем 1 год
    if (correctedDate < new Date()) {
        correctedDate.setFullYear(correctedDate.getFullYear() + 1);
    }

    const y = correctedDate.getFullYear();
    const m = String(correctedDate.getMonth() + 1).padStart(2, "0");
    const d = String(correctedDate.getDate()).padStart(2, "0");

    return `${y}${m}${d}`;
};

// Прибавляет минуты к времени
const addMinutesToTime = (time: string, minutesToAdd: number): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    date.setMinutes(date.getMinutes() + minutesToAdd);

    const newHours = String(date.getHours()).padStart(2, "0");
    const newMinutes = String(date.getMinutes()).padStart(2, "0");

    return `${newHours}${newMinutes}`;
};

// Основная функция генерации ICS
export const generateICS = (events: CalendarEvent[]): string => {
    const header = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Calendar App//EN\n`;
    const footer = `END:VCALENDAR\n`;

    const eventsICS = events
        .map((event, index) => {
            const correctedDate = adjustEventDate(event.date);

            const timeStart = event.time ? event.time.replace(":", "") : "1200";
            const timeEnd = event.time ? addMinutesToTime(event.time, 15) : "1215";

            const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

            return `BEGIN:VEVENT
UID:event-${index}-${Date.now()}@calendar-app.local
DTSTAMP:${dtstamp}
DTSTART:${correctedDate}T${timeStart}00
DTEND:${correctedDate}T${timeEnd}00
SUMMARY:${event.title}
END:VEVENT`;
        })
        .join("\n");

    return header + eventsICS + footer;
};
