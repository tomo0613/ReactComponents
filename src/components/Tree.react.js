import React from 'react';
import Icon from 'Icon.react';

class Tree extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            treeData: []
        }
    }

    componentWillMount() {
        this.initTreeData();
    }

    render() {
        if (!this.state.treeData.length) {
            return null;
        }
        // console.log('///////////////  RENDER  //////////////////', this.state.treeData);
        return React.DOM.div({
            className: 'reactTree'
        }, this.state.treeData.filter((node) => !node.parentId).map((node) => this.createTreeNode(node)));
    }

    initTreeData() {
        if (!this.props.data) {//TODO REFACTOR - handle multiple data structures
            return null;
        }
        const treeData = [];

        (function traverseData(data, parent) {
            data.forEach((nodeData, index) => {
                const container = !!(nodeData.children && nodeData.children.length);
                const treeNode = {
                    id: parent ? parent.id + '/' + index : '' + index,
                    parentId: parent ? parent.id : null,
                    label: nodeData.label,
                    container: container
                };

                treeData.push(treeNode);

                if (container) {
                    traverseData(nodeData.children, treeNode);
                }
            });
        })(this.props.data, null);

        this.setState({treeData: treeData});
    }

    createTreeNode(aNode) {
        const aParentList = this.getParentList(aNode);
        const aParent = aParentList.length ? aParentList[0] : null;
        const aChildren = this.getChildren(aNode);
        const aLevel = aParentList.length;

        if (aParent && !aParentList.every((parent) => parent.expanded)) {
            return null;
        }

        let iconId = '';
        if (aNode.container) {
            iconId = aNode.expanded ? 'collapse' : 'expand';
        }
        const fieldArguments = {
            indent: ['span', {className: 'indent', style: {width: aLevel * this.props.indentSize + 'px'}}],
            icon: [Icon, {className: iconId ? 'expandButton' : '', icon: iconId}],
            label: ['label', {}, aNode.label],
            spacer: ['span', {className: 'treeSpacer'}]
        };
        const aFields = this.props.columns.map((col) => {
            const args = fieldArguments[col];
            args[1].key = aNode.id + col;
            return React.createElement(...args);
        });

        return React.DOM.div(
            {
                id: aNode.id,
                className: 'treeElement',
                key: aNode.id,
                draggable: this.props.dranAndDrop || false,
                onClick: (e) => {
                    e.stopPropagation();
                    if (e.target.classList.contains('expandButton')) {
                        this.toggle(aNode);
                    }
                },
                onDoubleClick: (e) => {
                    e.stopPropagation();
                    if (aNode.container) {
                        this.toggle(aNode);
                    }
                },
                onDragStart: (e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('draggedNodeId', aNode.id);
                },
                onDragOver: (e) => {
                    //TODO placeholder
                    const draggedNodeId = e.dataTransfer.getData('draggedNodeId');
                    //TODO if not child of itself
                    // const draggedData = e.dataTransfer.getData('item');
                    const parentIds = aParentList.map((node) => node.parentId); //TODO target
                    parentIds.indexOf(aNode.id);

                    if (e.target.parentNode.classList.contains('treeRow')) {
                        e.preventDefault();
                    }
                },
                onDrop: (e) => {
                    e.stopPropagation();
                    const droppedNode = this.getNodeById(e.dataTransfer.getData('draggedNodeId'));
                    const dropTarget = this.getNodeById(e.currentTarget.id);

                    //TODO sort;

                    if (dropTarget.container) {
                        this.updateParent(droppedNode, dropTarget.id);
                    } else {
                        this.updateParent(droppedNode, dropTarget.parentId);
                    }
                },
                onDragEnd: (e) => {
                    console.log('dragEnd');
                    //TODO remove original
                }
            },
            React.DOM.div(
                {className: 'treeRow'},
                aFields
            ),
            aChildren && React.DOM.div(
                {className: 'treeChildren'},
                // aNode.children.map((child) => this.createTreeNode(child))
                aChildren.map((child) => this.createTreeNode(child))
            )
        );
        //listeners - onClick, onEnter -> select | onDoubleClick -> collapse |
    }

    getNodeById(id) {
        return this.state.treeData.find((data) => id === data.id);
    }

    getParentList(aNode) {
        const that = this;
        const parentList = [];
        let parent;

        function findParent(id) {
            parent = that.getNodeById(id);
            if (parent) {
                parentList.push(parent);
                findParent(parent.parentId);
            }
        }

        if (aNode.parentId) {
            findParent(aNode.parentId);
        }

        return parentList;
    }

    getChildren(aNode) {
        return this.state.treeData.filter((data) => data.parentId === aNode.id);
    }

    toggle(aNode) {//TODO fix
        this.setState({
            treeData: this.state.treeData.map((data) => {
                if (aNode.id === data.id) {
                    data.expanded = data.expanded === undefined ? true : data.expanded === false;
                }
                return data;
            })
        });
    }

    updateParent(aNode, parentId) {
        this.setState({
            treeData: this.state.treeData.map((data) => {
                if (aNode.id === data.id) {
                    data.parentId = parentId;
                }
                return data;
            })
        });
    }
}

Tree.defaultProps = {
    columns: ['indent', 'icon', 'label', 'spacer'],
    indentSize: 16
}

// const Tree = React.createClass({
//
//     expand: function() {},
//     expandAll: function() {},
//     collapse: function() { //collapse children & -> if expanded
//     },
//     collapseAll: function() {},
//     toggleAll: function() {},
//     insertNode: function() {},
//     selectNode: function() {},
//     removeNode: function() {}
// });

export default Tree;
