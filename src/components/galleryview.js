import { useState } from "react";
import { Card,Row, Col, Container, Button } from "react-bootstrap";

function GalleryView({nfts}) {
    const [mnfts, setMnfts] = useState(nfts);
    const checkListing = async () => {
      let _nfts = [];
      for(const tmp of nfts) {
        const _tmp = [];
        _tmp.image = tmp.image;
        _tmp.name = tmp.name;
        _tmp.isMagicEden = await isListedMagicEden(tmp.mint);
        // _tmp.isOpenSea = await isListedOpenSea(tmp.mint);
        _nfts.push(_tmp);
      }
      setMnfts(_nfts);
    }

    const isListedMagicEden = async (addr) => {
      let req = "https://api-mainnet.magiceden.io/rpc/getNFTByMintAddress/";
      req += addr;
      try {
        let res = await fetch(req);
        let res_json = await res.json();
        if(res_json.results.mintAddress === addr) {
          return "Listed";
        }else {
          return 'None';
        }
      } catch (err) {
        return 'None';
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

    return (
      <Container>
        <Row>
          <Col lg='2'>
          <Button onClick={checkListing}>Check Listing</Button>
          </Col>
        </Row>
        <Row>
          {mnfts.map((metadata, index) => (
          <Col xs="12" md="6" lg="3" key={index}>
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
                src={metadata?.image}
                alt={metadata?.name}
              />
              <Card.Body>
                <Card.Title style={{ color: "#fff" }}>
                  <p>{metadata?.name}</p>
                  <p>Magic Eden: {metadata?.isMagicEden}</p>
                  {/* <p>Open Sea: {metadata?.isOpenSea}</p> */}
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
      ))}
        </Row>
      </Container>
    );
}
export default GalleryView;