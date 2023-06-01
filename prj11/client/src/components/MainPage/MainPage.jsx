import React, { useState } from 'react';
import styles from "./maincss.module.css";
import MyNFT from "../MyNFT/MyNFT";
import IntegrateNFT from "../IntegrateNFT/IntegrateNFT"
import SearchNFT from "../SearchNFT/SearchNFT";
//import SellNFT from "../SellNFT/SellNFT";
import MintNFT from "../MintNFT/MintNFT"


function MainPage(){

    const [menuNum, setMenuNum] = useState(0);

    return (
        <div>
            <div className={styles.MainPage}>
                <header className = {styles.header}>
                    Crowd Sourcing using NFT in hyperledger Fabric
                </header>
                <div className = {styles.body}>
                    <nav className = {styles.nav}>
                        <button className={`${styles.menuBar} ${menuNum === 0 ? styles.selected : ""}`} onClick = {() => {setMenuNum(0)}}>Mint NFT</button>
                        <button className={`${styles.menuBar} ${menuNum === 1 ? styles.selected : ""}`} onClick = {() => {setMenuNum(1)}}>my NFT</button>
                        <button className={`${styles.menuBar} ${menuNum === 2 ? styles.selected : ""}`} onClick = {() => {setMenuNum(2)}}>Integrate NFT</button>
                        <button className={`${styles.menuBar} ${menuNum === 3 ? styles.selected : ""}`} onClick = {() => {setMenuNum(3)}}>Search NFT</button>
                    </nav>
                    <main className = {styles.main}>
                        {menuNum === 0 && <MintNFT />}
                        {menuNum === 1 && <MyNFT />}
                        {menuNum === 2 && <IntegrateNFT />}
                        {menuNum === 3 && <SearchNFT />}
                    </main>
                </div>
                <footer className = {styles.footer}>
                    최원재 윤민균 한상연
                </footer>
            </div>
        </div>
    );
}

export default MainPage;