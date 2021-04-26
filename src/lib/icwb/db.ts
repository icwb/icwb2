import * as base64 from 'base-64';
import { nanoid } from 'nanoid';
import Firebase from '../firebase/firebase';
import seed from '../../data/seed/initial_provinces_seed.json';

class ICWBDB {
  firebase: Firebase;
  
  constructor() {
    this.firebase = new Firebase();
  }

  public fetchDatas(): Promise<any> {
    return Promise.all([
      this.fetchProvinceData(),
      this.fetchEventData()
    ]);
  }

  public fetchEventData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebase.get('event', 'event')
        .then((res: any) => {
          const data = res[0].data;
          resolve(data);
        })
        .catch(reject);
    });
  }

  public fetchProvinceData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebase.get('provinces', 'provinces')
        .then((res: any) => {
          const data = res[0].data;
          resolve(data);
        })
        .catch(reject);
    });
  }

  public updateEventData(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebase.update('event', 'event', { data })
        .then(resolve)
        .catch(reject)
    });
  }

  public updateProvinceData(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebase.update('provinces', 'provinces', { data })
        .then(resolve)
        .catch(reject)
    });
  }

  public uploadImageToFirebase(imageB64: string): Promise<any> {
    const imageId = nanoid(6);
    return new Promise((resolve, reject) => {
      const byteChar = base64.decode(imageB64);
      const byteNumbers = new Array(byteChar.length);
      for (let i = 0; i < byteChar.length; i++) {
        byteNumbers[i] = byteChar.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      this.firebase.uploadFile(byteArray, `images/${imageId}.png`)
        .then(res => {
          resolve(res);
        })
        .catch(reject);
    });
  }

  public resetDatas(): Promise<[void, void]> {
    return new Promise(async (resolve, reject) => {
      const initialEvent = { date: '2030-01-01T00:00:00.000Z' };

      await this.firebase.delete('provinces', 'provinces');
      await this.firebase.db.collection('provinces').doc('provinces').set({});

      Promise.all([
        this.updateProvinceData(seed),
        this.updateEventData(initialEvent)
      ])
      .then(resolve)
      .catch(reject)
    });
  }
}

export default new ICWBDB();
