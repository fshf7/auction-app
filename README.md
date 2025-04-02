# Auction App

Auction App is a full-stack web application that allows users to create, manage, and participate in online auctions. The project is built using modern technologies such as React for the frontend, Node.js with Express for the backend, and MongoDB for the database.

---

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Documentation](#api-documentation)
6. [Frontend Overview](#frontend-overview)
7. [Backend Overview](#backend-overview)
8. [Contributing](#contributing)
9. [License](#license)

---

## Features

- **User Authentication**: Users can register, log in, and log out. The system supports roles such as `buyer`, `seller`, and `admin`.
- **Auction Management**:
  - Sellers can create and manage auctions.
  - Buyers can place bids on active auctions.
  - Real-time updates for bids using WebSocket (optional feature).
- **Categories**: Predefined categories for organizing auctions.
- **Pagination**: Auctions are paginated for better user experience.
- **Role-Based Access Control**: Only sellers can create auctions, and only auction owners can delete their auctions.
- **Automatic Auction Closure**: Auctions close automatically when the end date is reached.
- **Responsive Design**: Built with Bootstrap for a responsive and mobile-friendly interface.

---

## Technologies Used

### Backend
- **Node.js** with **Express**: For building the RESTful API.
- **MongoDB** with **Mongoose**: For database management and schema validation.
- **JWT**: For secure user authentication and authorization.
- **Swagger**: For API documentation.
- **WebSocket**: For real-time updates (e.g., new bids).

### Frontend
- **React**: For building the user interface.
- **React Router**: For client-side routing.
- **Axios**: For making HTTP requests to the backend.
- **Bootstrap**: For styling and responsive design.
- **JWT Decode**: For decoding JWT tokens on the frontend.

### Tools
- **Rate Limiting**: To prevent abuse of the API.
- **CORS**: For secure cross-origin resource sharing.
- **Morgan**: For logging HTTP requests.

---

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/fshf7/auction-app.git
   cd auction-app
