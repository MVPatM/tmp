import React, { useState } from 'react';
import styles from "./logincss.module.css";
import apiClient from "../utils/axios";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = (event) =>{
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      userId : data.get("userId"),
      password : data.get("password"),
      phoneNumber : data.get("phoneNumber")
    };

    apiClient.post("/login/signup", payload).then((res) => {
      alert(`${res.data.msg}`);
      alert("SignUp Completed");
    })
    .catch((err) => {
      alert(`signup Failed ${err}`);
    });
  };

  const handleLogIn = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      userId : data.get("userId"),
      password : data.get("password")
    }

    apiClient
      .post("login/login", payload)
      .then((res) => {
        if(res.data.loginSuccess === true){
          alert("Login success");
          document.location.href = "/";
        }
        else {
          alert(`${res.data.msg}`);
        }
      })
      .catch((err) => {
        alert("Login Failed");
      });
  };


    return (
      <div>
        <div className = {styles.body}>
          <div className={`${styles.container} ${isSignUp ? styles.right_panel_active : ""}`} id="container">
            <div className={`${styles.form_container} ${styles.sign_up_container}`}>
              <form className = {styles.form} onSubmit = {handleSignIn}>
                <h1 className = {styles.h1}>Create Account</h1>
                <input className = {styles.input} type="text" placeholder="ID" id = "userId" name = "userId"/>
                <input className = {styles.input} type="Phone Number" placeholder="Phone Number" id = "phoneNumber" name = "phoneNumber"/>
                <button className = {styles.button}>Check</button>
                <input className = {styles.input} type="password" placeholder="Password" id = "password" name = "password"/>
                <button className = {styles.button} type = "submit">Sign Up</button>
              </form>
            </div>
            <div className={`${styles.form_container} ${styles.sign_in_container}`}>
              <form className = {styles.form} onSubmit = {handleLogIn}>
                <h1>Sign in</h1>
                <input className = {styles.input} type="ID" placeholder="ID" id = "userId" name = "userId"/>
                <input className = {styles.input} type="password" placeholder="Password" id = "password" name = "password"/>
                <button className = {styles.button} type = "submit">Sign In</button>
              </form>
            </div>
            <div className={styles.overlay_container}>
              <div className={styles.overlay}>
                <div className={`${styles.overlay_panel} ${styles.overlay_left}`}>
                  <h1 className = {styles.h1}>Yonsei Blockchain</h1>
                  <p className = {styles.p}>Crowd Sourcing<br />using NFT in Hyperledger</p>
                  <button className={`${styles.ghost} ${styles.button}`} id="signIn" onClick = {() => setIsSignUp(false)}>Sign In</button>
                </div>
                <div className={`${styles.overlay_panel} ${styles.overlay_right}`}>
                  <h1 className = {styles.h1}>Yonsei Blockchain</h1>
                  <p className = {styles.p}>Crowd Sourcing<br />using NFT in Hyperledger</p>
                  <button className={`${styles.ghost} ${styles.button}`} id="signUp" onClick = {() => setIsSignUp(true)}>Sign Up</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default LoginPage;