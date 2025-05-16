import React, { useContext, useState, useEffect, useRef } from "react";
import styles from "./ProfileMenu.module.scss";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setEditMode(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("tokenG");
      await axios.put(
        "https://chat-be-4lov.onrender.com/user/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setEditMode(false);
    } catch (err) {
      console.error("Помилка при збереженні профілю:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={styles.profileWrapper} ref={menuRef}>
      <div className={styles.avatar} onClick={toggleMenu}>
        {user?.photo ? (
          <img
            src={user.photo}
            alt="User"
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          user?.firstName?.charAt(0)
        )}
      </div>

      {showMenu && (
        <div className={styles.menu}>
          {editMode ? (
            <div className={styles.editForm}>
              <input
                name="firstName"
                placeholder="Імʼя"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                name="lastName"
                placeholder="Прізвище"
                value={formData.lastName}
                onChange={handleChange}
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              <button onClick={handleSave}>Зберегти</button>
            </div>
          ) : (
            <div>
              <p>{user?.firstName} {user?.lastName}</p>
              <p className={styles.email}>{user?.email}</p>
              <div className={styles.actions}>
              <button onClick={() => setEditMode(true)}>Редагувати</button>
              <button onClick={handleLogout}>Вийти</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
