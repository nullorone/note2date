import { useState } from 'react'
import './App.css'
import ImageUploader from "../../components/ImageUploader/ImageUploader.tsx";
import {sendImageToGemini} from "../../utils/geminiApi.ts";
import type {CalendarEvent} from "../../types/CalendarEvent.ts";
import {generateICS} from "../../utils/icsGenerator.ts";

function App() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (file: File | null) => {
        setImageFile(file);
        setEvents([]);
        setError(null);
    };

    const handleProcessImage = async () => {
        if (!imageFile) {
            setError("Сначала загрузите изображение");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await sendImageToGemini(imageFile);
            setEvents(result);
        } catch (err) {
            setError("Ошибка распознавания: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Функция для скачивания .ics файла
    const handleDownloadICS = () => {
        if (events.length === 0) return;

        const icsContent = generateICS(events);

        const blob = new Blob([icsContent], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "calendar.ics";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Календарь из рукописных заметок</h1>

                <ImageUploader onImageUpload={handleImageUpload} />

                {imageFile && (
                    <button
                        onClick={handleProcessImage}
                        disabled={loading}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {loading ? "Распознаю..." : "Отправить на обработку"}
                    </button>
                )}

                {error && <p className="mt-4 text-red-500">{error}</p>}

                {events.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold">Распознанные события:</h2>
                        <ul className="mt-2">
                            {events.map((event, index) => (
                                <li key={index} className="mb-1">
                                    <strong>{event.date}</strong> {event.time && `(${event.time})`} — {event.title}
                                </li>
                            ))}
                        </ul>

                        {/* ✅ Кнопка для скачивания .ics */}
                        <button
                            onClick={handleDownloadICS}
                            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                            Скачать календарь (.ics)
                        </button>

                    </div>
                )}
        </div>
    );
}

export default App
