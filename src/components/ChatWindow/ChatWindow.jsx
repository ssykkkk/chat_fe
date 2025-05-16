import React, { useState, useEffect, useContext, useRef } from "react";
import styles from "./ChatWindow.module.scss";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const ChatWindow = ({ chatId, refresh, triggerRefresh, messageSearch }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const { user } = useContext(AuthContext);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("tokenG");
        const res = await axios.get("http://localhost:5000/chats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chat = res.data.find((c) => c._id === chatId);
        if (chat) {
          setMessages(chat.messages);
          setChatInfo(chat);
          setTimeout(() => scrollToBottom(), 100);
        }
      } catch (err) {
        console.error("Помилка при отриманні чату:", err);
      }
    };

    if (chatId) fetchChat();
  }, [chatId, refresh]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showToast = (text) => {
    const toast = document.createElement("div");
    toast.textContent = text;
    toast.className = styles.toast;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add(styles.show), 50);

    setTimeout(() => {
      toast.classList.remove(styles.show);
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token =
      localStorage.getItem("token") || localStorage.getItem("tokenG");
    const senderName = `${user?.firstName} ${user?.lastName}`;
    const textToSend = newMessage;
    setNewMessage("");

    const optimisticMessage = {
      sender: senderName,
      text: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      await axios.post(
        "http://localhost:5000/chats/messages",
        {
          chatId,
          text: textToSend,
          sender: senderName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      triggerRefresh();
      setTimeout(async () => {
        try {
          const res = await axios.get("http://localhost:5000/chats", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const updatedChat = res.data.find((c) => c._id === chatId);

          if (updatedChat && updatedChat.messages.length > messages.length) {
            const last = updatedChat.messages[updatedChat.messages.length - 1];

            if (last.sender !== senderName) {
              setMessages(updatedChat.messages);
              showToast(`Нове повідомлення: ${last.text}`);
              scrollToBottom();
              triggerRefresh();
            }
          }
        } catch (err) {
          console.error("Помилка при отриманні авто-відповіді:", err);
        }
      }, 3500);
    } catch (err) {
      console.error("Помилка при надсиланні повідомлення:", err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const day = date.toLocaleDateString("uk-UA");
    return `${time} | ${day}`;
  };
  
 const filteredMessages = messages.filter((msg) =>
    msg.text.toLowerCase().includes(messageSearch.toLowerCase())
  );

  return (
    <div className={styles.chatWindow}>
      {chatInfo && (
        <div className={styles.chatHeader}>
          <div className={styles.chatAvatar}>
            {chatInfo.firstName?.charAt(0)}
          </div>
          <span className={styles.chatName}>
            {chatInfo.firstName} {chatInfo.lastName}
          </span>
        </div>
      )}

      <div className={styles.messages} ref={containerRef}>
        {filteredMessages.map((msg, index) => {
          const isOwn = msg.sender === `${user?.firstName} ${user?.lastName}`;
          return (
            <div
              key={index}
              className={`${styles.message} ${isOwn ? styles.own : ""}`}
            >
              <div className={styles.text}>
                <span className={styles.author}>{msg.sender}:</span>
                <span>{msg.text}</span>
              </div>
              <div className={styles.meta}>{formatDate(msg.timestamp)}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Введіть повідомлення..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className={styles.sendButton}
          aria-label="Надіслати повідомлення"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#888"
            viewBox="0 0 24 24"
          >
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
