import React, { useState } from "react";
import styles from "../styles/AuthPage.module.scss";
import AuthForm from "../components/AuthForm/AuthForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.authContainer}>
      <AuthForm isLogin={isLogin} toggleMode={() => setIsLogin(!isLogin)} />
    </div>
  );
};

export default AuthPage;
