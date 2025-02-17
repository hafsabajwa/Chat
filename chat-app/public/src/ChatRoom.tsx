import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import "./style.css";

interface ChatRoomProps {
  username: string;
}

interface ChatMessage {
  id: string;
  type: "notification" | "chat";
  username?: string;
  content: string;
  edited?: boolean;
  deleted?: boolean;
}

const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

const ChatRoom: React.FC<ChatRoomProps> = ({ username }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(JSON.stringify({ type: "join", username }));
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "notification") {
          setMessages((prev) => [
            ...prev,
            {
              id: generateUniqueId(),
              type: "notification",
              content: data.message,
            },
          ]);
        } else if (data.type === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              id: data.messageId,
              type: "chat",
              username: data.username,
              content: data.message,
            },
          ]);
        } else if (data.type === "edit") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, content: data.message, edited: true }
                : msg
            )
          );
        } else if (data.type === "delete") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, content: "this message is deleted", deleted: true }
                : msg
            )
          );
        }
      } catch (err) {
        console.error("Error parsing message", err);
      }
    };

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener("open", () => {
          socket.send(JSON.stringify({ type: "leave", username }));
          socket.close();
        });
      } else if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave", username }));
        socket.close();
      } else {
        socket.close();
      }
    };
  }, [username]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN && input.trim() !== "") {
      const messageId = generateUniqueId();
      ws.send(
        JSON.stringify({ type: "chat", messageId, username, message: input })
      );
      setInput("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleEdit = (id: string, oldContent: string) => {
    const newContent = prompt("Edit your message:", oldContent);
    if (
      newContent &&
      newContent.trim() !== "" &&
      newContent !== oldContent &&
      ws
    ) {
      ws.send(
        JSON.stringify({
          type: "edit",
          messageId: id,
          username,
          message: newContent,
        })
      );
    }
  };

  const handleDelete = (id: string) => {
    if (ws && window.confirm("Are you sure you want to delete this message?")) {
      ws.send(JSON.stringify({ type: "delete", messageId: id, username }));
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-room-header">Status Meeting Standup</div>
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            {msg.type === "notification" ? (
              <em>{msg.content}</em>
            ) : (
              <>
                <strong>{msg.username}: </strong>
                <span>{msg.content}</span>
                {msg.username === username && !msg.deleted && (
                  <>
                    <button
                      onClick={() => handleEdit(msg.id, msg.content)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </>
                )}
                {msg.edited && !msg.deleted && (
                  <div className="edited-info">This message was edited</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message..."
        onKeyPress={handleKeyPress}
        className="chat-input"
      />
      <button onClick={sendMessage} className="send-button">
        Send
      </button>
    </div>
  );
};

export default ChatRoom;
