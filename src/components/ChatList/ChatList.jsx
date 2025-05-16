import React, { useEffect, useState, useContext } from "react";
import styles from "./ChatList.module.scss";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const ChatList = ({ selectedId, onSelect, onRefresh }) => {
  const [chats, setChats] = useState([]);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("tokenG");
        const res = await axios.get("http://localhost:5000/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Отримані чати:", res.data);
        setChats(res.data);
      } catch (err) {
        console.error("Помилка при отриманні чатів:", err);
      }
    };
    fetchChats();
  }, [onRefresh]);

  return (
    <div className={styles.chatList}>
      <h3>Ваші чати</h3>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat._id}
            className={`${styles.chatItem} ${
              selectedId === chat._id ? styles.active : ""
            }`}
            onClick={() => onSelect(chat._id)}
          >
            <div className={styles.avatar}>{chat.firstName.charAt(0)}</div>
            <div className={styles.info}>
              <p className={styles.name}>
                {chat.firstName} {chat.lastName}
              </p>
              <p className={styles.lastMessage}>
                {chat.messages?.length > 0
                  ? (
                      chat.messages[chat.messages.length - 1].text.length > 20
                        ? chat.messages[chat.messages.length - 1].text.slice(0, 20) + "..."
                        : chat.messages[chat.messages.length - 1].text
                    )
                  : "Немає повідомлень"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
