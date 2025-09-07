import React, { useState, useMemo, useCallback } from 'react';
import { RecordItem, SortOrder } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { saveToStorage } from './services/dataService';
import { autoSave } from './services/fileService';
import { calculateChangeScore } from './services/imageService';
import { Header } from './components/Header';
import { RecordForm } from './components/RecordForm';
import { RecordList } from './components/RecordList';
import { DetailModal } from './components/DetailModal';

const App: React.FC = () => {
  const [records, setRecords] = useLocalStorage<RecordItem[]>('beforeAfterRecords', []);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NEWEST_FIRST);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => 
      record.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === SortOrder.NEWEST_FIRST ? dateB - dateA : dateA - dateB;
    });
  }, [records, searchTerm, sortOrder]);

  const handleSaveRecord = useCallback(async (newRecord: RecordItem) => {
    try {
      let recordWithScore = newRecord;
      
      // After画像がある場合のみ変化スコアを計算
      if (newRecord.images.after.length > 0) {
        const scores = await Promise.all(
          newRecord.images.before.map(async (beforeImg, index) => {
            const afterImg = newRecord.images.after[index];
            if (afterImg) {
              return await calculateChangeScore(beforeImg, afterImg);
            }
            return 0; // After画像がない場合は0
          })
        );
        
        recordWithScore = {
          ...newRecord,
          changeScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        };
      }
      
      const updatedRecords = [...records, recordWithScore];
      setRecords(updatedRecords);
      saveToStorage(updatedRecords);
      
      // 自動保存
      if (autoSaveEnabled) {
        await autoSave(updatedRecords, true);
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('記録の保存中にエラーが発生しました');
    }
  }, [records, setRecords]);

  const handleDeleteRecord = useCallback(async (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    saveToStorage(updatedRecords);
    
    // 自動保存
    if (autoSaveEnabled) {
      await autoSave(updatedRecords, true);
    }
  }, [records, setRecords, autoSaveEnabled]);

  const handleUpdateRecord = useCallback(async (updatedRecord: RecordItem) => {
    const recordWithUpdatedTimestamp = {
      ...updatedRecord,
      updatedAt: Date.now()
    };
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? recordWithUpdatedTimestamp : record
    );
    setRecords(updatedRecords);
    saveToStorage(updatedRecords);
    
    // 自動保存
    if (autoSaveEnabled) {
      await autoSave(updatedRecords, true);
    }
    
    setSelectedRecord(recordWithUpdatedTimestamp);
  }, [records, setRecords, autoSaveEnabled]);

  const handleImportData = useCallback(async (importedRecords: RecordItem[]) => {
    const mergedRecords = [...records];
    let addedCount = 0;
    
    importedRecords.forEach(importedRecord => {
      const exists = mergedRecords.some(existing => existing.id === importedRecord.id);
      if (!exists) {
        mergedRecords.push(importedRecord);
        addedCount++;
      }
    });
    
    setRecords(mergedRecords);
    saveToStorage(mergedRecords);
    
    // 自動保存
    if (autoSaveEnabled) {
      await autoSave(mergedRecords, true);
    }
    
    alert(`${addedCount}件の新しい記録をインポートしました`);
  }, [records, setRecords, autoSaveEnabled]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
          records={records}
          onImport={handleImportData}
          autoSaveEnabled={autoSaveEnabled}
          onAutoSaveToggle={setAutoSaveEnabled}
        />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">新しい記録を追加</h2>
            <RecordForm 
              onSave={handleSaveRecord} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">保存された記録</h2>
              <button 
                onClick={() => setShowForm(true)} 
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                新しい記録を追加
              </button>
            </div>
            
            <RecordList 
              records={filteredAndSortedRecords}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onView={setSelectedRecord}
              onDelete={handleDeleteRecord}
            />
          </div>
        )}
      </main>
      
      {selectedRecord && (
        <DetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onUpdate={handleUpdateRecord} 
        />
      )}
    </div>
  );
};

export default App;