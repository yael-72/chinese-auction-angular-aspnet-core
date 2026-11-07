# 🎁 Chinese Sales Lottery System

> A comprehensive full-stack web application for managing lottery raffles, donor tracking, and gift distribution with integrated email notifications and advanced reporting capabilities.

[![Language](https://img.shields.io/badge/Frontend-Angular%2018-red?style=flat-square)](https://angular.io)
[![Language](https://img.shields.io/badge/Backend-C%23%20.NET%208-blue?style=flat-square)](https://dotnet.microsoft.com)
[![Database](https://img.shields.io/badge/Database-SQL%20Server-orange?style=flat-square)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Screenshots & Demo](#screenshots--demo)
- [Code Quality & Best Practices](#code-quality--best-practices)
- [What I Learned](#what-i-learned)
- [Future Enhancements](#future-enhancements)
- [Deployment](#deployment)
- [Credits](#credits)

---

## 🎯 Overview

The **Chinese Sales Lottery System** is a complete solution for managing charitable raffles and donations. It enables organizations to:

- **Manage Donors** - Track donor information, contributions, and donation history
- **Organize Lotteries** - Create and manage lottery events with ticket distribution
- **Distribute Gifts** - Categorize and allocate prizes to winners
- **Track Tickets** - Maintain complete audit trail of ticket sales and winners
- **Automated Notifications** - Send winner notifications and confirmations via email
- **Generate Reports** - Comprehensive analytics and business intelligence dashboards

This project demonstrates full-stack development expertise with a focus on enterprise-grade features including error handling, security, logging, and data persistence.

---

## ⭐ Key Features

1. **User Authentication & Authorization**
   - Secure login system with JWT token-based authentication
   - Role-based access control for different user types
   - Password management and validation

2. **Comprehensive Donor Management**
   - Complete donor profile management
   - Donation history and tracking
   - Donor classification and segmentation

3. **Advanced Lottery Management**
   - Create and manage multiple lottery events
   - Automated ticket generation and distribution
   - Real-time lottery status monitoring
   - Winner selection and management

4. **Gift & Prize Management**
   - Categorized gift repository
   - Prize allocation and distribution tracking
   - Gift availability status management

5. **Automated Email Notifications**
   - Winner notification system
   - Donation confirmations
   - Custom email templates
   - Batch email sending capabilities

6. **Comprehensive Reporting & Analytics**
   - Revenue analytics
   - Donation reports
   - Lottery performance metrics
   - Winner statistics
   - Export capabilities (CSV/Excel)

7. **Enterprise-Grade Error Handling**
   - Global exception handling middleware
   - Custom exception types for business logic
   - Detailed error logging
   - User-friendly error messages

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Angular 18 (Standalone Components)
- **Language:** TypeScript
- **Styling:** SCSS
- **HTTP Client:** Angular HttpClient with interceptors
- **Build Tool:** Angular CLI
- **Authentication:** JWT Token Interceptor

### Backend
- **Framework:** .NET 8
- **Language:** C# 12
- **API:** ASP.NET Core REST API
- **ORM:** Entity Framework Core
- **Database:** SQL Server
- **Email:** SMTP Integration
- **Logging:** Custom middleware logging
- **Validation:** FluentValidation / Data Annotations

### Database
- **Engine:** SQL Server
- **Migrations:** Entity Framework Core Code-First
- **Design:** Normalized relational schema

### Development Tools
- **Version Control:** Git
- **IDE:** Visual Studio / VS Code
- **Package Manager:** npm (Frontend), NuGet (Backend)

---

## 📁 Project Structure

```
ChineseSalesProject/
├── Client/                                 # Angular Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── Components/
│   │   │   │   ├── Feature/               # Feature-specific components
│   │   │   │   ├── footer/                # Footer component
│   │   │   │   ├── home/                  # Home/landing page
│   │   │   │   ├── navigation/            # Navigation component
│   │   │   │   └── shared/                # Reusable shared components
│   │   │   ├── model/                     # TypeScript interfaces and models
│   │   │   │   ├── category.model.ts
│   │   │   │   ├── donor.model.ts
│   │   │   │   ├── gift.model.ts
│   │   │   │   ├── ticket.model.ts
│   │   │   │   └── lottery.model.ts
│   │   │   ├── services/                  # API service layer
│   │   │   ├── app.config.ts              # App configuration
│   │   │   ├── app.routes.ts              # Route definitions
│   │   │   ├── authInterceptor.ts         # HTTP auth interceptor
│   │   │   └── app.ts                     # Root component
│   │   ├── assets/
│   │   │   └── forms/                     # Form assets and templates
│   │   ├── styles.scss                    # Global styles
│   │   └── main.ts                        # Application entry point
│   ├── angular.json                       # Angular CLI configuration
│   ├── package.json                       # NPM dependencies
│   └── tsconfig.json                      # TypeScript configuration
│
├── Server/                                 # .NET Backend Application
│   ├── FinalProject/
│   │   ├── Controllers/                   # API Controllers
│   │   │   ├── AuthController.cs
│   │   │   ├── DonorController.cs
│   │   │   ├── LotteryController.cs
│   │   │   ├── GiftController.cs
│   │   │   ├── TicketController.cs
│   │   │   ├── CategoryController.cs
│   │   │   ├── ReportController.cs
│   │   │   └── MailController.cs
│   │   ├── BLL/                           # Business Logic Layer
│   │   │   ├── AuthService.cs
│   │   │   ├── DonorService.cs
│   │   │   ├── LotteryService.cs
│   │   │   ├── GiftService.cs
│   │   │   ├── TicketService.cs
│   │   │   ├── EmailService.cs
│   │   │   ├── ReportService.cs
│   │   │   └── Interfaces/
│   │   ├── DAL/                           # Data Access Layer
│   │   │   ├── AuthDAL.cs
│   │   │   ├── DonorDAL.cs
│   │   │   ├── LotteryDAL.cs
│   │   │   ├── GiftDAL.cs
│   │   │   ├── TicketDAL.cs
│   │   │   ├── CheineseSaleContext.cs     # DbContext
│   │   │   └── Interfaces/
│   │   ├── Models/                        # Entity Models
│   │   │   ├── Donor.cs
│   │   │   ├── Gift.cs
│   │   │   ├── Ticket.cs
│   │   │   ├── Lottery.cs
│   │   │   ├── Category.cs
│   │   │   ├── User.cs
│   │   │   └── DTO/                       # Data Transfer Objects
│   │   ├── Exceptions/                    # Custom Exceptions
│   │   │   ├── BusinessException.cs
│   │   │   ├── NotFoundException.cs
│   │   │   └── ConflictException.cs
│   │   ├── Middleware/                    # Custom Middleware
│   │   │   ├── GlobalExceptionHandlerMiddleware.cs
│   │   │   └── RequestLoggingMiddleware.cs
│   │   ├── Migrations/                    # EF Core Migrations
│   │   ├── Program.cs                     # Application startup
│   │   ├── appsettings.json               # Configuration
│   │   ├── appsettings.Development.json
│   │   ├── FinalProject.csproj            # Project file
│   │   └── request_logs.txt               # Request logging output
│   └── FinalProject.sln                   # Solution file
│
├── ScreenShots/                            # Application screenshots
└── README.md                               # This file
```

---

## 📋 Installation & Setup

### Prerequisites

- **Frontend:**
  - Node.js 18+ and npm
  - Angular CLI 18+
  
- **Backend:**
  - .NET 8 SDK
  - SQL Server 2019+ (or SQL Server Express)
  - Visual Studio 2022 / VS Code

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ChineseSalesProject
```

### Step 2: Frontend Setup

```bash
cd Client

# Install dependencies
npm install

# Configure environment (if needed)
# Edit src/environments/environment.ts with API URL
```

### Step 3: Backend Setup

```bash
cd ../Server/Api

# Restore NuGet packages
dotnet restore
```

### Step 4: Configure Local Secrets

Set secrets with the .NET Secret Manager from `Server/Api` so credentials are not committed:

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<a unique random key of at least 32 characters>"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your SQL Server connection string>"
dotnet user-secrets set "EmailSettings:From" "<your sender email>"
dotnet user-secrets set "EmailSettings:Username" "<your SMTP username>"
dotnet user-secrets set "EmailSettings:Password" "<your SMTP app password>"

# Apply database migrations
dotnet ef database update
```

### Step 5: Run the Application

**Backend:**
```bash
cd Server/FinalProject
dotnet run
# API runs on https://localhost:5001
```

**Frontend:**
```bash
cd Client
ng serve
# Application opens on http://localhost:4200
```

---

## 🚀 Usage Guide

### Authentication

1. **Login**
   - Navigate to the login page
   - Enter credentials (Admin account available)
   - System issues JWT token valid for 60 minutes

2. **Token Refresh**
   - Automatically handled by auth interceptor
   - Invalid tokens redirect to login page

### Managing Donors

1. **Add Donor**
   - Navigate to Donors section
   - Click "Add New Donor"
   - Enter donor information (name, email, phone, address)
   - Save changes

2. **View Donation History**
   - Select donor from list
   - View all associated donations and tickets
   - Export history if needed

### Creating a Lottery

1. **Initialize Lottery**
   - Go to Lottery Management
   - Click "Create New Lottery"
   - Set lottery name, date, ticket price
   - Define ticket quantity

2. **Distribute Tickets**
   - Assign tickets to donors
   - Automatic email notifications sent
   - Track ticket status and payments

3. **Select Winners**
   - Draw winners randomly or manually
   - System automatically assigns prizes
   - Send winner notifications via email

### Generating Reports

1. **Access Reports Dashboard**
   - Navigate to Reports section
   - Select report type (Revenue, Donations, Winners, etc.)
   - Choose date range
   - View charts and analytics
   - Export as CSV/PDF

---

## 🗄️ Database Models

### Core Entities

**Donor**
- ID (Primary Key)
- FirstName, LastName
- Email, PhoneNumber
- Address, City, PostalCode
- RegistrationDate
- Relationship: 1-to-Many with Tickets

**Lottery**
- ID (Primary Key)
- Name, Description
- StartDate, EndDate
- Status (Pending, Active, Completed)
- TotalTickets, TicketPrice
- Relationship: 1-to-Many with Tickets

**Ticket**
- ID (Primary Key)
- TicketNumber
- DonorID (Foreign Key)
- LotteryID (Foreign Key)
- PurchaseDate
- PaidDate (nullable)
- Status (Sold, Winner, Unclaimed)
- Relationship: Many-to-One with Donor and Lottery

**Gift**
- ID (Primary Key)
- Name, Description
- CategoryID (Foreign Key)
- Value, Quantity
- Status (Available, Claimed)
- Relationship: Many-to-One with Category

**Category**
- ID (Primary Key)
- Name, Description
- Relationship: 1-to-Many with Gifts

**User (Authentication)**
- ID (Primary Key)
- Username, Email
- PasswordHash
- Role (Admin, User, Manager)
- CreatedDate

### Entity Relationships

```
Donor (1) ──── (M) Ticket ──── (M) Lottery
                              ├─ Category
                              └─ Gift
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Refresh JWT token

### Donors
- `GET /api/donors` - Get all donors (paginated)
- `GET /api/donors/{id}` - Get donor details
- `POST /api/donors` - Create new donor
- `PUT /api/donors/{id}` - Update donor
- `DELETE /api/donors/{id}` - Delete donor

### Lotteries
- `GET /api/lotteries` - Get all lotteries
- `POST /api/lotteries` - Create lottery
- `PUT /api/lotteries/{id}` - Update lottery
- `POST /api/lotteries/{id}/draw-winner` - Select winner

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/{id}/mark-paid` - Mark as paid
- `GET /api/tickets/by-donor/{donorId}` - Get donor tickets

### Gifts
- `GET /api/gifts` - Get all gifts
- `POST /api/gifts` - Create gift
- `PUT /api/gifts/{id}` - Update gift
- `DELETE /api/gifts/{id}` - Delete gift

### Reports
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/donations` - Donation statistics
- `GET /api/reports/winners` - Winner information
- `GET /api/reports/export` - Export data

### Email
- `POST /api/mail/send-notification` - Send email notification

---

## 📸 Screenshots & Demo

Screenshots and demo materials are available in the `ScreenShots/` directory:

- Login interface
- Donor management dashboard
- Lottery creation and management
- Winner selection interface
- Reports and analytics dashboard
- Email notification templates

---

## ✅ Code Quality & Best Practices

### Architecture Patterns

**Backend:**
- **3-Tier Architecture:** Controllers → BLL (Business Logic Layer) → DAL (Data Access Layer)
- **Repository Pattern:** DAL implements repository pattern for data access
- **Service Layer:** BLL services encapsulate business logic
- **Dependency Injection:** Built-in .NET Core DI container

**Frontend:**
- **Modular Component Architecture:** Feature-based folder structure
- **Service Layer Pattern:** Centralized API communication
- **Type Safety:** Full TypeScript implementation
- **Standalone Components:** Modern Angular 18 standalone API

### Error Handling

**Global Exception Handler Middleware**
- Catches all unhandled exceptions
- Translates exceptions to appropriate HTTP status codes
- Returns consistent error responses
- Logs errors for debugging

**Custom Exception Hierarchy**
```csharp
- BusinessException (400)
- NotFoundException (404)
- ConflictException (409)
```

### Logging & Monitoring

- **Request Logging Middleware** - Logs all incoming HTTP requests
- **Exception Logging** - Detailed error logging with stack traces
- **Output:** `request_logs.txt` for audit trail

### Security Measures

- JWT token-based authentication
- Password hashing and validation
- HTTPS enforcement
- CORS configuration
- Email validation
- SQL injection prevention through EF Core

### Testing Considerations

- Unit test structure included (`.spec.ts` files)
- Service layer enables easy mocking
- Business logic separation enables isolated testing

---

## 🎓 What I Learned

Through this comprehensive full-stack project, I significantly strengthened my development capabilities:

### Backend Development
- **ASP.NET Core Mastery:** Built production-ready REST APIs with proper middleware, filters, and dependency injection
- **Entity Framework Core:** Designed normalized database schemas, implemented migrations, and optimized queries
- **Architecture Patterns:** Applied 3-tier architecture and service layer pattern for scalability
- **Error Handling:** Implemented global exception handling middleware with custom exception types for better error management
- **Email Integration:** Integrated SMTP-based email notifications with custom templates

### Frontend Development
- **Angular 18:** Leveraged modern standalone components and reactive programming
- **HTTP Interceptors:** Implemented JWT token authentication with automatic token management
- **Component Architecture:** Created reusable, modular components with clear separation of concerns
- **TypeScript:** Utilized advanced type system for type-safe application development

### Full-Stack Integration
- **API Contract Design:** Designed clear DTOs and API contracts for frontend-backend communication
- **Authentication Flow:** Implemented end-to-end JWT authentication
- **Data Validation:** Applied validation at multiple layers (frontend, backend, database)

### Problem-Solving Achievements
- **Challenge:** Handling concurrent lottery draws
  - **Solution:** Implemented transaction-based winner selection with optimistic locking
- **Challenge:** Scalable email notifications
  - **Solution:** Implemented async email queue with batch processing
- **Challenge:** User experience with data loading
  - **Solution:** Implemented pagination, filtering, and caching strategies

### Professional Development
- Learned importance of comprehensive error handling for user experience
- Understood value of logging for production debugging
- Experienced benefits of structured architecture for team collaboration
- Recognized importance of documentation and code clarity

---

## 🔮 Future Enhancements

1. **Advanced Analytics**
   - Machine learning for donor segmentation
   - Predictive analytics for ticket sales
   - Anomaly detection in transaction patterns

2. **Mobile Application**
   - React Native mobile app
   - Offline ticket purchasing
   - Push notifications for winners

3. **Payment Integration**
   - Stripe/PayPal integration for online payments
   - Multiple payment methods
   - Automated invoice generation

4. **Scalability Improvements**
   - Implement caching layer (Redis)
   - Event-driven architecture with message queues
   - Microservices separation for independent scaling

5. **Enhanced Features**
   - Referral system for donors
   - Loyalty rewards program
   - Social media sharing integration
   - Multi-language support (Arabic, Hebrew, etc.)

6. **Admin Tools**
   - Advanced user management dashboard
   - Audit log viewer
   - System health monitoring
   - Backup and recovery tools

7. **Security Enhancements**
   - Two-factor authentication (2FA)
   - Role-based access control refinement
   - Encryption for sensitive data
   - API rate limiting

8. **Performance Optimization**
   - Database query optimization
   - Frontend bundle optimization
   - Implementation of web workers for heavy computations

---

## 🚢 Deployment

### Backend Deployment (.NET)

**Azure App Service:**
```bash
# Create resource group
az group create --name ChineseSalesRG --location eastus

# Create App Service plan
az appservice plan create --name ChineseSalesPlan --resource-group ChineseSalesRG --sku B1

# Deploy to Azure
dotnet publish -c Release
# Upload published files to App Service
```

**Docker Deployment:**
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 5000
ENTRYPOINT ["dotnet", "FinalProject.dll"]
```

### Frontend Deployment (Angular)

**Netlify/Vercel:**
```bash
# Build for production
ng build --configuration production

# Deploy
netlify deploy --prod --dir=dist/client
```

**Azure Blob Storage:**
```bash
ng build --configuration production
az storage blob upload-batch -d \$web -s dist/client -c websitecontainer
```

### Environment Configuration

Ensure these are properly configured before deployment:
- Database connection strings
- JWT secret keys
- Email SMTP credentials
- CORS allowed origins
- API URL endpoints

---

## 📚 Credits & Resources

- **Framework Documentation:**
  - [Angular 18 Official Docs](https://angular.io)
  - [.NET 8 Documentation](https://docs.microsoft.com/dotnet)
  - [Entity Framework Core](https://docs.microsoft.com/ef/core)

- **Libraries & Tools:**
  - Angular HttpClient for API communication
  - Entity Framework Core for ORM
  - SMTP client for email services

- **Best Practices References:**
  - Microsoft REST API Guidelines
  - Angular Style Guide
  - SOLID principles implementation

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👤 Author

**Project Developer**

- Email: [your.email@example.com]
- GitHub: [your-github-profile]
- LinkedIn: [your-linkedin-profile]

---

## 📞 Support & Contact

For questions, issues, or suggestions:

1. **Open an Issue** on the repository
2. **Check Documentation** in project Wiki
3. **Review API Documentation** in Swagger (if available)
4. **Contact Developer** via email

---

**Last Updated:** June 2026
**Status:** Production Ready

---

*Built with ❤️ as a showcase of full-stack development capabilities for job applications.*
