import React, { useState } from 'react';
import styles from "./mintnftcss.module.css";
import apiClient from '../utils/axios1';


function MintNFT(){
    const [minting, setMinting] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [mintedNFT, setMintedNFT] = useState(null);
    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleDrop = async (event) => {
        event.preventDefault();
        setUploaded(true);
        const file = event.dataTransfer.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        await apiClient
            .post("mintNFT/upload", formData)
            .then((res) => {
                if (res.data.ismintsuccess === true){
                    setMinting(true);
                    setMintedNFT(res.data.nft);
                    alert('mint success');
                }
                else if (res.data.ismintsuccess === false) {
                    alert(`${res.data.msg}`);
                }
            })
            .catch((err) => {
                alert(`Mint error ${err}`);
            })
    }

    return (
        <div className={styles.mintnft}>
            <div className={styles.fileupload} onDragOver = {handleDragOver} onDrop = {handleDrop}>
            {minting === false && <div className={styles.dragmessage}>{uploaded ? "Minting ..." : "Drag your csv file"}</div>}
            {minting === true && mintedNFT && ( <div className={styles.dragmessage}>
                <div className = {styles.result}>Result MetaData</div>
                <div>tokenId : {mintedNFT.tokenId}</div>
                <div>owner : {mintedNFT.owner}</div>
                <div>Column : {mintedNFT.metaData.columns.join(", ")}</div>
                <div>Data size : {mintedNFT.metaData.dataSize}</div>
                <div>Null Ratio : {mintedNFT.metaData.nullRatio}</div>
                </div>)}
            </div>
        </div>
    );
}

export default MintNFT;