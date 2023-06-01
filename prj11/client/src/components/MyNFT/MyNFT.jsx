import React, { useState , useEffect} from 'react';
import styles from "./mynftcss.module.css";
import apiClient from '../utils/axios';


function MyNFT(){
    const [nftList, setnftList] = useState([]);
    const [nftIndex, setnftIndex] = useState(0);
    useEffect(async () => {
        //get my info
        await apiClient
          .get("/myNFT")
          .then((res) => {
            setnftList(res.data.nfts);
          })
          .catch((err) => {
            alert(`${err}`);
          });
      }, []);


    const RenderNFTList = () => {
        return nftList.map((nft, idx) => (
                <div key = {idx} className = {styles.nftcomponent} onClick = {() => setnftIndex(idx)}>
                    {nft.tokenId}의 NFT
                </div>
            ))
    }
    return (
        <div className={styles.mynft}>
            <div className={styles.nftinfo}>
                {nftList.length > 0 && 
                <div>
                <div className = {styles.ownertitle}>{nftList[nftIndex].owner}의 NFT</div>
                <div>-tokenId : {nftList[nftIndex].tokenId}</div>
                <div>-Column : {nftList[nftIndex].metaData.columns.join(", ")}</div>
                <div>-Data size : {nftList[nftIndex].metaData.dataSize}</div>
                <div>-Null Ratio : {nftList[nftIndex].metaData.nullRatio}</div>
                </div>
                }   
            </div>
            <div className={styles.nftlist}>
                <div className = {styles.title}>NFT LIST</div>
                {RenderNFTList()}
            </div>
        </div>
    );
}

export default MyNFT;