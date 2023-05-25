import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import raw_data from './data/30_022_128_1_0_Questions.json';


// const URL = 'http://10.0.0.100:3000';

const URL = 'ec2-54-191-250-178.us-west-2.compute.amazonaws.com'

function App() {

  const [outputData, setOutputData] = useState([]);
  const [dataIndex, setDataIndex] = useState(0);

  useEffect(() => {
    console.log("Getting data...")
    console.log(`URL: ${URL}/annotate`)
    axios.get(`${URL}/annotate`).then(res => {
      console.log("Got data!");
      console.log(res.data);
      setOutputData(res.data);
      setDataIndex(res.data.length);
      console.log("Res data length: " + res.data.length);
    });
  }, []);

  function annotate(val) {
    console.log(dataIndex, val);
    setOutputData([...outputData, {'index': dataIndex, 'label': val}]);
    console.log(outputData);
    axios.post(`${URL}/annotate`, {'data': outputData}).then(res => {
      if (res.status == 200) {
        console.log("Posted data successfully");
        setDataIndex(dataIndex + 1);
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

  console.log("Data index " + dataIndex)

  return (
    <div className="App">
      <header className="App-header">
        <p 
          style={{backgroundColor: 'white', color: 'black', padding: 20}}
          dangerouslySetInnerHTML={{__html: format(
            // 'NATIVE SPANISH SPEAKER:\t&=laughs &-ay my god.\nNATIVE ENGLISH SPEAKER:\txxx no idea xxx &=laughs here we go.\n'
              raw_data[dataIndex]['dialog']
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
