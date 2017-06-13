import React from 'react';

const Tree = React.createClass({
    displayName: 'Tree',
    getDefaultProps: function() {
        return {
            columns: ['indent', 'icon', 'label', 'spacer'],
            indentSize: 16
        };
    },
    getInitialState: function() {
        return {treeData: []};
    }, //componentWillReceiveProps: reInit
    componentWillMount: function() {
        this.initTreeData();
    },
    render: function() {
        if (!this.state.treeData.length) {
            return null;
        }
        console.log('///////////////  RENDER  //////////////////', this.state.treeData);
        return React.DOM.div({
            className: 'reactTree'
        }, this.state.treeData.filter((node) => !node.parentId).map((node) => this.createTreeNode(node)));
    },
    initTreeData: function() {
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
                    // expanded: false
                };

                treeData.push(treeNode);

                if (container) {
                    traverseData(nodeData.children, treeNode);
                }
            });
        })(this.props.data, null);

        this.setState({treeData: treeData});
    },
    createTreeNode: function(aNode) {
        const aParentList = this.getParentList(aNode);
        const aParent = aParentList.length ? aParentList[0] : null;
        const aChildren = this.getChildren(aNode);
        const aLevel = aParentList.length;

        if (aParent && !aParentList.every((parent) => parent.expanded)) {
            return null;
        }
        const icon = {
            id: '',
            styleClass: 'iconPlaceholder'
        };
        if (aNode.container) {
            icon.id = aNode.expanded ? 'expand_more' : 'chevron_right';
            icon.styleClass = 'expandButton material-icons';
        }
        const fieldArguments = {
            indent: ['span', {style: {width: aLevel * this.props.indentSize + 'px'}}],
            icon: ['i', {className: icon.styleClass}, icon.id],
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
    },
    getNodeById: function(id) {
        return this.state.treeData.find((data) => id === data.id);
    },
    getParentList: function(aNode) {
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
    },
    getChildren: function(aNode) {
        return this.state.treeData.filter((data) => data.parentId === aNode.id);
    },
    expand: function() {},
    expandAll: function() {},
    collapse: function() { //collapse childre & -> if expanded

    },
    collapseAll: function() {},
    toggle: function(aNode) {
        this.setState({
            treeData: this.state.treeData.map((data) => {
                if (aNode.id === data.id) {
                    data.expanded = data.expanded === undefined ? true : data.expanded === false;
                }
                return data;
            })
        });
    },
    updateParent: function(aNode, parentId) {
        this.setState({
            treeData: this.state.treeData.map((data) => {
                if (aNode.id === data.id) {
                    data.parentId = parentId;
                }
                return data;
            })
        });
    },
    toggleAll: function() {},
    insertNode: function() {},
    selectNode: function() {},
    removeNode: function() {}
});


return Tree;
