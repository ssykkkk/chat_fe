import React, { useState, useContext } from "react";
import styles from "./AuthForm.module.scss";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthForm = ({ isLogin, toggleMode }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { login, register, authGoogle, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
    }
    navigate("/home");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{isLogin ? "Увійти" : "Зареєструватися"}</h2>

      {!isLogin && (
        <>
          <input
            type="text"
            name="firstName"
            placeholder="Ім'я"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Прізвище"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit">
        {isLogin ? "Увійти" : "Зареєструватися"}
      </button>
      <button type="button" onClick={authGoogle} className={styles.googleBtn}>
        Увійти через Google
      </button>
      <p className={styles.switch} onClick={toggleMode}>
        {isLogin ? "Немає акаунту? Зареєструватися" : "Вже є акаунт? Увійти"}
      </p>
    </form>
  );
};

export default AuthForm;
