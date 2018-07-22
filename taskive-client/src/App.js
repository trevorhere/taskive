import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';

class App extends Component {
  state = {
    response: '',
    recipient: '',
    catFacts: []
  };


  changeInput = (event) => {
    this.setState({recipient: event.target.value});
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }
  
  getRand = () => {
    return Math.floor((Math.random() * 44));
  }
  




  sendSms = () => {
    setInterval(() => {
      let rand = this.getRand();
      fetch('/api/send', {
        method: 'POST',
        headers: {
          Accept: 'application/JSON',
          'Content-Type': 'application/JSON'
        },
        body: JSON.stringify({recipient: this.state.recipient, text: this.state.catFacts[rand].text})
      })
      // .then(resp => resp.json())
      // .then(resp => {
      //   console.log(resp)
      // })
      console.log("sending message")
    }, 5000);
  }

  proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  targetUrl = 'https://cat-fact.herokuapp.com/facts';

  sendCatFacts = () => {

  fetch(this.proxyUrl + this.targetUrl)
  .then(resp => resp.json())
  .then((data) =>  {
    this.setState({catFacts: data.all})
    console.log(this.state.catFacts);
  })
}

  callTest = async () => {
    const response = await fetch('/api/test');
    const body = await response.json;

   // if (response.status !== 200) throw Error(body.message);

    return body;
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };


  render() {
    return (
      <div className="App">
        <p className="App-intro">{this.state.response}</p>
        <div>
        <p>Enter phone number to send SMS to: </p>
        <input 
          onChange={this.changeInput} 
          value={this.state.recipient} 
          placeholder="+12223334444"
        />
        <button onClick={this.sendSms}>Send message</button>
        <p>Don\'t forget your country code, e.g., +1 in the US.</p>
        <button onClick={this.sendCatFacts}>Cat Facts</button>
        <button onClick={this.callTest}>Test</button>
      </div>
      </div>
    );
  }
}

export default App;
