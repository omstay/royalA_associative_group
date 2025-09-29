// src/app/components/onboarding/onboarding.component.ts
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OnboardingService, OnboardingData } from '../../services/onboarding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingComponent implements OnInit, AfterViewInit, OnDestroy {
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
  fingerprintData = '';

  // Photo properties
  cameraActive = false;
  photoCaptured = false;
  capturedPhotoUrl = '';
  mediaStream: MediaStream | null = null;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private authService: AuthService,
    private router: Router
  ) {
    // Only basic information is required, biometrics are optional
    this.onboardingForm = this.fb.group({
      name: ['', Validators.required],
      slNo: ['', Validators.required],
      address: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    console.log('Onboarding component initialized');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeSignatureCanvas();
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  // ==================== SIGNATURE METHODS ====================
  
  private initializeSignatureCanvas(): void {
    if (this.signatureCanvas) {
      const canvas = this.signatureCanvas.nativeElement;
      this.signatureContext = canvas.getContext('2d');
      
      if (this.signatureContext) {
        this.signatureContext.strokeStyle = '#2563eb';
        this.signatureContext.lineWidth = 3;
        this.signatureContext.lineCap = 'round';
        this.signatureContext.lineJoin = 'round';
        
        this.signatureContext.fillStyle = '#ffffff';
        this.signatureContext.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  startDrawing(event: MouseEvent): void {
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

  draw(event: MouseEvent): void {
    if (!this.isDrawing || !this.signatureContext) return;
    
    event.preventDefault();
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.signatureContext.lineTo(x, y);
    this.signatureContext.stroke();
  }

  stopDrawing(): void {
    if (!this.signatureContext) return;
    this.isDrawing = false;
    this.signatureContext.closePath();
  }

  clearSignature(): void {
    if (!this.signatureContext) return;
    
    const canvas = this.signatureCanvas.nativeElement;
    this.signatureContext.clearRect(0, 0, canvas.width, canvas.height);
    
    this.signatureContext.fillStyle = '#ffffff';
    this.signatureContext.fillRect(0, 0, canvas.width, canvas.height);
    
    this.hasSignature = false;
  }

  // ==================== FINGERPRINT METHODS ====================
  
  async captureFingerprint(): Promise<void> {
    this.fingerprintLoading = true;
    this.errorMessage = '';
    
    try {
      // Simulate fingerprint capture with actual data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (Math.random() > 0.2) {
        // Generate a unique fingerprint identifier
        this.fingerprintData = `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  // ==================== CAMERA METHODS ====================
  
  async startCamera(): Promise<void> {
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

  capturePhoto(): void {
    if (!this.cameraActive || !this.mediaStream || !this.videoElement || !this.photoCanvas) {
      return;
    }

    try {
      const canvas = this.photoCanvas.nativeElement;
      const video = this.videoElement.nativeElement;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Store the photo as base64
        this.capturedPhotoUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.photoCaptured = true;
        
        this.stopCamera();
        
        this.successMessage = 'Photo captured successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      this.errorMessage = 'Failed to capture photo. Please try again.';
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.cameraActive = false;
  }

  retakePhoto(): void {
    this.photoCaptured = false;
    this.capturedPhotoUrl = '';
  }

  // ==================== FORM SUBMISSION ====================
  
  async onSubmit(): Promise<void> {
  // Only check if basic form fields are valid
  if (this.onboardingForm.valid) {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated. Please log in again.');
      }

      let signatureData = '';
      let photoData = '';

      // Get signature base64 ONLY if it exists (optional)
      if (this.hasSignature && this.signatureCanvas) {
        try {
          console.log('Capturing signature...');
          signatureData = this.signatureCanvas.nativeElement.toDataURL('image/png');
          console.log('Signature captured');
        } catch (error) {
          console.warn('Signature capture failed:', error);
        }
      }

      // Get photo base64 ONLY if captured (optional)
      if (this.photoCaptured && this.capturedPhotoUrl) {
        try {
          console.log('Using captured photo...');
          photoData = this.capturedPhotoUrl;
          console.log('Photo ready');
        } catch (error) {
          console.warn('Photo processing failed:', error);
        }
      }

      // Prepare onboarding data - save base64 directly to Firestore
      const onboardingData: OnboardingData = {
        name: this.onboardingForm.value.name,
        slNo: this.onboardingForm.value.slNo,
        address: this.onboardingForm.value.address,
        mobileNumber: this.onboardingForm.value.mobileNumber,
        emailId: this.onboardingForm.value.emailId,
        signature: signatureData || '',  // Save base64 or empty string
        fingerprint: this.fingerprintCaptured ? this.fingerprintData : '',
        photo: photoData || '',  // Save base64 or empty string
        createdAt: new Date(),
        createdBy: currentUser.uid,
        userId: currentUser.uid
      };

      console.log('Saving onboarding data (base64 stored directly)');
      await this.onboardingService.saveOnboardingData(onboardingData);
      
      // Show success message with what was saved
      const savedItems = ['Basic information'];
      if (signatureData) savedItems.push('Signature');
      if (photoData) savedItems.push('Photo');
      if (this.fingerprintCaptured) savedItems.push('Fingerprint');
      
      this.successMessage = `Employee saved successfully! (${savedItems.join(', ')})`;
      console.log('Onboarding data saved successfully');
      
      // Reset form and redirect
      setTimeout(() => {
        this.resetForm();
        this.router.navigate(['/dashboard']);
      }, 2000);

    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      this.errorMessage = error.message || 'Failed to save employee data. Please try again.';
    } finally {
      this.loading = false;
    }
  } else {
    this.markAllFieldsAsTouched();
    this.errorMessage = 'Please fill all required basic information fields.';
  }
}
  
  private markAllFieldsAsTouched(): void {
    Object.keys(this.onboardingForm.controls).forEach(key => {
      this.onboardingForm.get(key)?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.onboardingForm.reset();
    this.clearSignature();
    this.fingerprintCaptured = false;
    this.fingerprintData = '';
    this.photoCaptured = false;
    this.capturedPhotoUrl = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ==================== TEMPLATE GETTER METHODS ====================
  
  get isFormValid(): boolean {
    // Form is valid if only required basic fields are filled
    // Biometric data is completely optional
    return this.onboardingForm.valid;
  }

  getProgressPercentage(): number {
    let completedFields = 0;
    const totalFields = 8; // 5 form fields + 3 optional biometric fields

    // Count completed form fields
    const formFields = ['name', 'slNo', 'address', 'mobileNumber', 'emailId'];
    formFields.forEach(field => {
      const control = this.onboardingForm.get(field);
      if (control && control.valid) {
        completedFields++;
      }
    });

    // Count optional biometric data
    if (this.hasSignature) completedFields++;
    if (this.fingerprintCaptured) completedFields++;
    if (this.photoCaptured) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  isBasicInfoCompleted(): boolean {
    // Check if all required basic fields are filled
    const basicFields = ['name', 'slNo', 'address', 'mobileNumber', 'emailId'];
    return basicFields.every(field => {
      const control = this.onboardingForm.get(field);
      return control && control.valid;
    });
  }

  isBiometricCompleted(): boolean {
    // This is now optional, just shows if ANY biometric is captured
    return this.hasSignature || this.fingerprintCaptured || this.photoCaptured;
  }

  // Get count of captured biometrics
  getBiometricCount(): number {
    let count = 0;
    if (this.hasSignature) count++;
    if (this.fingerprintCaptured) count++;
    if (this.photoCaptured) count++;
    return count;
  }
}