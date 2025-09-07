import React, { useState, useEffect } from 'react';
import { ImageInputProps } from '../types';
import { MAX_IMAGE_COUNT } from '../constants';

export const ImageInput: React.FC<ImageInputProps> = ({ id, label, onFilesSelect, files }) => {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Data URLはメモリ上の文字列なので、revokeObjectURLは不要
    setPreviews(files);
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    // 最大枚数を超えた場合は制限する
    const limitedFiles = selectedFiles.slice(0, MAX_IMAGE_COUNT);
    onFilesSelect(limitedFiles);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="file"
        id={id}
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {previews.map((src, index) => (
            <img 
              key={index} 
              src={src} 
              alt={`Preview ${index + 1}`} 
              className="w-full h-24 object-cover rounded-md border" 
            />
          ))}
        </div>
      )}
    </div>
  );
};