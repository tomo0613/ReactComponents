
import React from 'react';
import ReactDOM from 'react-dom';

import Tree from './components/Tree.react';

import './style/index.css';

const MainElement = React.createClass({
    displayName: 'MainElement',
    render: () => {
        return React.DOM.div(
            {className: 'containerDiv'},
            React.createElement(Tree, {})
        );
    }
});

ReactDOM.render(
    React.createElement(MainElement),
    document.getElementById('rootElement')
);
