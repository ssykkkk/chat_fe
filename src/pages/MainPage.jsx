import React, { useState, useEffect } from "react";
import ChatList from "../components/ChatList/ChatList";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import ProfileMenu from "../components/ProfileMenu/ProfileMenu";
import styles from "../styles/MainPage.module.scss";
import { useLocation } from "react-router-dom";
import axios from "axios";

const MainPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingChat, setEditingChat] = useState(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("tokenG", token);
      window.location.replace("/home");
    }
  }, [location.search]);

  useEffect(() => {
    const savedChatId = localStorage.getItem("selectedChatId");
    if (savedChatId) setSelectedChatId(savedChatId);
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem("selectedChatId", selectedChatId);
    }
  }, [selectedChatId]);

  const triggerRefresh = () => setRefresh((prev) => !prev);
  const token = localStorage.getItem("token") || localStorage.getItem("tokenG");

  const openDialog = (chat = null) => {
    setEditingChat(chat);
    setFormData({
      firstName: chat?.firstName || "",
      lastName: chat?.lastName || "",
    });
    setShowDialog(true);
  };

  const handleSaveChat = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;

    try {
      if (editingChat) {
        await axios.put(`https://chat-be-4lov.onrender.com/chats/${editingChat._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("https://chat-be-4lov.onrender.com/chats", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowDialog(false);
      setFormData({ firstName: "", lastName: "" });
      setEditingChat(null);
      triggerRefresh();
    } catch (err) {
      console.error("Помилка при створенні/редагуванні чату:", err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`https://chat-be-4lov.onrender.com/chats/${selectedChatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedChatId(null);
      triggerRefresh();
    } catch (err) {
      console.error("Помилка при видаленні чату:", err);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className={styles.homePage}>
      <aside className={styles.sidebar}>
        <ProfileMenu />
        <div className={styles.chatActions}>
          <button onClick={() => openDialog(null)}>+ Новий чат</button>
          {selectedChatId && (
            <>
              <button onClick={() => openDialog({ _id: selectedChatId })}>
                ✏️ Редагувати чат
              </button>
              <button onClick={() => setShowConfirm(true)}>🗑️ Видалити чат</button>
            </>
          )}
          <input
            type="text"
            placeholder="Пошук повідомлень у чаті..."
            value={messageSearch}
            onChange={(e) => setMessageSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <ChatList
          selectedId={selectedChatId}
          onSelect={setSelectedChatId}
          onRefresh={refresh}
        />
      </aside>

      <main className={styles.chatSection}>
        {selectedChatId ? (
          <ChatWindow
            chatId={selectedChatId}
            refresh={refresh}
            triggerRefresh={triggerRefresh}
            messageSearch={messageSearch}
          />
        ) : (
          <div className={styles.emptyMessage}>Виберіть чат або створіть новий</div>
        )}
      </main>

      {showDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.dialog}>
            <h3>{editingChat ? "Редагування чату" : "Новий чат"}</h3>
            <input
              type="text"
              placeholder="Ім'я"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Прізвище"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <div className={styles.dialogButtons}>
              <button onClick={handleSaveChat}>
                {editingChat ? "Зберегти" : "Створити"}
              </button>
              <button onClick={() => setShowDialog(false)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.dialog}>
            <h3>Підтвердження видалення</h3>
            <p>Ви дійсно хочете видалити цей чат?</p>
            <div className={styles.dialogButtons}>
              <button onClick={handleConfirmDelete}>Так, видалити</button>
              <button onClick={() => setShowConfirm(false)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
