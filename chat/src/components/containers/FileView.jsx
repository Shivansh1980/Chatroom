import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import FileViewer from 'react-file-viewer';
import { toDataURL } from '../../utils/utils';
import { CustomBox } from '../containers/CustomBox'
import { ImCross } from 'react-icons/im'


export default function FileView(props) {

    const file = props.file;
    const self = props.self;

    const type = file.name.split('.').pop();
    const [loading, setLoading] = useState(false);
    const [myFileView, setFileView] = useState(null);

    useEffect(() => {
        setLoading(true);
        toDataURL(file, function (dataURL) {
            setFileView(
                <div className="absolute_center" style={{height: '100%',width:'80%'}}>
                    <FileViewer fileType={type} filePath={dataURL} />
                </div>
            );
            setLoading(false);
        })
    }, [file]);

    function removeSelf() {
        ReactDOM.unmountComponentAtNode(self);
        self.remove();
    }

    return (
        <>
            <div className="cancel_button" onClick={removeSelf}>
                <ImCross />
            </div>
            {loading ?
                <CustomBox boxName="loader" hidden={false} />
                :
                myFileView
            }
        </>
    )
}
