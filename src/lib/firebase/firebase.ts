import firebase from 'firebase/app';
import FirebaseConfig from '../../config/firebase';
import seed from '../../data/seed/initial_provinces_seed.json';

import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

global.XMLHttpRequest = require('xhr2');

const app = !firebase.apps.length ? firebase.initializeApp(FirebaseConfig.appConfig) : firebase.app();

class Firebase {
  public db: firebase.firestore.Firestore;
  public storage: firebase.storage.Storage;

  constructor() {
    this.db = app.firestore();
    this.storage = app.storage(FirebaseConfig.storageUrl);

    if (FirebaseConfig.auth.email && FirebaseConfig.auth.password) {
      app.auth().signInWithEmailAndPassword(FirebaseConfig.auth.email, FirebaseConfig.auth.password);
    }
  }
  
  public getWhere(collection: string, where: [string, firebase.firestore.WhereFilterOp, any]) {
    return new Promise(async (resolve, reject) => {
      let data: any = [];

      this.db.collection(collection).where(where[0], where[1], where[2]).get()
        .then((snapshot) => {
          snapshot.forEach(doc => {
            data.push({
              id: doc.id,
              data: doc.data()
            });
          });
          resolve(data);
        })
        .catch(reject);
    });
  }

  public get(collection: string, documentId?: string) {
    return new Promise(async (resolve, reject) => {
      let data: any = [];

      if (documentId) {
        this.db.collection(collection).doc(documentId).get()
          .then((snapshot) => {
            data.push({
              id: snapshot.id,
              data: snapshot.data()
            });
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      }
      else {
        this.db.collection(collection).get()
          .then((snapshot) => {
            snapshot.forEach(doc => {
              data.push({
                id: doc.id,
                data: doc.data()
              });
            });
            resolve(data);
          })
          .catch(reject);
      }
    });
  }

  public add(collection: string, data: any) {
    return new Promise(async (resolve, reject) => {
      this.db.collection(collection).add(data)
        .then(resolve)
        .catch(reject);
    });
  }

  public update(collection: string, docId: string, data: any) {
    return new Promise(async (resolve, reject) => {
      this.db.collection(collection).doc(docId).update(data)
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public getFiles(folder?: string) {
    return new Promise(async (resolve, reject) => {
      const listRef = this.storage.ref(folder);
      const bucket = listRef.bucket;

      listRef.listAll()
        .then((res) => {
          let folders: firebase.storage.Reference[] = [];
          let files: firebase.storage.Reference[] = [];

          res.prefixes.forEach((ref) => folders.push(ref));
          res.items.forEach((ref) => files.push(ref));

          const urls = files.map((ref) => (`https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(ref.fullPath)}?alt=media`));
          const file = files.map((ref) => ({
            src: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(ref.fullPath)}?alt=media`,
            path: ref.fullPath,
          }));

          resolve({ folders, fileUrl: urls, file });
        })
        .catch(reject);
    });
  }

  public uploadFile(file: any, childRef: string) {
    return new Promise(async (resolve, reject) => {
      const metadata = { contentType: file.type };
      const storageRef = this.storage.ref(childRef);
      const uploadTask = storageRef.put(file, metadata);

      uploadTask.on('state_changed',
        () => { },
        (err) => { reject(err) },
        async () => {
          let dlUrl: any;
          await uploadTask.snapshot.ref.getDownloadURL()
            .then((downloadURL) => {
              dlUrl = downloadURL;
            });
          resolve(dlUrl);
        }
      )
    });
  }

  public uploadBase64(b64: string, childRef: string) {
    return new Promise(async (resolve, reject) => {
      const storageRef = this.storage.ref(childRef);
      const uploadTask = storageRef.putString(b64, 'base64');

      uploadTask.on('state_changed',
        () => { },
        (err) => { reject(err) },
        async () => {
          let dlUrl: any;
          await uploadTask.snapshot.ref.getDownloadURL()
            .then((downloadURL) => {
              dlUrl = downloadURL;
            });
          resolve(dlUrl);
        }
      )
    });
  }

  public delete(collection: string, docId: string) {
    return new Promise(async (resolve, reject) => {
      this.db.collection(collection).doc(docId).delete()
        .then(resolve)
        .catch(reject);
    });
  }
}

export default Firebase;
