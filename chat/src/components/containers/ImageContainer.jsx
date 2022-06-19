import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import {imageStyles} from '../../styles/js/ChatStyles'
import { withStyles } from "@material-ui/core/styles";

export class ImageContainer extends Component {

    message_api = this.props.message_api;
    id  = this.props.id;
    src = this.props.src;

    state = {
        isScaled: false,
        content: this.props.content
    }

    constructor(props) {
        super(props);
        this.image_container = $("#image_container_" + this.id);
        this.handle_click = this.handle_click.bind(this);
        this.handle_append_answer = this.handle_append_answer.bind(this);
    }

    show_scaled_image_view(main) {
        let image =
            <>
                <div className="image_button_container">
                    <button className="image_buttons" onClick={this.handle_append_answer}>
                        Append Answer
                    </button>
                    <button className="image_buttons" onClick={this.handle_click}>
                        Close Image
                    </button>
                </div>
                <img
                    id={"scaled_image_" + this.id}
                    src={this.src}
                />
            </>
        var div = document.createElement("div");
        div.id = "scaled_image_container_" + this.id;
        div.className = "show_scaled_image";
        $('body').append(div);
        this.setState({
            scaledContainer:div
        })
        ReactDOM.render(image, div);
        this.setState({
            isScaled: true
        })
    }

    remove_scaled_image_view(main) {
        var container = document.getElementById("scaled_image_container_" + this.id);
        container.remove();
        this.setState({
            isScaled: false
        })
    }

    handle_click(event) {
        var main = document.getElementById('QuestionViewContainer');
        if (this.state.isScaled) {
            this.setState({
                isScaled: false
            })
            this.remove_scaled_image_view(main);
        }
        else {
            this.show_scaled_image_view(main);
        }
    }

    handle_append_answer(event) {
        var value = window.prompt("Enter Answer :");
        if (value == null || value == "") return;
        else {
            var data = {
                'id': "image_"+this.id,
                'message': value,
                'username': this.message_api.get_username(),
                'roomname':this.message_api.get_roomname()
            }
            
            this.message_api.send_message_to_room('image_answer', data);
            this.remove_scaled_image_view();
        }
    }

    render() {
        const { classes } = this.props;
        let content = this.state.content;
        return (
            <>
                {/* <img id={"image_" + this.id}
                    className="show_image"
                    src={this.src}
                    onClick={this.handle_click}
                /> */}
                <Card title={this.message_api.get_username()} className={classes.root}>
                    <CardMedia src={ this.src} >
                        <Paper variant="outlined">
                            <img
                                id={ "image_"+this.id }
                                src={this.src}
                                className="show_image"
                                onClick={this.handle_click}
                            />
                        </Paper>
                    </CardMedia>
                    {content != null ?
                        <CardContent>
                            {content}
                        </CardContent>
                        :
                        null
                    }
                    
                </Card>
            </>
        )
    }
}
// export default withStyles(imageStyles)(ImageContainer);
export default withStyles(imageStyles)(ImageContainer);