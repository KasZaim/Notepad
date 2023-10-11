import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc,updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note.interface';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  
  firestore: Firestore = inject(Firestore);
  
  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();

  }

  async deleteNote(colId: "notes"|"trash", docId: string){
    await deleteDoc(this.getSingleDoc(colId, docId)).catch(
      (err) => {console.log(err)}
    )
  }

  async updateNote(note:Note){
    if (note.id) {
      let docRef = this.getSingleDoc(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) =>{console.log(err);}
        );
      }
    }

    getCleanJson(note:Note):{}{
      return {
        type: note.type,
        title: note.title,
        content: note.content,
        marked: note.marked,
      }
    }

    getColIdFromNote(note:Note){
      if (note.type == 'note') {
        return 'notes'
      }else{
        return 'trash'
      }
    }

  async addNote(item: Note, colId: "notes" | "trash"){
     await addDoc(this.getNotesRef(), item).catch(
      (err) => {console.error(err)}
    ).then(
      (docRef) => {console.log("Document written with ID: ", docRef?.id);}
    )
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",// || ist der "or Operator"
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDoc(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
