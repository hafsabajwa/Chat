# Chat# Chat Application

## Overview
This is a simple real-time chat application built using WebSockets. It allows users to join a chat session, send messages, edit or delete their own messages, and view active participants.

## Features
- **Real-time messaging** using WebSockets
- **Supports multiple users** across different devices
- **Displays a list of active participants**
- **Allows users to edit and delete** their own messages
- **Notifies all participants** when a message is edited or deleted
- **Styled** to match the given mockups

## Technologies Used

### Frontend
- **React** with TypeScript
- **WebSockets** for real-time communication
- **Basic CSS** for styling

### Backend
- **Node.js** with WebSocket library
- **WebSocket server** running on `ws://localhost:8080`
## Installation and Setup

### Prerequisites
Ensure you have Node.js installed on your machine.
it is recommended to use react 18.3.1

### Steps to Run the Application

1. **Clone the repository**
   ```sh
   git clone https://github.com/hafsabajwa/Chat.git
   cd chat-application
   ```

2. **Install dependencies**

   For frontend:
   ```sh
   cd frontend
   npm install
   ```

   For backend:
   ```sh
   cd backend
   npm install
   ```

3. **Start the WebSocket server**
   ```sh
   cd backend
   node --loader ts-node/esm server.ts
   ```

4. **Start the React frontend**
   ```sh
   cd frontend
   npm start
   ```

5. **Open the application in a browser**
   - Go to [http://localhost:3000](http://localhost:3000) and enter a username when prompted.
