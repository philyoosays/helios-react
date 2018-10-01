import React, { Component } from 'react';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      recognition: undefined,
      speakPitch: '',
      speakRate: '',
      status: 'off',
      voice: 'Karen',
    }
  }

  componentDidMount() {

  }

  checkStopWord(hashObj) {
    const stopWords = [ 'stop listening', 'hard stop', 'shut down' ];
    let hardStop = false;
    for(let i = 0; i < stopWords.length; i++) {
      for(let key in hashObj) {
        if(key.includes(stopWords[i])) {
          hardStop = true;
        }
      }
    }
    return hardStop;
  }

  async performHardStop() {
    await this.stopListen()
    const coinFlip = Math.random() > .5 ? true : false;
    const final = coinFlip ? 'Shutting down.' : 'Signing off.';
    let theSignOff = 'Acknowledging hard stop and performing shut down procedures.' + ' ' + final
    this.speak(theSignOff);
  }

  speak(toSay) {
    var synth = window.speechSynthesis;
    let voices = this.state.synth.getVoices();
    let sayThis = new SpeechSynthesisUtterance(toSay);

    sayThis.onend = async (event) => {
      console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
    }
    let name = this.state.voice;
    if(lang === 'korean') {
      name = 'Yuna'
    }
    voices.forEach(d => {
      if(d.name === name) {
        sayThis.voice = d
      }
    })
    sayThis.pitch = this.state.speakPitch;
    sayThis.rate = this.state.speakRate;

  }

  startListen() {
    const SpeechRecognition = window.webkitSpeechRecognition;
    const SpeechGrammarList = window.webkitSpeechGrammarList;
    const SpeechRecognitionEvent = window.webkitSpeechRecognitionEvent;

    let recognition = new SpeechRecognition();
    let SpeechRecognitionList = new SpeechGrammarList();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      this.setState({ status: 'Ready' });
      console.log('Recognition Start');
    }

    recognition.onresult = async (event) => {
      let last = event.results.length - 1;
      let resultsObj = event.results[last];
      let resultsHash = {};
      let finalHash = {};
      let counter = 0;
      for(let key in resultsObj) {
        const transcript = resultsObj[key].transcript;
        const confidence = resultsObj[key].confidence
        resultsHash[transcript] = {
          confidence: confidence,
          index: counter
        }
        counter++;
      }

      for(let key in resultsHash) {
        finalHash[key.toLowerCase().trim()] = resultsHash[key];
      }

      const hardStop = this.checkStopWord(finalHash)
      const wasICalled = this.wasICalled(finalHash)

      if(hardStop) {
        this.performHardStop()
      } else {
        if(wasICalled) {

        }

      }
    }

    this.setState({ recognition })
  }

  async stopListen() {
    if(this.state.recognition) {
      await this.state.recognition.abort();
    }
  }

  wasICalled() {
    const names = [ 'helios', 'chileos', 'chelios', 'korean' ];
    let goodName = false;
    if(!this.state.calledOn) {
      for(let i = 0; i < names.length; i++) {
        for(let key in hashObj) {
          if(key.includes(names[i])) {
            goodName = true;
          }
        }
      }

      if(goodName === true && hashObj['korean'] !== undefined) {
        goodName = 'korean'
      }
    } else {
      goodName = true;
    }
    console.log('goodName', goodName)
    return goodName;
  }

  render() {
    return (
      <div className="App">
        <p>{ this.state.status }</p>
      </div>
    );
  }
}

export default App;
