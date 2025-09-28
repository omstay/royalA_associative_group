// src/app/components/onboarding/onboarding.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnboardingService, OnboardingData } from '../../services/onboarding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="onboarding-container">
      <div class="onboarding-card">
        <div class="card-header">
          <h2>Employee Onboarding</h2>
          <p>Royal Associates Group</p>
        </div>

        <form [formGroup]="onboardingForm" (ngSubmit)="onSubmit()" class="onboarding-form">
          
          <!-- Basic Information -->
          <div class="section">
            <h3>Basic Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  formControlName="name"
                  class="form-control"
                  placeholder="Enter full name"
                  [class.error]="onboardingForm.get('name')?.invalid && onboardingForm.get('name')?.touched"
                >
                <div *ngIf="onboardingForm.get('name')?.invalid && onboardingForm.get('name')?.touched" class="error-message">
                  <small>Name is required</small>
                </div>
              </div>

              <div class="form-group">
                <label for="slNo">Serial Number *</label>
                <input 
                  type="text" 
                  id="slNo" 
                  formControlName="slNo"
                  class="form-control"
                  placeholder="Enter serial number"
                  [class.error]="onboardingForm.get('slNo')?.invalid && onboardingForm.get('slNo')?.touched"
                >
                <div *ngIf="onboardingForm.get('slNo')?.invalid && onboardingForm.get('slNo')?.touched" class="error-message">
                  <small>Serial number is required</small>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="address">Address *</label>
              <textarea 
                id="address" 
                formControlName="address"
                class="form-control textarea"
                rows="3"
                placeholder="Enter full address"
                [class.error]="onboardingForm.get('address')?.invalid && onboardingForm.get('address')?.touched"
              ></textarea>
              <div *ngIf="onboardingForm.get('address')?.invalid && onboardingForm.get('address')?.touched" class="error-message">
                <small>Address is required</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="mobileNumber">Mobile Number *</label>
                <input 
                  type="tel" 
                  id="mobileNumber" 
                  formControlName="mobileNumber"
                  class="form-control"
                  placeholder="Enter mobile number"
                  [class.error]="onboardingForm.get('mobileNumber')?.invalid && onboardingForm.get('mobileNumber')?.touched"
                >
                <div *ngIf="onboardingForm.get('mobileNumber')?.invalid && onboardingForm.get('mobileNumber')?.touched" class="error-message">
                  <small *ngIf="onboardingForm.get('mobileNumber')?.errors?.['required']">Mobile number is required</small>
                  <small *ngIf="onboardingForm.get('mobileNumber')?.errors?.['pattern']">Please enter a valid mobile number</small>
                </div>
              </div>

              <div class="form-group">
                <label for="emailId">Email ID *</label>
                <input 
                  type="email" 
                  id="emailId" 
                  formControlName="emailId"
                  class="form-control"
                  placeholder="Enter email address"
                  [class.error]="onboardingForm.get('emailId')?.invalid && onboardingForm.get('emailId')?.touched"
                >
                <div *ngIf="onboardingForm.get('emailId')?.invalid && onboardingForm.get('emailId')?.touched" class="error-message">
                  <small *ngIf="onboardingForm.get('emailId')?.errors?.['required']">Email is required</small>
                  <small *ngIf="onboardingForm.get('emailId')?.errors?.['email']">Please enter a valid email</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Biometric Information -->
          <div class="section">
            <h3>Biometric Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Signature</label>
                <div class="signature-container">
                  <canvas 
                    #signatureCanvas
                    class="signature-canvas"
                    (mousedown)="startDrawing($event)"
                    (mousemove)="draw($event)"
                    (mouseup)="stopDrawing()"
                    (mouseleave)="stopDrawing()"
                    width="300"
                    height="150"
                  ></canvas>
                  <div class="signature-controls">
                    <button type="button" class="btn btn-secondary" (click)="clearSignature()">Clear</button>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Fingerprint</label>
                <div class="fingerprint-container">
                  <button 
                    type="button" 
                    class="btn btn-outline fingerprint-btn"
                    (click)="captureFingerprint()"
                    [disabled]="fingerprintLoading"
                  >
                    <div class="fingerprint-icon">👆</div>
                    <span *ngIf="!fingerprintLoading">Scan Fingerprint</span>
                    <span *ngIf="fingerprintLoading">Scanning...</span>
                  </button>
                  <div *ngIf="fingerprintCaptured" class="fingerprint-success">
                    ✓ Fingerprint captured successfully
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Photo Capture -->
          <div class="section">
            <h3>Photo Capture</h3>
            
            <div class="photo-capture-container">
              <div class="camera-container" *ngIf="!photoCaptured">
                <video 
                  #videoElement
                  class="camera-preview"
                  [style.display]="cameraActive ? 'block' : 'none'"
                  autoplay
                  playsinline
                ></video>
                <canvas #photoCanvas style="display: none;"></canvas>
                
                <div class="camera-controls">
                  <button 
                    type="button" 
                    class="btn btn-primary"
                    (click)="startCamera()"
                    *ngIf="!cameraActive"
                  >
                    Start Camera
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-success"
                    (click)="capturePhoto()"
                    *ngIf="cameraActive"
                  >
                    📸 Capture Photo
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    (click)="stopCamera()"
                    *ngIf="cameraActive"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
              
              <div class="photo-preview" *ngIf="photoCaptured">
                <img [src]="capturedPhotoUrl" alt="Captured photo" class="captured-photo">
                <div class="photo-controls">
                  <button type="button" class="btn btn-secondary" (click)="retakePhoto()">
                    Retake Photo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-secondary"
              routerLink="/dashboard"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="onboardingForm.invalid || loading"
            >
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Saving...' : 'Save Employee Data' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('photoCanvas') photoCanvas!: ElementRef<HTMLCanvasElement>;

  onboardingForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Signature
  isDrawing = false;
  signatureContext: CanvasRenderingContext2D | null = null;

  // Fingerprint
  fingerprintLoading = false;
  fingerprintCaptured = false;

  // Photo
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
      name: ['', [Validators.required]],
      slNo: ['', [Validators.required]],
      address: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  ngAfterViewInit() {
    if (this.signatureCanvas) {
      this.signatureContext = this.signatureCanvas.nativeElement.getContext('2d');
      if (this.signatureContext) {
        this.signatureContext.strokeStyle = '#000';
        this.signatureContext.lineWidth = 2;
        this.signatureContext.lineCap = 'round';
      }
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  // Signature Methods
  startDrawing(event: MouseEvent) {
    if (!this.signatureContext) return;
    this.isDrawing = true;
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    this.signatureContext.beginPath();
    this.signatureContext.moveTo(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing || !this.signatureContext) return;
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    this.signatureContext.lineTo(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    this.signatureContext.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearSignature() {
    if (!this.signatureContext) return;
    this.signatureContext.clearRect(
      0, 0,
      this.signatureCanvas.nativeElement.width,
      this.signatureCanvas.nativeElement.height
    );
  }

  // Fingerprint Methods
  async captureFingerprint() {
    this.fingerprintLoading = true;
    try {
      // Simulate fingerprint capture (replace with actual fingerprint API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.fingerprintCaptured = true;
      this.successMessage = 'Fingerprint captured successfully';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      this.errorMessage = 'Failed to capture fingerprint. Please try again.';
    } finally {
      this.fingerprintLoading = false;
    }
  }

  // Camera Methods
  async startCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      this.videoElement.nativeElement.srcObject = this.mediaStream;
      this.cameraActive = true;
    } catch (error) {
      this.errorMessage = 'Failed to access camera. Please check permissions.';
    }
  }

  capturePhoto() {
    if (!this.cameraActive || !this.mediaStream) return;

    const canvas = this.photoCanvas.nativeElement;
    const video = this.videoElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      this.capturedPhotoUrl = canvas.toDataURL('image/jpeg', 0.8);
      this.photoCaptured = true;
      this.stopCamera();
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

  async onSubmit() {
    if (this.onboardingForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const onboardingData: OnboardingData = {
          ...this.onboardingForm.value,
          signature: this.signatureCanvas.nativeElement.toDataURL(),
          fingerprint: this.fingerprintCaptured ? 'captured' : '',
          photo: this.capturedPhotoUrl,
          createdAt: new Date(),
          createdBy: currentUser.uid
        };

        await this.onboardingService.saveOnboardingData(onboardingData);
        this.successMessage = 'Employee data saved successfully!';
        
        // Reset form after successful submission
        setTimeout(() => {
          this.onboardingForm.reset();
          this.clearSignature();
          this.fingerprintCaptured = false;
          this.photoCaptured = false;
          this.capturedPhotoUrl = '';
          this.successMessage = '';
        }, 2000);

      } catch (error: any) {
        this.errorMessage = error.message || 'Failed to save employee data. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
}