import './App.css';
import './Home.css';
import { Link } from 'react-router-dom'
import { Buffer } from 'buffer';
Buffer.from('anything','base64');
window.Buffer = window.Buffer || require('buffer').Buffer;

const Home = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <div>
          <h1 style={{color: 'DarkBlue', fontSize: '60px'}}>Secret Letter</h1>
        </div>
        <div>
          <h2 style={{color: 'Indigo'}}>
            Send a secret to your friend.   Keep your secret on the NFT.
          </h2>
        </div>
      </header>
      <article className='App-article'>
        <div className='row'>
          <section className='col-lg-6 col-md-12'>
            <h2 style={{textAlign: 'center'}}>Introduction</h2>
            <div style={{width: '80%', marginLeft: 'auto', marginRight: 'auto'}}>
              <p>The secret letter is an NFT project based on NEAR protocol. We want to show the NFT is not just a JPEG or a certificate. It can apply to things by your imagination.</p>
              <br/>
              <p>In phase one, we want to create two kinds of letters (an NFT minted by the site). The first one we call it secret letter. It's rewritable, and you can write some messages in the letter and send it to your friend, and others know your friends have the message but aren't capable of reading the content.</p>
              <br/>
              <p>The second one we call secret messages. The content is immutable, and can be traded on the secondary market. Each secret message has its credit start from 5. The holder who has read the message can like or dislike the message. Wen a message's credit goes to 0, it'll be burned and we'll disclose the content of the message. And there is also a scoreboard for these messages, everyone who joins the project can see the messages' scores.</p>
            </div>
          </section>
          <section className='col-lg-6 col-md-12'>
            <div className='d-flex justify-content-center align-items-center' style={{width: '100%', height:'50%', minHeight: '120px'}}>
              <Link className='btn btn-warning btn-enter' to='/secretmessage'>start</Link>
            </div>
            <div style={{height:'50%'}}>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

export default Home;
