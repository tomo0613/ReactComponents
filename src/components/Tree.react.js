import React from 'react';
import TreeNode from 'TreeNode.react';
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
        const topLevelNodes = this.state.treeData.filter((node) => !node.parentId);

        return React.DOM.div({
            className: 'reactTree'
        }, topLevelNodes.sort((a, b) => a.order - b.order).map((node) => this.createTreeNode(node)));
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
                    container: container,
                    order: nodeData.order || index
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
                    e.stopPropagation();

                    const draggedNodeId = e.dataTransfer.getData('draggedNodeId');
                    const dropTarget = this.getNodeById(e.currentTarget.id)

                    if (this.validDropTarget(dropTarget, draggedNodeId)) {
                        const className = 'highlight_' + this.placementByCursorPos(e);;
                        this.setHighlightClass(e.currentTarget, className);
                        e.preventDefault();
                    }
                },
                onDragLeave: (e) => {
                    e.stopPropagation();
                    this.setHighlightClass(e.currentTarget, null);
                },
                onDrop: (e) => {
                    e.stopPropagation();
                    const droppedNode = this.getNodeById(e.dataTransfer.getData('draggedNodeId'));
                    const dropTarget = this.getNodeById(e.currentTarget.id);
                    const placement = this.placementByCursorPos(e);
                    const newPosition = {};

                    if (dropTarget.container && placement === 'inside') {
                        newPosition.parentId = dropTarget.id;
                        newPosition.after = Infinity;
                    } else {
                        newPosition.parentId = dropTarget.parentId;
                        newPosition[placement] = dropTarget.order;
                    }

                    this.changeNodePosition(droppedNode, newPosition);
                    this.setHighlightClass(e.currentTarget, null);
                }
            },
            React.DOM.div(
                {className: 'treeRow'},
                aFields
            ),
            aChildren && React.DOM.div(
                {className: 'treeChildren'},
                aChildren.sort((a, b) => a.order - b.order).map((child) => this.createTreeNode(child))
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

    changeNodePosition(aNode, newPosition) {
        const newTreeData = this.state.treeData.map((data) => {
            if (newPosition.parentId && aNode.id === data.id) {
                data.parentId = newPosition.parentId;
            }

            if (newPosition.after === Infinity && aNode.id === data.id) {
                data.order = this.state.treeData.filter((el) => el.parentId === newPosition.parentId).length;
            } else if (typeof newPosition.after === 'number') {
                if (aNode.id === data.id) {
                    data.order = newPosition.after + 1;
                }
                if (aNode.parentId === data.parentId) {
                    data.order = data.order > newPosition.after ? data.order + 1 : data.order;
                }
            } else if (typeof newPosition.before === 'number') {
                if (aNode.id === data.id) {
                    data.order = newPosition.before;
                }
                if (aNode.parentId === data.parentId && aNode.id !== data.id) {
                    data.order = data.order >= newPosition.before ? data.order + 1 : data.order;
                }
            }

            return data;
        });

        this.setState({
            treeData: newTreeData
        });
    }

    validDropTarget(dropTarget, draggedNodeId) {
        const targetParentIds = this.getParentList(dropTarget).map((node) => node.id);

        return [dropTarget.id].concat(targetParentIds).indexOf(draggedNodeId) === -1;
    }

    placementByCursorPos(e) {
        const targetRect = e.currentTarget.getBoundingClientRect();
        const container = this.getNodeById(e.currentTarget.id).container;

        if (e.clientY < targetRect.top + targetRect.height / 3) {
            return 'before';
        } else if (container && e.clientY < targetRect.top + targetRect.height / 3 * 2) {
            return 'inside';
        } else {
            return 'after';
        }
    }

    setHighlightClass(aTarget, aClassName) {
        const classList = aTarget.classList;

        ['highlight_before', 'highlight_inside', 'highlight_after'].forEach((className) => {
            classList.remove(className);
        })

        if (aClassName) {
            classList.add(aClassName);
        }
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
