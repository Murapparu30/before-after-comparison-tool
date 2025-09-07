import React from 'react';
import { RecordCardProps } from '../types';

const RecordCard: React.FC<RecordCardProps> = ({ record, onView, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`「${record.title}」を削除しますか？`)) {
      onDelete(record.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{record.title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{record.date}</p>
          {record.changeScore !== undefined && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              変化度: {record.changeScore}%
            </span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <img 
            src={record.images.before[0]} 
            alt="Before" 
            className="w-1/2 h-24 object-cover rounded-md" 
          />
          <img 
            src={record.images.after[0]} 
            alt="After" 
            className="w-1/2 h-24 object-cover rounded-md" 
          />
        </div>
      </div>
      <div className="p-4 bg-gray-100 flex gap-2">
        <button 
          onClick={() => onView(record)} 
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition"
        >
          開く
        </button>
        <button 
          onClick={handleDelete} 
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition"
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default React.memo(RecordCard);