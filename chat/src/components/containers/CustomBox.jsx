import React, { Component } from 'react'
import { BiError } from 'react-icons/bi'
import { CircularProgress } from '@material-ui/core'

export class CustomBox extends Component {
    boxName = this.props.boxName;
    constructor(props) {
        super(props);
    }

    render() {
        let layout;
        if (this.boxName == "image_to_text_box")
            layout =
                <div className="image_to_text_box">
                    <form id="image_to_text_form">
                        <div>
                            <input className="image_to_text_inputs" id="convert_to_text" name="convert_to_text" type="checkbox"/>
                            <label htmlFor="convert_to_text">Convert To Text</label>
                        </div>
                        <div>
                            <input className="image_to_text_inputs" id="direct_upload" name="direct_upload" type="checkbox" />
                            <label htmlFor="upload_direct">Direct Upload</label>
                        </div>
                        <div className="image_to_text_description">
                            <p>Image Description</p>
                            <textarea className="image_to_text_textarea" id="image_description" placeholder="Enter Image Description here" cols="50"></textarea>
                        </div>
                        <div>
                            <button
                                id="upload_button"
                                className="image_to_text_button"
                                type="submit"
                                value="upload"
                                onClick={(e) => this.props.handler(e, { "button": "upload" })}
                            >Upload</button>
                            <button
                                id="cancel_button"
                                className="image_to_text_button"
                                type="submit"
                                value="cancel" 
                                onClick={(e) => this.props.handler(e, { "button": "cancel" })}
                            >Cancel</button>
                        </div>
                    </form>
                </div>
        else if (this.boxName == 'progress_box')
            layout =
                <div className="progress_box">
                    <h2 id="progress_box_heading" align="center">{ this.props.text } ({this.props.progress+'%'})</h2>
                    <div className="progress_line" style={{width:this.props.progress+'%'}}></div>
                </div>
        else if (this.boxName == 'logout_box') {
            layout =
                <div className="logout_box">
                    <button id="logout_button" onClick={this.props.logoutHandler}>Logout</button>
                </div>
        }
        else if (this.boxName == 'error_box') {
            if (this.props.hidden)
                layout = <div></div>;
            else
                layout =
                <div className="error_box">
                    <p className="error_box_message">
                        <span>
                            <BiError size={25}/>
                        </span>
                        {this.props.error_message}
                    </p>
                </div>
        }
        else if (this.boxName == 'loader') {
            if (this.props.hidden) return (<div> </div>);
            else return (
                <div className="absolute_center">
                    <CircularProgress size={70} />
                    <h2>Please Wait Loading</h2>
                </div>
            )
        }
        else if (this.boxName == 'info_box') {
            let content = this.props.content;
            let title = this.props.title;
            let textColor = this.props.textColor;
            layout =
                <div id="info_box" className="info_box">
                    <h3>{title}</h3>
                <p style={{ color: textColor }}>{content}</p>
                </div>
        }
        return (
            <>
                {layout}             
            </>
        )
    }
}

export default CustomBox
