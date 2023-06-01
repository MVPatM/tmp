import React, { useState, useEffect } from 'react';
import styles from "./integratenftcss.module.css";
import apiClient from '../utils/axios';


function IntegrateNFT(){
    const [nftList, setnftList] = useState([]);
    const [selectedNum, setSelectedNum] = useState(0);
    const [selectednftList, setselectednftList] = useState([]);
    const [result, setResult] = useState(null);

    useEffect(() => {
        //get my info
        apiClient
          .get("/integrateNFT")
          .then((res) => {
            setnftList(res.data.nfts);
            setselectednftList(Array(nftList.length).fill(false));
          })
          .catch((err) => {
            alert(`${err}`);
          });
      }, []);

    const sendNFT = async () => {
        let sendList = [];
        for(let i = 0; i < nftList.length; i ++){
            if(selectednftList[i] === true){
                sendList.push(nftList[i].tokenURI);
            }
        }

        let sendList1 = [];
        for(let i = 0; i < nftList.length; i ++){
            if(selectednftList[i] === true){
                sendList1.push(nftList[i].tokenId);
            }
        }

        const payload = {
            tokenURI : sendList,
            tokenId : sendList1
        }

        await apiClient.post("/integrateNFT/mint", payload)
            .then((res) => {
                if (res.data.isSuccess === true){
                    setResult(res.data.nft);
                    alert('Integrated NFT mint success');
                }
                else if (res.data.isSuccess === false) {
                    alert(`${res.data.msg}`);
                }
            })
            .catch ((err) => {
                alert(`Integrated NFT Mint error ${err}`);
            })
    }


    const changeSelectednftList = (index) => {
        let copyList = [...selectednftList];
        copyList[index] = !copyList[index];
        if(copyList[index]) setSelectedNum(selectedNum + 1);
        else setSelectedNum(selectedNum - 1);
        console.log(copyList[index]);
        setselectednftList(copyList);
    }

    const RenderNFTList = () => {
        return nftList.map((nft, idx) => (
                <button key = {idx} className = {`${styles.nftcomponent} ${selectednftList[idx] ? styles.selected : ""}`} onClick = {() => changeSelectednftList(idx)}>
                    {nft.tokenId} 의 NFT
                </button>
            ))
    }

    return (
        <div className={styles.integratenft}>
            <div className={styles.nftinfo}>
                <div className={styles.result}>
                    RESULT MetaData
                    {result !== null && <div>
                        <div>tokenId : {result.tokenId}</div>
                        <div>Column : {result.metaData.columns.join(", ")}</div>
                        <div>Data size : {result.metaData.dataSize}</div>
                        <div>Null Ratio : {result.metaData.nullRatio}</div>
                        </div>}
                </div>
                <button className={styles.makebutton}>
                    Make Integrated NFT
                </button>
            </div>
            <div className={styles.nftlist}>
                <div className = {styles.title}>NFT LIST</div>
                {RenderNFTList()}
                <button className = {styles.integratebutton} onClick = {sendNFT}>
                    Integrate {selectedNum} NFT
                </button>
            </div>
        </div>
    );
}

export default IntegrateNFT;