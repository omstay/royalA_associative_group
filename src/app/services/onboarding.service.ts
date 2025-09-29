// src/app/services/onboarding.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, Timestamp, query, orderBy } from '@angular/fire/firestore';

export interface OnboardingData {
  id?: string;
  name: string;
  slNo: string;
  address: string;
  mobileNumber: string;
  emailId: string;
  signature?: string;  // Base64 string
  fingerprint?: string;
  photo?: string;  // Base64 string
  createdAt: Date | Timestamp;
  createdBy: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  constructor(
    private firestore: Firestore
  ) {}

  // Save employee data to Firestore (with base64 images stored directly)
  async saveOnboardingData(data: OnboardingData): Promise<string> {
    try {
      // Convert Date to Firestore Timestamp
      const firestoreData = {
        ...data,
        createdAt: Timestamp.fromDate(data.createdAt as Date),
        // Ensure empty strings for missing biometric data
        signature: data.signature || '',
        fingerprint: data.fingerprint || '',
        photo: data.photo || ''
      };
      
      console.log('Saving to Firestore (base64 stored directly)');
      
      const docRef = await addDoc(collection(this.firestore, 'onboarding'), firestoreData);
      console.log('Document successfully written with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw new Error('Failed to save onboarding data to Firestore');
    }
  }

  // Retrieve all employees (ordered by creation date, newest first)
  async getAllOnboardingData(): Promise<OnboardingData[]> {
    try {
      // Create query with ordering
      const q = query(
        collection(this.firestore, 'onboarding'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn('No onboarding documents found!');
        return [];
      }

      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();

        // Ensure createdAt exists and is a Firestore Timestamp
        let createdAt: Date;
        if (docData['createdAt'] && typeof docData['createdAt'].toDate === 'function') {
          createdAt = docData['createdAt'].toDate();
        } else {
          console.warn(`Document ${doc.id} missing 'createdAt', using current date`);
          createdAt = new Date();
        }

        return {
          id: doc.id,
          name: docData['name'] || '',
          slNo: docData['slNo'] || '',
          address: docData['address'] || '',
          mobileNumber: docData['mobileNumber'] || '',
          emailId: docData['emailId'] || '',
          signature: docData['signature'] || '',
          fingerprint: docData['fingerprint'] || '',
          photo: docData['photo'] || '',
          createdBy: docData['createdBy'] || '',
          userId: docData['userId'] || '',
          createdAt
        } as OnboardingData;
      });

      console.log(`Retrieved ${data.length} onboarding records`);
      return data;
    } catch (error) {
      console.error('Error retrieving onboarding data:', error);
      throw new Error('Failed to retrieve onboarding data from Firestore');
    }
  }

  // Retrieve onboarding data for specific user
  async getOnboardingDataByUserId(userId: string): Promise<OnboardingData | null> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'onboarding'));
      const userDoc = querySnapshot.docs.find(doc => doc.data()['userId'] === userId);
      
      if (userDoc) {
        const docData = userDoc.data();
        return {
          id: userDoc.id,
          name: docData['name'] || '',
          slNo: docData['slNo'] || '',
          address: docData['address'] || '',
          mobileNumber: docData['mobileNumber'] || '',
          emailId: docData['emailId'] || '',
          signature: docData['signature'] || '',
          fingerprint: docData['fingerprint'] || '',
          photo: docData['photo'] || '',
          createdBy: docData['createdBy'] || '',
          userId: docData['userId'] || '',
          createdAt: docData['createdAt']?.toDate() || new Date()
        } as OnboardingData;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving user onboarding data:', error);
      throw new Error('Failed to retrieve user onboarding data');
    }
  }

  // Get statistics
  async getStatistics(): Promise<{
    total: number;
    thisMonth: number;
    completed: number;
  }> {
    try {
      const employees = await this.getAllOnboardingData();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const thisMonth = employees.filter(emp => {
        const empDate = emp.createdAt instanceof Date ? emp.createdAt : new Date();
        return empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear;
      }).length;
      
      const completed = employees.filter(emp => 
        emp.signature && emp.signature.trim() !== '' &&
        emp.photo && emp.photo.trim() !== '' &&
        emp.fingerprint && emp.fingerprint.trim() !== ''
      ).length;
      
      return {
        total: employees.length,
        thisMonth,
        completed
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total: 0,
        thisMonth: 0,
        completed: 0
      };
    }
  }
}