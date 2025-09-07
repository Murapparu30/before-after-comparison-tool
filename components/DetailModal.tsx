import React, { useState } from 'react';
import { DetailModalProps } from '../types';
import { ImageComparer } from './ImageComparer';
import { exportData } from '../services/dataService';

export const DetailModal: React.FC<DetailModalProps> = ({ record, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(record.title);
  const [editedDate, setEditedDate] = useState(record.date);

  const handleExportJson = () => {
    exportData([record]);
  };

  const handleSave = () => {
    if (!editedTitle.trim()) {
      alert('タイトルは必須です。');
      return;
    }
    
    const updatedRecord = {
      ...record,
      title: editedTitle.trim(),
      date: editedDate
    };
    
    onUpdate(updatedRecord);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(record.title);
    setEditedDate(record.date);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            {isEditing ? (
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none mb-2"
                  placeholder="タイトルを入力"
                />
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="text-gray-600 border-b border-gray-300 focus:border-blue-500 outline-none"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{record.title}</h2>
                <p className="text-gray-600">{record.date}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                  >
                    編集
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                  >
                    エクスポート
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
              >
                閉じる
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {record.images.before.map((beforeImg, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-semibold text-center">画像 {index + 1}</h3>
                <ImageComparer 
                  beforeImage={beforeImg} 
                  afterImage={record.images.after[index] || null} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};