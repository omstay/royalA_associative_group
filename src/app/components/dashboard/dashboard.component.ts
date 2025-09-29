// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { OnboardingService, OnboardingData } from '../../services/onboarding.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  employees: OnboardingData[] = [];
  filteredEmployees: OnboardingData[] = [];
  selectedEmployee: OnboardingData | null = null;
  loading = true;
  searchTerm = '';
  
  totalEmployees = 0;
  recentRegistrations = 0;
  completedProfiles = 0;

  constructor(
    private authService: AuthService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployeeData();
  }

  async loadEmployeeData(): Promise<void> {
    this.loading = true;
    try {
      this.employees = await this.onboardingService.getAllOnboardingData();
      this.filteredEmployees = [...this.employees];
      console.log('Loaded employees:', this.employees);
      this.calculateStats();
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateStats(): void {
    this.totalEmployees = this.employees.length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    this.recentRegistrations = this.employees.filter(emp => {
      const empDate = this.toDate(emp.createdAt);
      return empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear;
    }).length;
    
    this.completedProfiles = this.employees.filter(emp => 
      this.hasValidSignature(emp) && this.hasValidPhoto(emp) && this.hasValidFingerprint(emp)
    ).length;
  }

  filterEmployees(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter(emp => 
      emp.name.toLowerCase().includes(term) ||
      emp.emailId.toLowerCase().includes(term) ||
      emp.mobileNumber.includes(term) ||
      emp.slNo.toLowerCase().includes(term)
    );
  }

  // Helper methods to check if biometric data is valid
  hasValidSignature(employee: OnboardingData): boolean {
    return !!(employee.signature && employee.signature.trim() !== '');
  }

  hasValidPhoto(employee: OnboardingData): boolean {
    return !!(employee.photo && employee.photo.trim() !== '');
  }

  hasValidFingerprint(employee: OnboardingData): boolean {
    return !!(employee.fingerprint && employee.fingerprint.trim() !== '');
  }

  getStatusClass(employee: OnboardingData): string {
    const hasAll = this.hasValidSignature(employee) && 
                   this.hasValidPhoto(employee) && 
                   this.hasValidFingerprint(employee);
    return hasAll ? 'complete' : 'incomplete';
  }

  getStatusText(employee: OnboardingData): string {
    const hasAll = this.hasValidSignature(employee) && 
                   this.hasValidPhoto(employee) && 
                   this.hasValidFingerprint(employee);
    return hasAll ? 'Complete' : 'Incomplete';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  viewEmployeeDetails(employee: OnboardingData): void {
    this.selectedEmployee = employee;
    console.log('Selected employee:', employee);
  }

  closeEmployeeDetails(): void {
    this.selectedEmployee = null;
  }

  private toDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (value && typeof value.toDate === 'function') return value.toDate();
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return new Date();
  }

  formatDate(value: any): string {
    const date = this.toDate(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  async refreshData(): Promise<void> {
    this.searchTerm = '';
    await this.loadEmployeeData();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}