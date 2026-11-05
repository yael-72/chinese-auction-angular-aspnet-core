# Chinese Auction Management API — C# · ASP.NET Core · Entity Framework Core · SQL Server

A REST API for running a **Chinese auction** (a prize raffle): donors contribute gifts, buyers purchase tickets for the gifts they want, and an admin runs a random draw for each gift and emails the winner automatically.

It's built with a **layered architecture** (Controllers → Business Logic → Data Access), using dependency injection, JWT authentication with role-based authorization, and Docker support.

---

## Features

- **Authentication & authorization:** register and log in with passwords hashed using BCrypt, JWT bearer tokens, and admin-only endpoints (`[Authorize(Roles = "Admin")]`)
- **Gift & category management:** full CRUD for gifts, categories and donors
- **Ticket purchasing flow:** add tickets to a draft cart, update quantities, pay, and view purchase history per user
- **Lottery draw:** picks a random winner from all paid tickets for a gift and emails the winner over SMTP
- **Reports:** gift-winners and sales-revenue reports exported as **Excel** files (EPPlus)
- **Robust API design:** a global exception-handling middleware, custom exceptions (`NotFound`, `Conflict`, `Business`), a consistent `ApiResponse` wrapper, and AutoMapper for DTOs
- **Database:** EF Core code-first with migrations on SQL Server
- **DevOps:** a multi-stage `Dockerfile` and `docker-compose` that runs the API together with SQL Server
- **Docs:** Swagger / OpenAPI

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 7 Web API (C#) |
| Data | Entity Framework Core 7, SQL Server |
| Auth | JWT Bearer, BCrypt.Net |
| Mapping | AutoMapper |
| Reports | EPPlus (Excel) |
| Infrastructure | Docker, docker-compose |
| API docs | Swagger (Swashbuckle) |

---

## Architecture

```
server/
├── Controllers/    # HTTP endpoints (Auth, Gift, Category, Donor, Ticket, Lottery, Report, Mail)
├── BLL/            # Business logic services + interfaces
├── DAL/            # Data access layer (EF Core) + interfaces
├── Models/         # Entities: User, Gift, Category, Donor, Ticket
├── Middleware/     # Global exception handling
├── Exceptions/     # Custom domain exceptions
├── Migrations/     # EF Core migrations
└── Program.cs      # DI container, JWT, Swagger, middleware pipeline
```

Every service and data-access class is registered behind an interface, so each layer can be tested and swapped on its own.

---

## Main endpoints

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` |
| Gifts | `GET` · `GET {id}` · `POST` · `PUT` · `DELETE {id}` · `DELETE all` |
| Tickets | cart (`draft/{buyerId}`), `POST`, `PUT amount/{id}`, `PUT pay/{id}`, `GET paid`, `GET user/{buyerId}` |
| Lottery | `POST /api/lottery/{giftId}` (admin) |
| Reports | `GET gift-winners` · `GET sales-revenue` (Excel) |

The full, interactive list is available in Swagger at `/swagger` once the API is running.

---

## Getting started

### Option 1: Docker (API + SQL Server)

```bash
cd server
docker compose up --build
```

The API will be available at `http://localhost:5000`.

### Option 2: Local (.NET 7 SDK + SQL Server LocalDB)

```bash
cd server
dotnet ef database update
dotnet run
```

Then open `http://localhost:5163/swagger`.

### Configuration

Set these values in `appsettings.Development.json` or as environment variables:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`
- `EmailSettings` (SMTP host, port, username, password) for winner notifications
