import React, { useState } from "react";

interface ImageUploaderProps {
    onImageUpload: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            setFileName(file.name);

            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            onImageUpload(file);
        } else {
            setPreview(null);
            setFileName(null);
            onImageUpload(null);
        }
    };

    return (
        <div className="image-uploader">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="file-upload"
                className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border border-dashed border-gray-400 p-4 rounded text-center">
                    {preview ? (
                        <img
                            width={640}
                            height={420}
                            src={preview}
                            alt="Превью"
                            className="max-h-64 mx-auto mb-2 rounded"
                        />
                    ) : (
                        <p>Выберите изображение</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">{fileName || "Формат: JPG, PNG"}</p>
                            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Загрузить изображение
                            </button>
                    </div>
            </label>
        </div>
    );
};

export default ImageUploader;
