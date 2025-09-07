/**
 * アプリケーション定数
 */

// ローカルストレージのキー
export const LOCAL_STORAGE_KEY = 'beforeAfterRecords';

// 画像処理の設定
export const IMAGE_MAX_DIMENSION = 800; // 画像の最大辺のサイズ（px）
export const IMAGE_JPEG_QUALITY = 0.8; // JPEG圧縮品質（0-1）

// 画像数の制限
export const MIN_IMAGE_COUNT = 1; // ビフォー・アフターそれぞれの最小画像数
export const MAX_IMAGE_COUNT = 3; // ビフォー・アフターそれぞれの最大画像数

// ファイルサイズ制限
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ローカルストレージ容量制限
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB（文字数換算）