import React, { Component } from 'react'

export class Menu extends Component {
    render() {
        return (
            <div className="menu">
                <ul>
                    <li onClick={ this.props.question_layout_handler}> Questions</li>
                    <li onClick={this.props.answer_layout_handler}> Answers</li>
                </ul>
            </div>
        )
    }
}

export default Menu
