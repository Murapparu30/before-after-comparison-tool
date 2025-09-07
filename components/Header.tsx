import React from 'react';
import { RecordItem } from '../types';
import { exportData, importData } from '../services/dataService';
import { saveToFile, loadFromFile, isFileSystemAccessSupported, setupAutoSave } from '../services/fileService';

interface HeaderProps {
  records: RecordItem[];
  onImport: (records: RecordItem[]) => void;
  autoSaveEnabled: boolean;
  onAutoSaveToggle: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ records, onImport, autoSaveEnabled, onAutoSaveToggle }) => {
  const handleExportAll = () => {
    exportData(records);
  };

  const handleSaveToFile = async () => {
    try {
      await saveToFile(records);
      alert('ファイルが正常に保存されました。');
    } catch (error) {
      console.error('Save error:', error);
      alert('ファイルの保存に失敗しました。');
    }
  };

  const handleLoadFromFile = async () => {
    try {
      const importedRecords = await loadFromFile();
      onImport(importedRecords);
      alert(`${importedRecords.length}件のレコードを読み込みました。`);
    } catch (error) {
      console.error('Load error:', error);
      if ((error as Error).message !== 'ファイルの選択がキャンセルされました。') {
        alert('ファイルの読み込みに失敗しました。');
      }
    }
  };

  const handleSetupAutoSave = async () => {
    try {
      const success = await setupAutoSave();
      if (success) {
        onAutoSaveToggle(true);
        alert('自動保存が設定されました。データが変更されるたびに自動的にファイルに保存されます。');
      } else {
        alert('自動保存の設定に失敗しました。ブラウザがFile System Access APIをサポートしていない可能性があります。');
      }
    } catch (error) {
      console.error('自動保存の設定に失敗しました:', error);
      alert('自動保存の設定に失敗しました');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedRecords = await importData(file);
      onImport(importedRecords);
      // ファイル入力をリセット
      e.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      alert('データのインポートに失敗しました。ファイル形式を確認してください。');
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Before/After比較ツール</h1>
          <div className="flex gap-2 flex-wrap">
            {isFileSystemAccessSupported() && (
              <>
                <button
                  onClick={handleSaveToFile}
                  disabled={records.length === 0}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
                >
                  ファイルに保存
                </button>
                <button
                  onClick={handleLoadFromFile}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
                >
                  ファイルから読み込み
                </button>
                {!autoSaveEnabled && (
                  <button
                    onClick={handleSetupAutoSave}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
                  >
                    自動保存設定
                  </button>
                )}
                {autoSaveEnabled && (
                  <span className="bg-green-100 text-green-800 py-2 px-3 rounded-md text-sm font-medium">
                    自動保存有効
                  </span>
                )}
              </>
            )}
            <button
              onClick={handleExportAll}
              disabled={records.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
            >
              全データエクスポート
            </button>
            <label className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition cursor-pointer">
              データインポート
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};