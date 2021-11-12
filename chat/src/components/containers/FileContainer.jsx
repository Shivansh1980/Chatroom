import React, {useState} from 'react'
import {api_url} from '../../global'
import PropTypes from "prop-types"
import { LinearProgress } from '@material-ui/core'

FileContainer.prototype = {
    file: PropTypes.object,
    filename: PropTypes.string,
    url: PropTypes.string,
    dataURL: PropTypes.string,
}

export default function FileContainer(props) {
    let file = props.file;
    let filename = props.filename;
    let url = props.url;
    let dataURL = props.dataURL;
    
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileDataURL, setFileDataURL] = useState('');

    function fileToDataURL(file) {
        setLoading(true);
        let fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
            let base64 = fileLoadedEvent.target.result;
            setFileDataURL(base64);
            setError(false);
            setLoading(false);
        }

        fileReader.onerror = function () {
            setError(fileReader.error);
            setLoading(false);
        }

        fileReader.onprogress = function (data) {
            if (data.lengthComputable) {
                let progress = parseInt(((data.loaded / data.total) * 100), 10);
                setProgress(progress);
            }
        }

        fileReader.readAsDataURL(file);
    }

    if (file) {
        fileToDataURL(file);
        return (
            <>
                {loading ?
                    <div className="file_reading_progress">
                        <LinearProgress variant="determinate" value={progress} />
                    </div>
                    :
                    <>
                        {!error ?
                            <>
                                <div className="file__header">
                                    <h3 align="center"></h3>
                                </div>
                                <a className="file__link" href={fileDataURL} download>Download File</a>
                            </>
                            :
                            <div>
                                {alert(error)}
                            </div>
                        }
                    </>
                }
            </>
        )
    }

    else if (url && filename) {
        return (
            <>
                <div className="file__header">
                    <h3 align="center"></h3>
                </div>
                <a className="file__link" href={api_url + url} download>Download File</a>
            </>
        )
    }
    else if (dataURL && filename) {
        return(
            <>
                <div className="file__header">
                    <h3 align="center">{ filename }</h3>
                </div>
                <a className="file__link" href={dataURL} download>Download File</a>
            </>
        )
    }
    else {
        return (
            <div>
                <h3>No File Recieved</h3>
                <p>{ dataURL }</p>
            </div>
        )
    }
}