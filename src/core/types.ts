export interface SearchResult {
  score: number;
  documentId: string;
  folderId: string;
  title: string;
  preview: string;
  chunkIndex: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  folderId: string;
  folderName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  documentCount: number;
  childFolderCount: number;
}

export interface FolderDocumentsResponse {
  folder: {
    id: string;
    name: string;
  };
  documents: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }[];
}
