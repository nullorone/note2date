
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API ключ для Gemini не найден. Установите VITE_GEMINI_API_KEY в .env");
}

// Формируем промпт для Gemini
const generatePrompt = (): string => {
    return `
    На изображении от руки написаны даты и дела. Распознай их и верни в формате JSON.

    Формат ответа:
    {
      "events": [
        {
          "date": "YYYY-MM-DD",
          "title": "Название события",
          "time": "HH:mm (если указано)"
        }
      ]
    }

    Если события не найдены — верни пустой массив.
  `;
};

// Отправка изображения в Gemini API
export const sendImageToGemini = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const base64Image = await convertFileToBase64(file);

    const prompt = generatePrompt();

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: file.type,
                                    data: base64Image.split(",")[1], // убираем префикс data:image/png;base64,
                                },
                            },
                        ],
                        role: "user",
                    },
                ],
            }),
        }
    );

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Gemini не смог распознать изображение");
    }

    const text = data.candidates[0].content.parts[0].text;

    try {
        // Извлекаем JSON из ответа
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonText = text.slice(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonText);
        return parsed.events;
    } catch (e) {
        throw new Error("Не удалось распарсить ответ от Gemini: " + text);
    }
};

// Вспомогательная функция для конвертации файла в base64
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};
