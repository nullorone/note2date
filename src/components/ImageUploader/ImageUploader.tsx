import React, { useState } from "react";

interface ImageUploaderProps {
    onImageUpload: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0] || null;
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
                onImageUpload(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
                onImageUpload(file);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
            onImageUpload(null);
        }
    };

    return (
        <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition
            ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:bg-gray-50"}
          `}
        >
            {preview ? (
                <img width={640} height={320} src={preview} alt="Превью" className="max-h-100 w-full object-contain mx-auto rounded" />
            ) : (
                <>
                    <p className="mb-2">Перетащите изображение или нажмите, чтобы выбрать</p>
                    <p className="text-sm text-gray-500 mb-2">Поддерживаемые форматы: JPG, PNG</p>
                </>
            )}

        <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            id="file-upload"
            className="hidden"
        />

        <label
            htmlFor="file-upload"
            className="inline-block mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
        >
            Выбрать файл
        </label>
    </div>
    );
};

export default ImageUploader;
