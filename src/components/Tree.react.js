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
                    const icon = e.target.nodeName === 'svg' ? e.target : e.target.parentNode;

                    if (icon.classList.contains('expandButton')) {
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
                    //TODO placeholder / not container;
                    e.stopPropagation();
                    const draggedNodeId = e.dataTransfer.getData('draggedNodeId');
                    const dropTarget = this.getNodeById(e.currentTarget.id)
                    const targetParentIds = this.getParentList(dropTarget).map((node) => node.id);

                    if ([dropTarget.id].concat(targetParentIds).indexOf(draggedNodeId) === -1) {
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
                aChildren.map((child) => this.createTreeNode(child))
            )
        );
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

    toggle(aNode) {
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
// keyboard navigation

export default Tree;
