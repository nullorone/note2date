import React, { useState } from "react";
import type {CalendarEvent} from "../../types/CalendarEvent.ts";
import {sendImageToGemini} from "../../utils/geminiApi.ts";
import {adjustEventDate, generateICS} from "../../utils/icsGenerator.ts";
import ImageUploader from "../../components/ImageUploader/ImageUploader.tsx";

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleImageUpload = (file: File | null) => {
        setImageFile(file);
        setEvents([]);
        setError(null);
        setSuccess(null);
    };

    const handleProcessImage = async () => {
        if (!imageFile) {
            setError("Сначала загрузите изображение");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await sendImageToGemini(imageFile);
            setEvents(result);
            setSuccess("События успешно распознаны!");
        } catch (err) {
            setError("Ошибка распознавания: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

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


    const handleShare = async () => {
        if (events.length === 0) {
            alert("Сначала распознайте события");
            return;
        }

        const icsContent = generateICS(events); // твоя функция из `icsGenerator.ts`
        const file = new File([icsContent], "calendar.ics", {
            type: "text/calendar",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: "Календарь событий",
                    text: "События из вашего изображения",
                    files: [file]
                });
            } catch (err) {
                alert("Функция 'Поделиться' не поддерживается на вашем устройстве");
                console.error("Поделиться отменено или ошибка", err);
            }
        } else {
            alert("Функция 'Поделиться' не поддерживается на вашем устройстве");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-gray-800">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Календарь из заметок</h1>

                    {/* Загрузка изображения */}
                    <div className="mb-4">
                        <ImageUploader onImageUpload={handleImageUpload} />
                    </div>

                    {/* Кнопка отправки */}
                    {imageFile && (
                        <button
                            onClick={handleProcessImage}
                            disabled={loading}
                            className="w-full py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:bg-blue-400 transition"
                        >
                            {loading ? "Распознаю события..." : "Отправить на обработку"}
                        </button>
                    )}

                    {/* Сообщения */}
                    {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
                    {success && <p className="mt-4 text-green-600 text-center">{success}</p>}


                    {events.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">Распознанные события:</h2>
                            <ul className="space-y-2">
                                {events.map((event, index) => (
                                    <li key={index} className="border p-2 rounded bg-gray-100">
                                        <div className="font-medium">{event.title}</div>
                                        <div className="text-sm text-gray-600">
                                            {adjustEventDate(event.date).preview} {event.time && `в ${event.time}`}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleShare}
                                className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Поделиться
                            </button>

                            <button
                                onClick={handleDownloadICS}
                                className="mt-4 w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Скачать календарь (.ics)
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default App;
