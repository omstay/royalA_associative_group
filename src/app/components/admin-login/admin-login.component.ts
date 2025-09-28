import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    console.log('Login button clicked');
    console.log('Form valid:', this.loginForm.valid);
    
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      console.log('Attempting login with:', email);

      try {
        await this.authService.loginAdmin(email, password);
        console.log('Login successful, navigating to onboarding');
        this.router.navigate(['/onboarding']); // Navigate to onboarding page
      } catch (error: any) {
        console.error('Login error:', error);
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
          return 'Invalid email address format.';
        case 'auth/user-disabled':
          return 'This account has been disabled.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';
        default:
          return error.message || 'Login failed. Please try again.';
      }
    }
    return error?.message || 'Login failed. Please try again.';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(field: string, errorType: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.hasError(errorType) && control?.touched);
  }
}