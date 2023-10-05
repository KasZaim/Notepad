import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc,collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  firestore: Firestore = inject(Firestore);
  items$;
  items;

  constructor() { 
    this.items$ = collectionData(this.getNotesRef());
    this.items = this.items$.subscribe((list) =>{
      list.forEach(element =>{
        console.log(element);
      });
    });
    this.items.unsubscribe();
  }

  // const itemCollection = collection(this.firestore, 'items');

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
