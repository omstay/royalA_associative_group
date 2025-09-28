import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-register.html',
  styleUrls: ['./admin-register.css']
})
export class AdminRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Fixed validator - should be static or use proper syntax
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registerForm.value;

      try {
        await this.authService.registerAdmin(formData.email, formData.password, formData.name);
        this.successMessage = 'Registration successful! Redirecting to login...';
        
        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        
      } catch (error: any) {
        console.error('Registration error:', error);
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
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please use a different email.';
        case 'auth/weak-password':
          return 'Password is too weak. Please choose a stronger password.';
        case 'auth/invalid-email':
          return 'Invalid email address format.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';
        default:
          return error.message || 'Registration failed. Please try again.';
      }
    }
    return error?.message || 'Registration failed. Please try again.';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  hasError(field: string, errorType: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  hasFormError(errorType: string): boolean {
    return !!(this.registerForm.hasError(errorType) && 
             this.registerForm.get('confirmPassword')?.touched);
  }
}