import React from 'react';
import ReactDOM from 'react-dom';
import { ImCross } from 'react-icons/im'

export default function ImageView(props) {
    let src = props.src;
    let image = props.image;
    let self = props.self;
    let height = props.height;
    let width = props.width;
    
    function removeSelf() {
        ReactDOM.unmountComponentAtNode(self);
        self.remove();
    }

    return (
        <div className="image_view absolute_center" style={ {width: width, height: height}}>
            <div className="cancel_button" onClick={removeSelf}>
                <ImCross />
            </div>
            <img src={ image ? image.src : src }/>
        </div>
    )
}
