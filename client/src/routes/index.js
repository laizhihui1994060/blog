import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom';

import Index from '../containers/index'



class App extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    return (
      <BrowserRouter >
        <div>
          <Switch>
            <Route exact path="/" component={Index} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}
export default App;