import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            this.currentUserSubject.next(userData);
            console.log('User authenticated:', userData);
          } else {
            console.log('User document not found');
            this.currentUserSubject.next(null);
          }
        } catch (error) {
          console.error('Error getting user document:', error);
          this.currentUserSubject.next(null);
        }
      } else {
        this.currentUserSubject.next(null);
        console.log('User not authenticated');
      }
    });
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    try {
      console.log('Attempting admin login for:', email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Firebase auth successful');
      
      const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
      console.log('User document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);
        
        if (userData['role'] === 'admin') {
          console.log('Admin role confirmed, navigating to dashboard');
          this.currentUserSubject.next(userData as User);
          // Don't navigate here - let the component handle navigation
          return;
        } else {
          throw new Error('Admin access required');
        }
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async registerAdmin(email: string, password: string, name: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userData = {
        uid: userCredential.user.uid,
        email,
        name,
        role: 'admin' as const
      };
      
      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), userData);
      this.currentUserSubject.next(userData);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData['role'] === 'user') {
          this.currentUserSubject.next(userData as User);
          this.router.navigate(['/dashboard']);
        } else {
          throw new Error('User access not found');
        }
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }
}