import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

export interface OnboardingData {
  id?: string;
  name: string;
  slNo: string;
  address: string;
  mobileNumber: string;
  emailId: string;
  signature?: string;
  fingerprint?: string;
  photo?: string;
  createdAt: Date;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  async saveOnboardingData(data: OnboardingData): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'onboarding'), data);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      throw error;
    }
  }

  async getAllOnboardingData(): Promise<OnboardingData[]> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'onboarding'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as OnboardingData));
    } catch (error) {
      throw error;
    }
  }
}

