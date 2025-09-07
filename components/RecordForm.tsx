import React, { useState } from 'react';
import { RecordFormProps } from '../types';
import { MIN_IMAGE_COUNT, MAX_IMAGE_COUNT } from '../constants';
import { processImage } from '../services/imageService';
import { ImageInput } from './ImageInput';

export const RecordForm: React.FC<RecordFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [beforePreviews, setBeforePreviews] = useState<string[]>([]);
  const [afterPreviews, setAfterPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleBeforeFilesSelect = async (files: File[]) => {
    setBeforeFiles(files);
    setError('');
    
    try {
      const previews = await Promise.all(
        files.map(file => processImage(file))
      );
      setBeforePreviews(previews);
    } catch (err) {
      setError('画像の処理中にエラーが発生しました');
      console.error('Image processing error:', err);
    }
  };

  const handleAfterFilesSelect = async (files: File[]) => {
    setAfterFiles(files);
    setError('');
    
    try {
      const previews = await Promise.all(
        files.map(file => processImage(file))
      );
      setAfterPreviews(previews);
    } catch (err) {
      setError('画像の処理中にエラーが発生しました');
      console.error('Image processing error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    if (beforeFiles.length < MIN_IMAGE_COUNT || beforeFiles.length > MAX_IMAGE_COUNT ||
        afterFiles.length < MIN_IMAGE_COUNT || afterFiles.length > MAX_IMAGE_COUNT) {
      setError(`Before/After画像をそれぞれ${MIN_IMAGE_COUNT}〜${MAX_IMAGE_COUNT}枚選択してください`);
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const beforeImages = await Promise.all(
        beforeFiles.map(file => processImage(file))
      );
      const afterImages = await Promise.all(
        afterFiles.map(file => processImage(file))
      );
      
      const now = Date.now();
      const newRecord = {
        id: now.toString(),
        title: title.trim(),
        date: new Date().toISOString().split('T')[0],
        createdAt: now,
        updatedAt: now,
        images: {
          before: beforeImages,
          after: afterImages
        }
      };
      
      onSave(newRecord);
    } catch (err) {
      setError('画像の処理中にエラーが発生しました');
      console.error('Image processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="記録のタイトルを入力"
          required
        />
      </div>
      
      <ImageInput
        id="before-images"
        label={`Before画像 (${MIN_IMAGE_COUNT}〜${MAX_IMAGE_COUNT}枚)`}
        onFilesSelect={handleBeforeFilesSelect}
        files={beforePreviews}
      />
      
      <ImageInput
        id="after-images"
        label={`After画像 (${MIN_IMAGE_COUNT}〜${MAX_IMAGE_COUNT}枚)`}
        onFilesSelect={handleAfterFilesSelect}
        files={afterPreviews}
      />
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          {isProcessing ? '処理中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};