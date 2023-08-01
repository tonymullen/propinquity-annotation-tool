import axios from 'axios';
import Button from 'react-bootstrap/Button';
import ReactModal from 'react-modal';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import users from './data/userlist.json';
import dataFileList from './data/dataFileList.json';

const URL = 'http://10.0.0.100:8080';

function Annotation({ dataFiles }) {

  const [outputData, setOutputData] = useState([]);
  const [dataLineIndex, setDataLineIndex] = useState(0);
  const [dataDocIndex, setDataDocIndex] = useState(0);
  const [annotator, setAnnotator] = useState(null);
  const [raw_data, setRawData] = useState(null);

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
    console.log("Setting rawData file")
    setRawData(dataFiles[`df${dataFileList[dataDocIndex]}`]);
  }, [dataDocIndex]);

  useEffect(() => {
    console.log("Data line index");
    console.log(dataLineIndex);
  }, [dataLineIndex]);

  useEffect(() => {
    if (outputData.length == 0) {
      return;
    }
    axios.post(`/annotate`, {'data': outputData}).then(res => {
      if (res.status == 200) {
        setTimeout(() => {
          axios.get(`/progress/${annotator}`).then(res => {
            if (res.status == 200) {
              setDataLineIndex(res.data.current_line_ind);
              setDataDocIndex(res.data.current_doc_ind);
            } else {
              alert("Error getting progress, please open a new tab and try again.")
            }
          });
        }, 500);
      } else {
        alert("Error posting data, please open a new tab and try again.")
      }
    });
  }, [outputData]);


  function annotate(val) {
    setOutputData([...outputData, 
      {
        'annotator': annotator,
        'line_index': dataLineIndex,
        'doc_index': dataDocIndex,
        'text': raw_data[dataLineIndex]['dialog'],
        'label': val
      }
    ]);

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
    let name = e.target[0].value.trim().toLowerCase();
    if (users.includes(name)) {
      logInAnnotator(name)
    }
  }

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
      { raw_data && 
        <div>
          <p style={{fontSize: 'x-small'}}>Index { dataLineIndex } out of {raw_data.length-1} in file {dataFileList[dataDocIndex]}</p>
          <p 
            style={{backgroundColor: 'white', color: 'black', padding: 20}}
            dangerouslySetInnerHTML={{__html: format(
                //raw_data[dataLineIndex]['dialog'].replace(/(<([^>]+)>)/gi, "")
                raw_data[dataLineIndex]['dialog'].replace(/<|>|\[|\]/gi, "")
            )}} />
        </div>}
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

export default Annotation;
