import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './routes/index';
import configureStore from './configureStore'
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(
  <div>
    <Provider store={configureStore}>
      <App />
    </Provider>
  </div>,
  document.getElementById('root'))

registerServiceWorker();
