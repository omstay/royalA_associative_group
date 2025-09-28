// src/app/components/onboarding/onboarding.component.ts
import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnboardingService, OnboardingData } from '../../services/onboarding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingComponent implements OnInit, OnDestroy {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('photoCanvas') photoCanvas!: ElementRef<HTMLCanvasElement>;

  onboardingForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Signature properties
  isDrawing = false;
  signatureContext: CanvasRenderingContext2D | null = null;
  hasSignature = false;

  // Fingerprint properties
  fingerprintLoading = false;
  fingerprintCaptured = false;

  // Photo properties
  cameraActive = false;
  photoCaptured = false;
  capturedPhotoUrl = '';
  mediaStream: MediaStream | null = null;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private authService: AuthService
  ) {
    this.onboardingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slNo: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      mobileNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)
      ]],
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Initialize component
  }

  ngAfterViewInit() {
    this.initializeSignatureCanvas();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  // Initialize signature canvas
  private initializeSignatureCanvas() {
    if (this.signatureCanvas) {
      const canvas = this.signatureCanvas.nativeElement;
      this.signatureContext = canvas.getContext('2d');
      
      if (this.signatureContext) {
        this.signatureContext.strokeStyle = '#2563eb';
        this.signatureContext.lineWidth = 3;
        this.signatureContext.lineCap = 'round';
        this.signatureContext.lineJoin = 'round';
        
        // Set canvas background
        this.signatureContext.fillStyle = '#ffffff';
        this.signatureContext.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  // Signature Methods
  startDrawing(event: MouseEvent) {
    if (!this.signatureContext) return;
    
    event.preventDefault();
    this.isDrawing = true;
    this.hasSignature = true;
    
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.signatureContext.beginPath();
    this.signatureContext.moveTo(x, y);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing || !this.signatureContext) return;
    
    event.preventDefault();
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.signatureContext.lineTo(x, y);
    this.signatureContext.stroke();
  }

  stopDrawing() {
    if (!this.signatureContext) return;
    this.isDrawing = false;
    this.signatureContext.closePath();
  }

  clearSignature() {
    if (!this.signatureContext) return;
    
    const canvas = this.signatureCanvas.nativeElement;
    this.signatureContext.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset canvas background
    this.signatureContext.fillStyle = '#ffffff';
    this.signatureContext.fillRect(0, 0, canvas.width, canvas.height);
    
    this.hasSignature = false;
  }

  // Fingerprint Methods
  async captureFingerprint() {
    this.fingerprintLoading = true;
    this.errorMessage = '';
    
    try {
      // Simulate fingerprint capture API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success/failure (80% success rate)
      if (Math.random() > 0.2) {
        this.fingerprintCaptured = true;
        this.successMessage = 'Fingerprint captured successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        throw new Error('Fingerprint capture failed. Please try again.');
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to capture fingerprint. Please try again.';
      setTimeout(() => this.errorMessage = '', 5000);
    } finally {
      this.fingerprintLoading = false;
    }
  }

  // Camera Methods
  async startCamera() {
    try {
      this.errorMessage = '';
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream;
        this.cameraActive = true;
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      this.errorMessage = 'Failed to access camera. Please check permissions and try again.';
    }
  }

  capturePhoto() {
    if (!this.cameraActive || !this.mediaStream || !this.videoElement || !this.photoCanvas) {
      return;
    }

    try {
      const canvas = this.photoCanvas.nativeElement;
      const video = this.videoElement.nativeElement;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        this.capturedPhotoUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.photoCaptured = true;
        
        // Stop camera after capturing
        this.stopCamera();
        
        this.successMessage = 'Photo captured successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      }
    } catch (error) {
      this.errorMessage = 'Failed to capture photo. Please try again.';
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.cameraActive = false;
  }

  retakePhoto() {
    this.photoCaptured = false;
    this.capturedPhotoUrl = '';
  }

  // Form submission
  async onSubmit() {
    if (this.onboardingForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        // Validate required biometric data
        if (!this.hasSignature) {
          throw new Error('Please provide your signature.');
        }

        if (!this.fingerprintCaptured) {
          throw new Error('Please capture your fingerprint.');
        }

        if (!this.photoCaptured) {
          throw new Error('Please capture your photo.');
        }

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated. Please log in again.');
        }

        // Upload files to Firebase Storage
        let signatureUrl = '';
        let photoUrl = '';

        try {
          // Upload signature
          if (this.hasSignature) {
            signatureUrl = await this.onboardingService.uploadBase64File(
              this.signatureCanvas.nativeElement.toDataURL('image/png'),
              'signature.png',
              currentUser.uid
            );
          }

          // Upload photo
          if (this.capturedPhotoUrl) {
            photoUrl = await this.onboardingService.uploadBase64File(
              this.capturedPhotoUrl,
              'photo.jpg',
              currentUser.uid
            );
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          throw new Error('Failed to upload files. Please try again.');
        }

        const onboardingData: OnboardingData = {
          ...this.onboardingForm.value,
          signature: signatureUrl,
          fingerprint: this.fingerprintCaptured ? 'captured' : '',
          photo: photoUrl,
          createdAt: new Date(),
          createdBy: currentUser.uid,
          userId: currentUser.uid
        };

        await this.onboardingService.saveOnboardingData(onboardingData);
        
        this.successMessage = 'Employee data saved successfully!';
        
        // Reset form after successful submission
        setTimeout(() => {
          this.resetForm();
          // Redirect to dashboard or next page
          window.location.href = '/dashboard';
        }, 2000);

      } catch (error: any) {
        console.error('Onboarding submission error:', error);
        this.errorMessage = error.message || 'Failed to save employee data. Please try again.';
      } finally {
        this.loading = false;
      }
    } else {
      this.markAllFieldsAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
    }
  }

  // Helper methods
  private markAllFieldsAsTouched() {
    Object.keys(this.onboardingForm.controls).forEach(key => {
      this.onboardingForm.get(key)?.markAsTouched();
    });
  }

  private resetForm() {
    this.onboardingForm.reset();
    this.clearSignature();
    this.fingerprintCaptured = false;
    this.photoCaptured = false;
    this.capturedPhotoUrl = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Getter methods for template
  get isFormValid(): boolean {
    return this.onboardingForm.valid && this.hasSignature && this.fingerprintCaptured && this.photoCaptured;
  }

  // Progress calculation
  getProgressPercentage(): number {
    let completedFields = 0;
    let totalFields = 7; // 5 form fields + signature + fingerprint + photo

    // Check form fields
    const formFields = ['name', 'slNo', 'address', 'mobileNumber', 'emailId'];
    formFields.forEach(field => {
      const control = this.onboardingForm.get(field);
      if (control && control.valid) {
        completedFields++;
      }
    });

    // Check biometric data
    if (this.hasSignature) completedFields++;
    if (this.fingerprintCaptured) completedFields++;
    if (this.photoCaptured) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  // Section completion checks
  isBasicInfoCompleted(): boolean {
    const basicFields = ['name', 'slNo', 'address', 'mobileNumber', 'emailId'];
    return basicFields.every(field => {
      const control = this.onboardingForm.get(field);
      return control && control.valid;
    });
  }

  isBiometricCompleted(): boolean {
    return this.hasSignature && this.fingerprintCaptured;
  }
}