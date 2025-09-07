/**
 * RecordItem構造の型定義
 * ビフォー・アフター画像の記録項目を表します
 */
export interface RecordItem {
  id: string;
  title: string;
  date: string;
  createdAt: number;
  updatedAt: number;
  changeScore?: number;
  images: {
    before: string[];
    after: string[];
  };
}

/**
 * ソート順の列挙型
 */
export enum SortOrder {
  NEWEST_FIRST = 'newest',
  OLDEST_FIRST = 'oldest'
}

/**
 * ImageComparerコンポーネントのプロパティ型
 */
export interface ImageComparerProps {
  beforeImage: string;
  afterImage?: string | null;
}

/**
 * DetailModalコンポーネントのプロパティ型
 */
export interface DetailModalProps {
  record: RecordItem;
  onClose: () => void;
  onUpdate: (record: RecordItem) => void;
}

/**
 * RecordCardコンポーネントのプロパティ型
 */
export interface RecordCardProps {
  record: RecordItem;
  onView: (record: RecordItem) => void;
  onDelete: (id: string) => void;
}

/**
 * RecordListコンポーネントのプロパティ型
 */
export interface RecordListProps {
  records: RecordItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  onView: (record: RecordItem) => void;
  onDelete: (id: string) => void;
}

/**
 * RecordFormコンポーネントのプロパティ型
 */
export interface RecordFormProps {
  onSave: (record: RecordItem) => void;
  onCancel: () => void;
}

/**
 * ImageInputコンポーネントのプロパティ型
 */
export interface ImageInputProps {
  id: string;
  label: string;
  files: string[];
  onFilesSelect: (files: File[]) => void;
}