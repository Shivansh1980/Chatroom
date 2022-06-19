import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';

export default function CodeView(props) {
    let code = props.code;
    let language = props.language;
    let self = props.self;

    return (
        <SyntaxHighlighter language={ language }>
            {code}
        </SyntaxHighlighter>
    )
}
