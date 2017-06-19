
import React from 'react';
import ReactDOM from 'react-dom';

import Tree from './components/Tree.react';

import './style/index.css';

const treeData = [
       {
           id: 1,
           label: 'label_1',
           children: [
               {
                   id: 11,
                   label: 'label_1.1',
                   children: [
                       {
                           id: 111,
                           label: 'label_1.1.1'
                       }
                   ]
               },
               {
                   id: 12,
                   label: 'label_1.2'
               }
           ]
       },
       {
           id: 2,
           label: 'label_2',
           children: [
               {
                   id: 21,
                   label: 'label_2.1'
               }, {
                   id: 22,
                   label: 'label_2.2',
                   children: [
                       {
                           id: 221,
                           label: 'label_2.2.1'
                       }, {
                           id: 222,
                           label: 'label_2.2.2'
                       }
                   ]
               }, {
                   id: 23,
                   label: 'label_2.3'
               }
           ]
       },
       {
           id: 3,
           label: 'label_3'
       }
   ];

class MainElement extends React.Component {
    render()  {
        return React.DOM.div(
            {className: 'containerDiv'},
            React.createElement(Tree, {data: treeData})
        );
    }
}

ReactDOM.render(
    React.createElement(MainElement),
    document.getElementById('rootElement')
);
