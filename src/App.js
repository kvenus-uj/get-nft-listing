import './App.css';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz";
import { Col, Row, Button, Form, Card} from "react-bootstrap";
import AlertDismissible from './components/alert/alertDismissible';
import PreLoader from './components/preloader';
import Collections from './components/collections';
import GalleryView from './components/galleryview';

function App({connection,variant, cluster}) {
  const { publicKey } = useWallet();

  // input ref
  const inputRef = useRef();

  // state change
  useEffect(() => {
    setNfts([]);
    setView("collection");
    setGroupedNfts([]);
    setShow(false);
     if (publicKey) {
       inputRef.current.value = publicKey;
     }
  }, [publicKey, connection]);

  const [nfts, setNfts] = useState([]);
  const [groupedNfts, setGroupedNfts] = useState([]);
  const [view, setView] = useState('nft-grid');
  //alert props
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  //loading props
  const [loading, setLoading] = useState(false);

  const [tokenMint, setTokenMint] = useState('');
  const [owner, setOwner] = useState('');
  const [isList, setIsList] = useState(false);
  const [nftImg, setImg] = useState('');
  const [name, setName] = useState('');

  const isListedMagicEden = async () => {
    let addr = inputRef.current.value;
    let req = "https://api-mainnet.magiceden.dev/v2/tokens/";
    req += addr + "/listings";
    try {
      let res = await fetch(req, {
        // mode: 'no-cors',
        // header: {
        //   'Access-Control-Allow-Headers': '*',
        //   ...Headers,
        // },
      });console.log(res);
      let res_json = await res.json();
      if(res_json.length > 0) {
        setTokenMint(res_json[0].tokenMint);
        setOwner(res_json[0].seller);
        setIsList(true);
        getNftfromMint(addr);
      }else {
        setIsList(false);
      }
    } catch (err) {
      setIsList(false);
    }
  }

  const getNftfromMint = async (addr) => {
    let req = "https://api-mainnet.magiceden.dev/v2/tokens/" + addr;
    try{
      let res = await fetch(req);
      let res_json = await res.json();
      console.log(res_json);
      if(res_json.image) {
        setImg(res_json.image);
        setName(res_json.name);
      }else{
        setImg('');
      }
    } catch (err) {
      setImg('');
    }
  }
  const isListedOpenSea = async (addr) => {
    let req = "https://opensea.io/assets/solana/";
    req += addr;
    try {
      let res = await fetch(req);
      let res_json = await res.json();
      console.log(res_json);
      if(res_json.results.mintAddress === addr) {
        return "Listed";
      }else {
        return 'None';
      }
    } catch (err) {
      return 'None';
    }
  }


  const getNfts = async (e) => {
    e.preventDefault();

    setShow(false);

    let address = inputRef.current.value;

    if (address.length === 0) {
      address = publicKey;
    }

    if (!isValidSolanaAddress(address)) {
      setTitle("Invalid address");
      setMessage("Please enter a valid Solana address or Connect your wallet");
      setLoading(false);
      setShow(true);
      return;
    }

    const connect = createConnectionConfig(connection);

    setLoading(true);
    const nftArray = await getParsedNftAccountsByOwner({
      publicAddress: address,
      connection: connect,
      serialization: true,
    });


    if (nftArray.length === 0) {
      setTitle("No NFTs found in " + title);
      setMessage("No NFTs found for address: " + address);
      setLoading(false);
      setView('collection');
      setShow(true);
      return;
    }

    const metadatas = await fetchMetadata(nftArray);
    var group = {};
    var _nfts = [];
    for (const nft of metadatas) {
      console.log(nft);
      var _tmp = [];
      _tmp = nft;
      _tmp.isMagicEden = await isListedMagicEden(nft.mint);
      // _tmp.isOpenSea = await isListedOpenSea(tmp.mint);
      _nfts.push(_tmp);
      if (group.hasOwnProperty(nft.data.symbol)) {
        group[nft.data.symbol].push(nft);
      } else {
        group[nft.data.symbol] = [nft];
      }
    }
    setGroupedNfts(group);
    setLoading(false);
    return setNfts(_nfts);
  };

  const fetchMetadata = async (nftArray) => {
    let metadatas = [];
    for (const nft of nftArray) {
      console.log(nft);
      try {
        await fetch(nft.data.uri)
        .then((response) => response.json())
        .then((meta) => { 
          metadatas.push({...meta, ...nft});
        });
      } catch (error) {
        console.log(error);
      }
    }
    return metadatas;
  };

  return (
    <div>
      <div className="main">
        <Row className="inputForm">
          <Col lg="2"></Col>
          <Col xs="12" md="12" lg="5">
            <Form.Control
              type="text"
              ref={inputRef}
              placeholder="NFT token mint address"
            />
          </Col>
          <Col xs="12" md="12" lg="3" className="d-grid">
            <Button variant={variant} type="submit" onClick={isListedMagicEden}>
              Check NFT Listking
            </Button>
          </Col>
          <Col lg="1"></Col>
          <Col xs="12" md="12" lg="1">
            {/* {view === "nft-grid" && (
              <Button
                size="md"
                variant="danger"
                onClick={() => {
                  setView("collection");
                }}
              >
                Close
              </Button>
            )} */}
          </Col>
        </Row>
        {isList ? (
          <Row>
            <Col></Col>
            <Col lg='3' md='4'>
            <Card
              className="imageGrid"
              lg="3"
              style={{
                width: "100%",
                backgroundColor: "#2B3964",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <Card.Img
                variant="top"
                src={nftImg}
                alt={name}
              />
              <Card.Body>
                <Card.Title style={{ color: "#fff" }}>
                  <p>{name}</p>
                </Card.Title>
              </Card.Body>
            </Card>
            </Col>
            <Col>
              <p>Token Mint: {tokenMint}</p>
              <p>Owner: {owner}</p>
              <p>Magic Eden Listed</p>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col style={{display: 'flex', justifyContent: 'center'}}>
              <p>Not Listed in Magic Eden...</p>
            </Col>
          </Row>
        )}    
        {/* {loading ? (
          <div className="loading">
            <PreLoader variant={variant} />
          </div>
        ) : 
        view === "collection" ? (
          <Collections
            groupedNfts={groupedNfts}
            setNfts={setNfts}
            variant={variant}
            setView={setView}
          />
        ) : 
        (
          <GalleryView nfts={nfts} />
        )}
        {show && (
          <AlertDismissible title={title} message={message} setShow={setShow} />
        )} */}
      </div>
    </div>
  );
}

export default App;
