# PC E-Shop Project

## Overview
A full-stack e-commerce application for purchasing PC components, built with modern web technologies and containerized deployment.

## Tech Stack

### Backend
- **Framework**: Django with Django REST Framework
- **Language**: Python
- **Database**: PostgreSQL (via migrations)
- **Authentication**: Token-based
- **Deployment**: Docker

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: CSS/Tailwind
- **State Management**: Zustand (authStore, cartStore)
- **Deployment**: Docker

## Project Structure

```
pc-eshop-prj/
├── backend/          # Django REST API
├── frontend/         # Next.js application
├── final_data.json   # Pre-loaded database (users & products)
└── README.md         # This file
```

## Getting Started with Docker

### Prerequisites
- Docker & Docker Compose installed

### Running the Project



1. **Clone the repository**
    ```bash
    cd Small-PCEshopProject
    ```

2. **Build and start containers**
    ```bash
    docker-compose up --build
    ```
    - Don't forget to change .env.example to .env with filled out passwords

3. **Load the database**
    ```bash
    docker-compose exec backend python manage.py loaddata final_data.json
    ```

4. **Access the application**
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:8000`
    - Admin: `http://localhost:8000/admin/`

## Features
- Product browsing and filtering
- Shopping cart management
- User authentication & profiles
- Order management
- Payment method integration
- Saved cards functionality
- Category-based product organization

## Database
The `final_data.json` file contains pre-loaded:
- User accounts
- Product catalog
- Categories
- Sample orders

Load it using the Docker command above for immediate testing.
## Cloning the Repository

Before you begin, you'll need to clone the repository to your local machine. Follow these steps:

### Prerequisites
- Git installed on your system
- A terminal or command prompt

### Steps

1. **Open your terminal or command prompt**

2. **Navigate to the directory where you want to clone the repository:**
    ```bash
    cd /path/to/your/desired/directory
    ```

3. **Clone the repository:**
    ```bash
    git clone https://github.com/username/repository-name.git
    ```
    Replace `username` and `repository-name` with the actual GitHub username and repository name.

4. **Navigate into the cloned repository:**
    ```bash
    cd repository-name
    ```

5. **Verify the clone was successful:**
    ```bash
    git status
    ```
    You should see information about the repository's current branch and status.

### Next Steps
Once cloned, you can proceed with [Installing Dependencies] or [Running the Application].