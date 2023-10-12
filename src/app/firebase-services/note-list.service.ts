import { Injectable, inject } from '@angular/core';
import { Firestore,orderBy,where,query,limit, collection, doc, collectionData, onSnapshot, addDoc,updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note.interface';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;
  
  firestore: Firestore = inject(Firestore);
  
  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();

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

    async addNote(item: Note, colId: "notes" | "trash") {
      if (colId == "notes"){
      await addDoc(this.getNotesRef(), item)
        .catch((err) => {
          console.error(err);
        }) 
      } else {
        await addDoc(this.getTrashRef(), item)
        .catch((err) => {
          console.error(err);
        }) 
      }
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
    this.unsubMarkedNotes();
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
    const q = query(this.getNotesRef(),orderBy("title"),limit(100));//where("marked", "==", true)
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }
  
  subMarkedNotesList() {
    const q = query(this.getNotesRef(),where("marked", "==", true),limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
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
