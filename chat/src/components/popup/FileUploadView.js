import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/css/popup.css';
import { LinearProgress } from "@material-ui/core";
import { show_info } from '../../styles/js/AlterCSS';
import Photoshop from '../containers/Photoshop';
import FileView from '../containers/FileView';


function FileUploadView(props) {
    let root = document.getElementById('root');
    let message_api = props.message_api;
    let file = props.file;
    let self = props.self;

    const [progress, setProgress] = useState(0);
    const [conversionText, setConversionText] = useState('');
    const [loading, setLoading] = useState(false);

    function removeSelf(e) {
        root.classList.remove('blur');
        ReactDOM.unmountComponentAtNode(self);
        self.remove();
    }

    function is_image_file() {
        if (file.type.startsWith('image')) return true;
        else return false;
    }

    function send_image_text() {
        setLoading(true);
        message_api.send_image_text(file, function (progress_value) {
            setProgress(progress_value);
        }, function (status) {
            if (status === true) {
                show_info({
                    title: 'Image',
                    content: 'Image To Text Conversion Successful',
                    color: 'green',
                    time:4
                })
                removeSelf();
            }
            else {
                show_info({
                    title: 'Image',
                    content: 'Image To Text Conversion Failed',
                    color: 'red',
                    time: 4
                })
                removeSelf();
            }
            setLoading(false);
        })
    }
    function handleSubmit(e) {
        e.preventDefault();
        let to_text, direct_upload;
        if(is_image_file()) to_text = e.target.ct.checked;
        direct_upload = e.target.du.checked;
        if (to_text && direct_upload) {
            alert("you can't tick both");
            return;
        }
        else if (to_text) {
            setConversionText('Converting To Text');
            send_image_text();
        }
        else if (direct_upload) {
            setLoading(true);
            setConversionText('Sending File Please Wait');
            message_api.send_file_to_group(file, 'here is the description', function(status){
                if (status === true) {
                    setLoading(false);
                    removeSelf();
                } else {
                    setLoading(false);
                    removeSelf();
                }
            });
        }
        else {
            alert('please check atleast one option');
            return;
        }
    }
    function openPhotoshop() {
        ReactDOM.unmountComponentAtNode(self);
        self.classList.remove('popup_file__container');
        self.classList.add('photoshop');
        ReactDOM.render(<Photoshop image={file} messageApi={message_api} self={self}/>, self);
    }

    function showFile() {
        let div = document.createElement('div');
        div.className = 'file_view_container absolute_center';
        div.id = 'file_view_id';
        document.body.append(div);
        ReactDOM.render(<FileView self={div} file={file} />, div);
    }
    if (!loading) {
        return (
            <>
                {root.classList.add('blur')}
                <div className="popup_file__header">
                    <h2 align="center">File Upload</h2>
                </div>
                <div className="popup_file__main">
                    <form className="popup_file__form" onSubmit={handleSubmit}>
                        {
                            is_image_file() ? 
                            <div>
                                <input id="convert_to_text" name="ct" type="checkbox" />
                                <label htmlFor="convert_to_text">Convert To Text</label>
                            </div>
                            :
                            null
                        }
                        <div>
                            <input id="direct_upload" name="du" type="checkbox" />
                            <label htmlFor="direct_upload">Direct Upload</label>
                        </div>
                        <input type="button" value="View File" onClick={ showFile }/>
                        <input type="submit" value='Upload' />

                        { is_image_file() ?
                            < input type="button" value="Open Photoshop" onClick={openPhotoshop} />
                            :
                            null
                        }
                        <input type="button" value="cancel" onClick={removeSelf}/>
                    </form>
                </div>
            </>
        )
    }
    else {
        return (
            <>
                {root.classList.remove('blur')}
                <div className="upload_progress_container">
                    <h3 align="center">{ conversionText }</h3>
                    <LinearProgress variant="determinate" value={progress} />
                </div>
            </>
        )
    }
}

export default FileUploadView
