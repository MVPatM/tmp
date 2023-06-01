import React, { useState } from 'react';
import styles from "./sellnftcss.module.css";


function SellNFT(){
    const [nftList, setnftList] = useState([]);
    const [nftIndex, setnftIndex] = useState(0);
    const RenderNFTList = () => {
        return nftList.map((nft, idx) => (
                <div key = {idx} className = {styles.nftcomponent} onClick = {() => setnftIndex(idx)}>
                    {nft}
                </div>
            ))
    }
    return (
        <div className={styles.mynft}>
            <div className={styles.nftinfo}>
                <div className={styles.nftmetadata}>
                    {nftList[nftIndex]}의 메타데어터
                </div>
                <button className={styles.sellbutton}>SELL NFT</button>
            </div>
            <div className={styles.nftlist}>
                <div className = {styles.title}>INTEGRATED NFT LIST</div>
                {RenderNFTList()}
            </div>
        </div>
    );
}

export default SellNFT;