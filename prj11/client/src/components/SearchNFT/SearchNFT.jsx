import React, { useState, useEffect } from 'react';
import styles from "./searchnftcss.module.css";
import apiClient from '../utils/axios';


function SearchNFT(){
    const [nftList, setnftList] = useState([]);
    const [nftIndex, setnftIndex] = useState(0);
    useEffect(() => {
        //get my info
        apiClient
          .get("/SearchNFT")
          .then((res) => {
            setnftList(res.data.nfts);
          })
          .catch((err) => {
            alert(`${err}`)
          });
      }, []);

    const searching = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const payload = {
            tokenId : data.get("tokenId"),
            tokenURI : data.get("tokenURI")
        }
        apiClient
            .post("/SearchNFT/search")
            .then((res) => {
                setnftList(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
        
    }

    const RenderNFTList = () => {
        return nftList.map((nft, idx) => (
                <div key = {idx} className = {styles.nftcomponent} onClick = {() => setnftIndex(idx)}>
                    {nft.tokenId}의 NFT
                </div>
            ))
    }
    return (
        <div className = {styles.searchnft}>
            <div className={styles.nftinfo}>
                {nftList.length > 0 && <div className={styles.nftmetadata}>
                <div className = {styles.ownertitle}>{nftList[nftIndex].tokenId}의 NFT</div>
                <div>-tokenId : {nftList[nftIndex].tokenId}</div>
                <div>-Column : {nftList[nftIndex].metaData.columns.join(", ")}</div>
                <div>-Data size : {nftList[nftIndex].metaData.dataSize}</div>
                <div>-Null Ratio : {nftList[nftIndex].metaData.nullRatio}</div>
                </div>}
                {nftList.length > 0 && <button className={styles.buybutton}>Buy NFT</button>}
            </div>
            <div className={styles.search}>
                <div>
                    <form onSubmit={searching} className={styles.inputcontainer}>
                    <input className = {styles.input} id = "tokenId">

                    </input>
                    <button className = {styles.searchbutton} type = "submit">
                        Search
                    </button>
                    </form>
                </div>
                <div className={styles.searchlist}>
                    {RenderNFTList()}
                </div>
            </div>
        </div>
    );
}

export default SearchNFT;