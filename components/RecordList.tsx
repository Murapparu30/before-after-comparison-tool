import React from 'react';
import { RecordListProps, SortOrder } from '../types';
import RecordCard from './RecordCard';

export const RecordList: React.FC<RecordListProps> = ({ 
  records, 
  searchTerm, 
  setSearchTerm, 
  sortOrder, 
  setSortOrder, 
  onView, 
  onDelete 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="タイトルで検索..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
        />
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value as SortOrder)} 
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={SortOrder.NEWEST_FIRST}>新しい順</option>
          <option value={SortOrder.OLDEST_FIRST}>古い順</option>
        </select>
      </div>
      
      {records.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map(record => (
            <RecordCard 
              key={record.id} 
              record={record} 
              onView={onView} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">保存された記録はありません。</p>
      )}
    </div>
  );
};