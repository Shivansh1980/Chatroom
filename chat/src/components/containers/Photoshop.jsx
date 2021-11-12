import React, {useState, useEffect, useRef} from 'react'
import '../../styles/css/photoshop.scss'
import { Slider, CircularProgress } from '@material-ui/core'
import ReactDOM from 'react-dom'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../utils/CropImage'

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


export default function Photoshop(props) {
    let imageFile = props.image;
    let messageApi = props.messageApi;
    let self = props.self;

    const [loading, setLoading] = useState(false);
    const [saturation, setSaturation] = useState(50);
    const [brightness, setBrightness] = useState(50);
    const [contrast, setContrast] = useState(50);
    const [grayScale, setGrayScale] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [invert, setInvert] = useState(0);

    //Variables For Cropping Of Images
    const [image, setImage] = useState(null);
    const [isCropping, setCropping] = useState(false);
    const [croppedArea, setCroppedArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    function showImage(imageFile) {
        var fr = new FileReader();
        fr.onload = () => {
            setImage(fr.result);
        }
        fr.readAsDataURL(imageFile);
    }

    const updateImage = (data) => {

        if(data.saturation) setSaturation(data.saturation);
        if(data.brightness) setBrightness(data.brightness);
        if(data.grayscale) setGrayScale(data.grayscale);
        if (data.sepia) setSepia(data.sepia);
        if (data.invert) {
            if (invert == 1) setInvert(0);
            else setInvert(1);
        }
        if (data.contrast) setContrast(data.contrast);
        
        let image = document.getElementById('photoshop_img');
        let filters = `saturate(${saturation + 50}%) brightness(${brightness + 50}%) grayscale(${grayScale}%) sepia(${sepia}%) invert(${invert}) contrast(${contrast+60}%)`;
        let canvas_container = document.getElementById('photoshop_canvas_container');
        // let canvas = document.getElementById('photoshop_canvas');
        let canvas = document.createElement('canvas');
        canvas.id = 'photoshop_canvas';
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext('2d');
        context.filter = filters;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas_container.innerHTML = null;
        canvas_container.append(canvas);
    }

    function sendImageToRoom() {
        setLoading(true);
        var canvas = document.getElementById('photoshop_canvas');
        let file = dataURLtoFile(canvas.toDataURL('image/jpeg'), 'photoshoped_image');
        messageApi.send_file_to_group(file, 'description here', function (status) {
            if (status == true) {
                setLoading(false);
                closePhotoshop();
            } else {
                setLoading('false');
            }
        });
    }

    function closePhotoshop() {
        document.getElementById('root').classList.remove('blur');
        ReactDOM.unmountComponentAtNode(self);
        if (document.getElementById('photoshop_canvas')) ReactDOM.unmountComponentAtNode(document.getElementById('photoshop_canvas_container'));
        self.remove();
    }

    function cropImage() {
        getCroppedImg(image, croppedArea).then(croppedImageUrl => {
            setImage(croppedImageUrl);
            setCropping(false);
        })
    }
    
    useEffect(() => {
        if(image === null) showImage(imageFile);
        if(!isCropping) updateImage({});
    },[saturation, brightness, sepia, grayScale, invert]);
    return (
        <>
            <h2 align="center">PhotoShop (Developer Shivansh Shrivastava)
                <span>
                    <input type="button" value="Close Photoshop" onClick={ closePhotoshop }/>
                </span>
            </h2>
        <div className="photoshop_container">
                <div className="photoshop_sliders">
                    <div className="saturation_slider">
                        <h4>Saturation</h4>
                        <Slider
                            value={saturation}
                            onChange={(e, data) => {
                                updateImage({saturation:data});
                            }}
                            color="secondary"
                            valueLabelDisplay="auto"
                        />
                    </div>
                    <div className="brightness_slider">
                        <h4>Brightness</h4>
                        <Slider
                            value={brightness}
                            onChange={(e, data) => {
                                updateImage({brightness: data});
                            }}
                            color="secondary"
                            valueLabelDisplay="auto"
                        />
                    </div>

                    <div className="contrast_slider">
                        <h4>Contrast</h4>
                        <Slider
                            value={contrast}
                            onChange={(e, data) => {
                                updateImage({ contrast: data });
                            }}
                            color="secondary"
                            valueLabelDisplay="auto"
                        />
                    </div>

                    <div className="grayscale_slider">
                        <h4>GrayScale</h4>
                        <Slider
                            value={grayScale}
                            onChange={(e, data) => {
                                updateImage({grayscale: data});
                            }}
                            color="secondary"
                            valueLabelDisplay="auto"
                        />
                    </div>
                    <div className="sepia_slider">
                        <h4>Sepia</h4>
                        <Slider
                            value={sepia}
                            onChange={(e, data) => {
                                updateImage({sepia: data});
                            }}
                            color="secondary"
                            valueLabelDisplay="auto"
                        />
                    </div>

                </div>
                <div className="photoshop_main">
                    <div className="photoshop_image_container">
                        <div className="img_div">
                            <img id="photoshop_img" src={image} style={{ display: "none"}} />
                        </div>
                        {/* In the below div canvas will be rendered from ImageCanvas */}
                        
                        {isCropping ?
                            <div className="image_crop_container">
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={(croppedAreaPercentage, croppedAreaPixels) => {
                                        setCroppedArea(croppedAreaPixels);
                                    }}
                                />
                                <div className="crop_buttons">
                                    <button onClick={ cropImage }>Crop Image</button>
                                    <button onClick={() => setCropping(false)}>Cancel</button>
                                </div>
                            </div>
                            :
                            <div id="photoshop_canvas_container"> </div>
                        }
                    </div>
                    <div className="photoshop_button_container">
                        <div className="image_manipulaion_button">
                            <button onClick={() => updateImage({ invert: true })}> Invert Image </button>
                            <button onClick={() => setCropping(true)}> Crop Image </button>
                        </div>
                        <button onClick={sendImageToRoom}> Send Image </button>
                    </div>
                    {loading ?
                        <div className="flex_center_column">
                            <CircularProgress size={40} />
                            <h4>Sending Image</h4>
                        </div>
                        :
                        null
                    }
                </div>
        </div>
    </>
    )
}