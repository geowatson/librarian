import { Action } from '@ngrx/store';
import { Document } from '../../shared/models/documents.model';

export class DocumentActions {
  static GET_ALL_DOCUMENTS = 'GET_ALL_DOCUMENTS';
  static GET_ALL_DOCUMENTS_SUCCESS = 'GET_ALL_DOCUMENTS_SUCCESS';
  static GET_DOCUMENT_DETAIL = 'GET_DOCUMENT_DETAIL';
  static GET_DOCUMENT_DETAIL_SUCCESS = 'GET_DOCUMENT_DETAIL_SUCCESS';
  static CLEAR_SELECTED_DOCUMENT = 'CLEAR_SELECTED_DOCUMENT';
  static REMOVE_DOCUMENT = 'REMOVE_DOCUMENT';
  static REMOVE_DOCUMENT_SUCCESS = 'REMOVE_DOCUMENT_SUCCESS';


  getDocumentDetail(id: number) {
    return {
      type: DocumentActions.GET_DOCUMENT_DETAIL,
      payload: id
    };
  }
  getDocumentDetailSuccess(document: Document) {
    return {
      type: DocumentActions.GET_DOCUMENT_DETAIL_SUCCESS,
      payload: document
    };
  }

  getAllDocuments() {
    return { type: DocumentActions.GET_ALL_DOCUMENTS };
  }

  getAllDocumentsSuccess(documents: Document[]) {
    return {
      type: DocumentActions.GET_ALL_DOCUMENTS_SUCCESS,
      payload: documents
    };
  }


  clearSelectedDocument() {
    return { type: DocumentActions.CLEAR_SELECTED_DOCUMENT };
  }

  removeDocument(documentId: number) {
    return {
      type: DocumentActions.REMOVE_DOCUMENT,
      payload: documentId
    };
  }

  removeDocumentSuccess(documentId: number) {
    return {
      type: DocumentActions.REMOVE_DOCUMENT_SUCCESS,
      payload: documentId
    };
  }
}
