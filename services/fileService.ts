import { RecordItem } from '../types';

/**
 * File System Access APIが利用可能かどうかを確認します。
 */
export const isFileSystemAccessSupported = (): boolean => {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
};

/**
 * File System Access APIを使用してファイルを保存します。
 * @param data 保存するレコードデータの配列
 * @param filename ファイル名（オプション）
 */
export const saveToFile = async (data: RecordItem[], filename?: string): Promise<void> => {
  try {
    if (isFileSystemAccessSupported()) {
      // File System Access APIを使用
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename || `before-after-records-${new Date().toISOString().split('T')[0]}.json`,
        types: [{
          description: 'JSON files',
          accept: { 'application/json': ['.json'] },
        }],
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } else {
      // フォールバック: ダウンロード機能を使用
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `before-after-records-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // ユーザーがキャンセルした場合
      return;
    }
    throw new Error('ファイルの保存に失敗しました。');
  }
};

/**
 * File System Access APIを使用してファイルを読み込みます。
 * @returns 読み込まれたレコードデータの配列で解決されるPromise
 */
export const loadFromFile = async (): Promise<RecordItem[]> => {
  try {
    if (isFileSystemAccessSupported()) {
      // File System Access APIを使用
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'JSON files',
          accept: { 'application/json': ['.json'] },
        }],
      });
      
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('無効なデータ形式です。配列である必要があります。');
      }
      
      return data.filter(isValidRecord);
    } else {
      // フォールバック: input要素を使用
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject(new Error('ファイルが選択されませんでした。'));
            return;
          }
          
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!Array.isArray(data)) {
              throw new Error('無効なデータ形式です。配列である必要があります。');
            }
            
            resolve(data.filter(isValidRecord));
          } catch (error) {
            reject(new Error('ファイルの読み込みに失敗しました。'));
          }
        };
        
        input.click();
      });
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // ユーザーがキャンセルした場合
      throw new Error('ファイルの選択がキャンセルされました。');
    }
    throw error;
  }
};

/**
 * レコードアイテムが有効かどうかを検証します。
 * @param item 検証するレコードアイテム
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
const isValidRecord = (item: any): item is RecordItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.date === 'string' &&
    typeof item.createdAt === 'number' &&
    typeof item.updatedAt === 'number' &&
    (item.changeScore === undefined || typeof item.changeScore === 'number') &&
    typeof item.images === 'object' &&
    Array.isArray(item.images.before) &&
    Array.isArray(item.images.after) &&
    item.images.before.every((img: any) => typeof img === 'string' && img.startsWith('data:image/')) &&
    item.images.after.every((img: any) => typeof img === 'string' && img.startsWith('data:image/')) &&
    item.images.before.length === item.images.after.length &&
    (item.changeScore === undefined || (item.changeScore >= 0 && item.changeScore <= 100))
  );
};

/**
 * 自動保存機能：データが変更されるたびにファイルに保存します。
 * @param data 保存するレコードデータの配列
 * @param autoSaveEnabled 自動保存が有効かどうか
 */
export const autoSave = async (data: RecordItem[], autoSaveEnabled: boolean = false): Promise<void> => {
  if (!autoSaveEnabled || !isFileSystemAccessSupported()) {
    return;
  }
  
  try {
    // 自動保存用のファイルハンドルがあれば使用
    const autoSaveHandle = (window as any).__autoSaveFileHandle;
    if (autoSaveHandle) {
      const writable = await autoSaveHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    }
  } catch (error) {
    console.warn('自動保存に失敗しました:', error);
  }
};

/**
 * 自動保存用のファイルを設定します。
 */
export const setupAutoSave = async (): Promise<boolean> => {
  if (!isFileSystemAccessSupported()) {
    return false;
  }
  
  try {
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: 'before-after-records-auto.json',
      types: [{
        description: 'JSON files',
        accept: { 'application/json': ['.json'] },
      }],
    });
    
    (window as any).__autoSaveFileHandle = fileHandle;
    return true;
  } catch (error) {
    return false;
  }
};