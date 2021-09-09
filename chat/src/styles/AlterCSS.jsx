import $ from 'jquery'
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