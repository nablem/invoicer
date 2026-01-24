# Invoicing Platform

A modern, self-hostable invoicing application built with Next.js, Prisma, and TypeScript. This platform allows you to manage clients, create quotes and invoices, and download them as PDF documents using customizable templates.

## Key Features

-   **Client Management**: Maintain a database of your clients with all necessary contact and billing information.
-   **Quotes & Invoices**: Create and manage professional quotes and invoices.
-   **Custom Invoice Numbering**: Set up advanced invoice sequencing, including monthly and yearly resets.
-   **PDF Generation**: Automatically generate PDF documents for quotes and invoices using Gotenberg based on customizable HTML templates.
-   **Recurring Invoices**: Set up invoices to be generated automatically on a recurring schedule.
-   **Retainer & Balance Invoicing**: Easily manage retainer-based projects with initial retainer invoices and final balance invoices.
-   **Quote-to-Invoice Conversion**: Convert an accepted quote into an invoice with a single click.
-   **Multi-Language Support**: The UI supports multiple languages (currently English and French).

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Development Setup

1.  **Start Background Services**:
    This application requires Gotenberg for PDF generation. Start it using Docker Compose:
    ```bash
    docker-compose up -d
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env` file in the root of the project. This file will store your database connection string and other configurations.
    ```env
    DATABASE_URL="file:./prisma/dev.db"
    ```

4.  **Sync Database Schema**:
    Push the database schema directly to the database. This project uses a schema-first workflow.
    ```bash
    npx prisma db push
    ```

5.  **Run the Development Server**:
    Start the Next.js application.
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Setup (Local Testing)

To test the application in a production-like environment locally:

1.  **Start Background Services**:
    Ensure Gotenberg is running:
    ```bash
    docker-compose up -d
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Ensure your `.env` file is configured (e.g., `DATABASE_URL`).

4.  **Sync Database Schema**:
    ```bash
    npx prisma db push
    ```

5.  **Build and Start the Application**:
    Build the application for production and start the server. This simulates the production environment by optimizing the build.
    ```bash
    npm run build
    npm run start
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## Production Deployment (Server)

The project includes a production-ready Docker Compose configuration (`docker-compose.prod.yml`) designed to integrate with an **existing Traefik reverse proxy**.

### Deployment Steps

1.  **Identify Existing Infrastructure**:
    You must know the name of the Docker network your existing Traefik instance uses, and the name of its certificate resolver.
    *   Find the network name: `docker network ls` (look for something like `proxy`, `web`, or `traefik_public`).
    *   Find the resolver name: Check your existing Traefik configuration (commonly `le`, `letsencrypt`, or `myresolver`).

2.  **DNS Configuration**:
    Point your domain (e.g., `invoicer.lemenuel.com`) to your server's public IP address.

3.  **Configuration**:
    Create a `.env` file in the same directory as `docker-compose.prod.yml` or export these variables:
    
    ```bash
    TRAEFIK_NETWORK=proxy          # The name of your existing Traefik network
    TRAEFIK_CERT_RESOLVER=myresolver # The name of your existing cert resolver
    ```

4.  **Start the Stack**:
    Run the following command to build and start the services:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```

5.  **Verify**:
    Your application should now be accessible at `https://invoicer.lemenuel.com` with a valid SSL certificate.