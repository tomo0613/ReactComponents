import React from 'react';

const icons = {
    close: `
        M672 256l-160 160-160-160-96 96 160 160-160 160 96 96 160-160 160 160 96-96-160-160 160-160z
        M512 0c-282.77 0-512 229.23-512 512s229.23 512 512 512 512-229.23 512-512-229.23-512-512-512z
        M512 928c-229.75 0-416-186.25-416-416s186.25-416 416-416 416 186.25 416 416-186.25 416-416 416z
    `,
    expand: `M366 698l196-196-196-196 60-60 256 256-256 256z`,
    collapse: `M708 366l60 60-256 256-256-256 60-60 196 196z`
};

class Icon extends React.Component {
    render() {
        const props = this.props;
        const path = props.icon ? icons[props.icon] : '';
        const style = {
            svg: {
                display: 'inline-block',
                verticalAlign: 'middle',
            },
            path: {
                fill: props.color,
            }
        };
        const svgProps = {
            style: style.svg,
            width: props.size + 'px',
            height: props.size + 'px',
            viewBox: '0 0 1024 1024'
        };
        if (props.className) {
            svgProps.className = props.className;
        }
        if (props.id) {
            svgProps.id = props.id;
        }
        return React.DOM.svg(svgProps,
            React.DOM.path({style: style.path, d: path})
        );
    }
}

Icon.defaultProps = {
    size: 16
}

export default Icon;
