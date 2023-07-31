import axios from 'axios';
import Button from 'react-bootstrap/Button';
import ReactModal from 'react-modal';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import raw_data from './data/30_022_128_1_0_Questions.json';
import users from './data/userlist.json';
import fileNames from './data/dataFileList.json';

const URL = 'http://10.0.0.100:8080';
// const URL = 'ec2-54-212-38-167.us-west-2.compute.amazonaws.com'

function App() {

  const [outputData, setOutputData] = useState([]);

  const [dataFile, setDataFile] = useState(null);
  const [dataLineIndex, setDataLineIndex] = useState(0);
  const [dataDocIndex, setDataDocIndex] = useState(0);
  const [annotator, setAnnotator] = useState(null);

  useEffect(() => {
    console.log("Initializing component")
    let stored_annotator = localStorage.getItem('annotator');
    stored_annotator && setAnnotator(stored_annotator);
    if (!!annotator) {
      axios.get(`/progress/${annotator}`).then(res => {
        if (res.status == 200) {
          setDataLineIndex(res.data.current_line_ind);
          setDataDocIndex(res.data.current_doc_ind);
        } else {
          alert("Error getting progress, please open a new tab and try again.")
        }
      });
  }
  });

  useEffect(() => {
    axios.get(`/annotate`).then(res => {
      setOutputData(res.data);
    });
  }, []);

  useEffect(() => {
    console.log("Data line index");
    console.log(dataLineIndex);
  }, [dataLineIndex]);

  function annotate(val) {
    // console.log(dataIndex, val);
    setOutputData([...outputData, 
      {
        'annotator': annotator,
        'index': dataLineIndex, 
        'label': val
      }
    ]);
    // console.log(outputData);
    // console.log("Annotating")
    axios.post(`/annotate`, {'data': outputData}).then(res => {
      if (res.status == 200) {
        // console.log("Posted data successfully");
        axios.get(`/progress/${annotator}`).then(res => {
          if (res.status == 200) {
            // console.log("Got progress:")
            console.log(res.data)
            setDataLineIndex(res.data.current_line_ind);
            setDataDocIndex(res.data.current_doc_ind);
          } else {
            alert("Error getting progress, please open a new tab and try again.")
          }
        });
      } else {
        alert("Error posting data, please open a new tab and try again.")
      }
    });
  }

  function format(rawstr) {
    let newlines = rawstr.replaceAll(/\n/msg, '<br>');
    let boldlines = newlines.replaceAll(/(NATIVE .*? SPEAKER:)/msg, '<strong>$1</strong><br>');
    return boldlines;
  }

  function logInAnnotator(name) {
    setAnnotator(name);
    localStorage.setItem('annotator', name);
  }

  function handleSubmitUsername(e) {
    e.preventDefault();
    // console.log("Submitted");
    let name = e.target[0].value.trim().toLowerCase();
    if (users.includes(name)) {
      console.log("Great, logging in!")
      logInAnnotator(name)
    }
  }

  // console.log("Data line index " + dataLineIndex)
  // console.log(raw_data[0]);

  return (
    <div className="App">
      { annotator 
      ?
        <div>Annotator: {annotator}</div>
      :
        <ReactModal 
          isOpen={true}
        >
          <form onSubmit={handleSubmitUsername}>
          <label>
            Username:
            <br/>
            <input type="text" name="name" />
          </label>
            <br/>
            <p>
          <input type="submit" value="Submit" />
          </p>
        </form>
        </ReactModal>
      } 
      
      <header className="App-header">
        <p 
          style={{backgroundColor: 'white', color: 'black', padding: 20}}
          dangerouslySetInnerHTML={{__html: format(
              raw_data[dataLineIndex]['dialog']
          )}} />
        <div>
          <Button 
            style={{margin:10}}
            onClick={() => annotate('warm')}
            variant="warning">Warm</Button>{' '}
          <Button 
            style={{margin:10}}
            onClick={() => annotate('cool')}
            variant="info">Cool</Button>{' '}
        </div>
        <div>
          <Button 
            style={{margin:10}}
            onClick={() => annotate('neutral')}
            variant="secondary">Neutral</Button>{' '}
        </div>
      </header>
    </div>
  );
}

export default App;
