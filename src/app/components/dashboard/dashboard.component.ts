// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { OnboardingService, OnboardingData } from '../../services/onboarding.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <h1>Welcome, {{ currentUser?.name || 'User' }}!</h1>
            <p>Royal Associates Group Dashboard</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="logout()">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>{{ totalEmployees }}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <h3>{{ recentRegistrations }}</h3>
              <p>This Month</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>{{ completedProfiles }}</h3>
              <p>Complete Profiles</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <div class="action-card" routerLink="/onboarding">
              <div class="action-icon">👤</div>
              <h3>Add New Employee</h3>
              <p>Register a new employee with complete onboarding process</p>
            </div>
            
            <div class="action-card" (click)="refreshData()">
              <div class="action-icon">🔄</div>
              <h3>Refresh Data</h3>
              <p>Update employee records and statistics</p>
            </div>
          </div>
        </div>

        <!-- Recent Employees -->
        <div class="section">
          <h2>Recent Employees</h2>
          <div class="employees-table-container">
            <table class="employees-table" *ngIf="employees.length > 0">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let employee of employees.slice(0, 10)">
                  <td>{{ employee.slNo }}</td>
                  <td>{{ employee.name }}</td>
                  <td>{{ employee.emailId }}</td>
                  <td>{{ employee.mobileNumber }}</td>
                  <td>{{ employee.createdAt | date:'shortDate' }}</td>
                  <td>
                    <span class="status-badge" 
                          [ngClass]="{
                            'complete': employee.signature && employee.photo,
                            'incomplete': !employee.signature || !employee.photo
                          }">
                      {{ (employee.signature && employee.photo) ? 'Complete' : 'Incomplete' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="empty-state" *ngIf="employees.length === 0 && !loading">
              <div class="empty-icon">📋</div>
              <h3>No Employees Found</h3>
              <p>Start by adding your first employee to the system</p>
              <button class="btn btn-primary" routerLink="/onboarding">
                Add First Employee
              </button>
            </div>
            
            <div class="loading-state" *ngIf="loading">
              <div class="spinner"></div>
              <p>Loading employee data...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  employees: OnboardingData[] = [];
  loading = true;
  
  totalEmployees = 0;
  recentRegistrations = 0;
  completedProfiles = 0;

  constructor(
    private authService: AuthService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployeeData();
  }

  async loadEmployeeData() {
    this.loading = true;
    try {
      this.employees = await this.onboardingService.getAllOnboardingData();
      this.calculateStats();
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateStats() {
    this.totalEmployees = this.employees.length;
    
    // Calculate recent registrations (this month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.recentRegistrations = this.employees.filter(emp => {
      const empDate = new Date(emp.createdAt);
      return empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear;
    }).length;
    
    // Calculate completed profiles
    this.completedProfiles = this.employees.filter(emp => 
      emp.signature && emp.photo && emp.fingerprint
    ).length;
  }

  async refreshData() {
    await this.loadEmployeeData();
  }

  async logout() {
    await this.authService.logout();
  }
}