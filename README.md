# SPARA Web Client
The client interface for the chatbot is implemented using ReactJS and is integral part of the main SPARA bundle.

# Installation

## Requirements

[NodeJS](https://nodejs.org/en/download/package-manager)

## Installing packages

`npm install`

## Running the client

`npm run dev`

# Documentation
- **App**: The root component, rendering the overall application, possibly including `Navigation` and `Chat`.
- **SocketContext**: A context for managing the WebSocket connection, providing methods to connect, disconnect, send, and listen for messages.
- **Navigation**: Manages navigation between different pages or views within the app.
- **Chat**: The main chat interface, managing state for messages and connecting `SendPanel` and `Dialogue`, interacting with `SocketContext` for getting messages
- **SendPanel**: The input component where users type and submit messages, interacting with `SocketContext` for sending messages.
- **Dialogue**: Manages displaying the list of messages, with each message being a `Message` component.
- **Message**: Represents a single chat message.
```mermaid
classDiagram
    class App {
        +render(): JSX.Element
    }
    
    class SocketContext {
        +connect(): void
        +disconnect(): void
        +sendMessage(message: String): void
        +onMessage(callback: Function): void
        +useSocket(): Context
    }

    class Chat {
        +useState(): Array
        +useEffect(): void
    }

    class Navigation {
        +navigate(path: String): void
    }

    class SendPanel {
        +onSubmit(message: String): void
        +handleChange(event: Event): void
    }

    class Dialogue {
        +renderMessages(messages: Array): JSX.Element
    }

    class Message {
        +render(): JSX.Element
    }

    App "1" *-- "1" SocketContext
    App "1" *-- "1" Navigation
    Navigation "1" *-- "1" SocketContext
    App "1" *-- "1" Chat
    Chat "1" *-- "1" SendPanel
    Chat "1" *-- "1" Dialogue
    Chat "1" *-- "1" SocketContext
    Dialogue "1" *-- "*" Message
    SendPanel "1" *-- "1" SocketContext
```