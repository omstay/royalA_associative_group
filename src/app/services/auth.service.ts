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
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          this.currentUserSubject.next(userData);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
      
      if (userDoc.exists() && userDoc.data()['role'] === 'admin') {
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('Admin access required');
      }
    } catch (error) {
      throw error;
    }
  }

  async registerAdmin(email: string, password: string, name: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        name,
        role: 'admin'
      });
      this.router.navigate(['/dashboard']);
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDoc = await getDoc(doc(this.firestore, 'users', userCredential.user.uid));
      
      if (userDoc.exists() && userDoc.data()['role'] === 'user') {
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('User access not found');
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
