import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import {CustomBox} from '../../components/minicomponents/CustomBox'

export function show_image_to_text_box() {
    $(".image_to_text_box").css({
        'visibility': 'visible',
    })
}

export function display_questions_box_items_at_start() {
    $("#questions_box").css({
        'align-items': 'initial',
        'justify-content':'initial'
    })
}

export function hide_image_to_text_box() {
    $(".image_to_text_box").css({
        'visibility': 'hidden'
    })
}

export function show_loading_screen() {
    $(".loading").css({
        'visibility': 'visible'
    })
}

export function hide_loading_screen() {
    $(".loading").fadeOut('fast');
}

export function show_progress_box() {
    $('.progress_box').css({
        'visibility':'visible'
    })
}

export function hide_progress_box() {
    $('.progress_box').css({
        'visibility': 'hidden'
    })
}

export function show_info(data = {title:'', content:'', color:'', time:0}) {
    let title = data.title;
    let content = data.content;
    let color = data.textColor ? data.textColor : data.color;
    let time = data.time;
    let body = document.getElementsByTagName('body')[0];
    let div = document.createElement('div');
    body.appendChild(div);

    ReactDOM.render(
        <CustomBox
            boxName="info_box"
            title={title}
            content={content}
            textColor={ color ? color : '' }
        />, div
    )
    setTimeout(() => {
        ReactDOM.unmountComponentAtNode(div);
        div.remove();
    }, time*1000);
}