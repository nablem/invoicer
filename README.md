# Invoicing & Billing Platform

A modern, self-hostable invoicing application built with Next.js, Prisma, and TypeScript. This platform helps freelancers and small businesses manage clients, send quotes, and issue invoices with ease.

## Key Features

-   **Client Management**: Maintain a database of your clients with all necessary contact and billing information.
-   **Quotes & Invoices**: Create and manage professional quotes and invoices.
-   **Custom Invoice Numbering**: Set up advanced invoice sequencing, including monthly and yearly resets.
-   **PDF Generation**: Automatically generate PDF documents for quotes and invoices using Gotenberg.
-   **Recurring Invoices**: Set up invoices to be generated automatically on a recurring schedule.
-   **Retainer & Balance Invoicing**: Easily manage retainer-based projects with initial retainer invoices and final balance invoices.
-   **Quote-to-Invoice Conversion**: Convert an accepted quote into an invoice with a single click.
-   **Email Integration**: Send invoices and quotes directly to clients from the application, with an integrated email testing tool (MailDev).
-   **Multi-Language Support**: The UI supports multiple languages (currently English and French).
-   **DocuSeal Integration (Optional)**: Seamlessly integrate with DocuSeal for e-signing of quotes and invoices.

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Development Setup

1.  **Start Background Services**:
    This application requires Gotenberg for PDF generation and MailDev for email testing. Start them using Docker Compose:
    ```bash
    docker-compose up -d
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env` file in the root of the project. This file will store your database connection string.
    ```
    DATABASE_URL="file:./prisma/dev.db"
    ```

4.  **Run Database Migrations**:
    Apply the database schema using Prisma Migrate.
    ```bash
    npx prisma migrate dev
    ```

5.  **Run the Development Server**:
    Start the Next.js application.
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Setup

1.  **Start Background Services**:
    Just like in development, the background services are required.
    ```bash
    docker-compose up -d
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env` file for your production configuration. You should use a production-ready database (e.g., PostgreSQL, MySQL) instead of the SQLite file.

4.  **Run Database Migrations**:
    ```bash
    npx prisma migrate deploy
    ```

5.  **Build and Start the Application**:
    Build the application for production and start the server.
    ```bash
    npm run build
    npm run start
    ```