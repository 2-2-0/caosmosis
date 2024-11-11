/*
    caosmosis.js - 3.0d
    by 220, jul 2024
    GPL-v3 license

    please give credit where it's due

    concept: Luis Clériga & Rossana Lara
    art: Rampa, DM and Zeta
    coding:  220
*/
let font_1;
let font_2;

let audio_source;
let sound_data = "";

let show_data = 1;
let sound_card;
let sound_bar;
let sound_alpha = 0;
let sound_fading = 0;

let playing = -1;
let current_track = 0;

let veil = 0;
let fading = 0;


let fps = 0;
let fr = 0;
let avg_fps = 0;

// PARAMETERS
let fade_speed = 5;
let fade_completed = false;

let p_attract_time = 12000;
let p_attract_fade = p_attract_time-2000;

let p_honor_time = 10000;
let p_honor_fade = p_honor_time-2000;

let p_execution_tail = 4000;

let p_credits_time = 12000;
let p_credits_fade = p_credits_time-2000;

let p_sound_card_time = 12000;

//let p_reset_delay

// REFS
let resolutions = [[10, 6], [20, 12], [40, 23], [80, 45], [100, 56]];
let strokes = [1, 1, 1, 2, 3, 6, 12, 16];

// SCREEN DARKEST LIGHTEST DIFFERENCE -MULTIPLY EXCLUSION 
// OVERLAY SOFT_LIGHT HARD_LIGHT DODGE -BURN ADD
let mask_types;

let debugging = false;
let debug_string;

let repix;

let sources = [];
let current_source = 0;


class ChaosStage {
    constructor () {
        this.location = createVideo (null);
        this.location.hide ();

        this.shape = createVideo (null);
        this.shape.hide ();

        this.program = new RepixProgram ();
    }
    load (location_filename, shape_filename) {
        this.loadLocation (location_filename);
        this.loadShape (shape_filename);
    }
    loadLocation (filename) {
        this.location.elt.src = filename;
    }
    loadShape (filename) {
        this.shape.elt.src = filename;
    }
    setProgram (screen_width, w, h, mosaic_image, grid_mask_type, draw_source, draw_mask_type) {
        this.program.create (screen_width, w, h, mosaic_image, grid_mask_type, draw_source, draw_mask_type);
    }
    loop () {
        this.location.loop ();
        this.shape.loop ();
    }
    stop () {
        this.location.stop ();
        this.shape.stop ();
    }
}

function setup () {
    createCanvas (displayWidth, displayHeight, P2D);

    font_1 = loadFont ('assets/fonts/Silkscreen-Regular.ttf');
    font_2 = loadFont ('assets/fonts/Cantarell-Regular.otf');

    
    audio_source = createAudio ();
    audio_source.hide ();

    audio_source.elt.src = audio_path+audio_file;

    sound_card = createGraphics (displayWidth, displayHeight, P2D);
    sound_bar = createGraphics (displayWidth, displayHeight, P2D);

    mask_types = [SCREEN, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, OVERLAY, SOFT_LIGHT, HARD_LIGHT, DODGE, ADD];

    sources [0] = new ChaosStage ();
    sources [1] = new ChaosStage ();

    repix = new Repixelator (displayWidth, displayHeight);

    prepareSource (0);
    
    frameRate (60);
    setInterval (avgFPS, 1000);
    
    textFont (font_2);
    
    noSmooth ();
    rectMode (CORNER);

}
function draw () {
    background (0);
    noStroke ();
    fill (255);
    textAlign (CENTER, CENTER);
    textFont (font_1);

    push ();
    switch (playing) {
        case -1:
            // ATTRACT
            textSize (52);
            text (info_title, displayWidth/2, displayHeight/2);
            break;
        case 0:
            // INTRO
            textSize (52);
            text (unceded_lands, displayWidth/2, displayHeight/2);
            break;
        case 1:
            push ();
            // EXECUTION
            repix.render (sources [current_source].location, sources [current_source].shape);
            repix.draw (sources [current_source].location, sources [current_source].shape);
            
            // Artist data
            if (show_data>0) {
                if (sound_fading!=0) {
                    sound_alpha+= sound_fading;
                    if (sound_alpha<1) {
                        sound_fading = 0;
                        sound_alpha = 0;
                    }
                    if (veil>sound_alpha) {
                        sound_fading = 0;
                        sound_alpha = 255;
                    }
                }
                tint (255, sound_alpha);
                if (show_data==1) image (sound_card, 0, 0, displayWidth, displayHeight);
                else image (sound_bar, 0, 0, displayWidth, displayHeight);
                noTint ();
            }
            pop ();
            break;
        case 2:
            // CREDITS
            textSize (32);
            text (credits_1, displayWidth/2, displayHeight/2);
            break;
        case 3:
            // ARTISTS
            textSize (32);
            text (credits_2a+credits_2b, displayWidth/2, displayHeight/2);
            break;
        }
    pop ();
        
    if (fading!=0) {
        veil+= fading;
        if (veil<1) {
            fading = 0;
            veil = 0;
        }
        if (veil>254) {
            fading = 0;
            veil = 255;
        }
    }

    fill (0, veil);
    rect (0, 0, displayWidth, displayHeight);

    fr+= frameRate ();
    fr/= 2;
    if (debugging) debugInfo ();
}
function windowResized () {
    //resizeCanvas (windowWidth, windowHeight);
    resizeCanvas (displayWidth, displayHeight);
}
function avgFPS () {
    avg_fps = fr;
    fr = 0;
}
function debugInfo () {
    // DEBUG previews
    for (let i=0; i<sources.length; i++) {
        image (sources [i].location, i*80, 0, 80, 45);
        image (sources [i].shape, i*80, 45, 80, 45);
    }

    // DEBUG string
    debug_string = "[DEV-info]\n";
    /*
    debug_string+= "res: "+repix.screen.width+"/"+repix.screen.height+"\n";
    debug_string+= "pixel_size: "+repix.pixel_size+"\n";
    debug_string+= "stroke: "+repix.stroke+"\n\n";

    debug_string+= "mosaic_image: "+repix.program.mosaic_image+"\n";
    debug_string+= "grid_mask_type: "+repix.program.grid_mask_type+"\n";

    debug_string+= "\nLayer-2:\n";
    debug_string+= "draw_source: "+repix.program.draw_source+"\n";
    debug_string+= "draw_mask_type: "+repix.program.draw_mask_type+"\n";
    */
    debug_string+= "current_source: "+current_source;
    debug_string+= "\nframeRate: "+frameRate ();
    debug_string+= "\navg_FPS: "+avg_fps;
    debug_string+= "\nc_track: "+current_track;

    debug_string+= "\n\nHELP:\n[space] to change visuals";
    debug_string+= "\n[d] to turn on/off this info";

    fill (255);
    stroke (0);
    strokeWeight (5);
    textSize (16);
    textAlign (LEFT, TOP);
    text (debug_string, 20, 160);
}
function fadeOut () {
    fading = fade_speed;
}
function fadeIn () {
    fading = -fade_speed;
}
function fadeCardOut () {
    sound_fading = -fade_speed;
}
function fadeCardIn () {
    sound_fading = fade_speed;
}
function createProgram (program) {
    let res_index = Math.floor (Math.random ()*resolutions.length);
    let res = resolutions [res_index];

    let mosaic_image = false;
    if (res_index<2) {
        if (Math.random ()*1000>750) mosaic_image = true;
    }

    let mask_index = Math.floor (Math.random ()*mask_types.length);
    let grid_mask_type = mask_types [mask_index]; 

    let draw_source = 0;
    let draw_mask_type = null;
    if (res_index<3 || Math.random ()*1000>650) {
        if (Math.random ()*1000>500) draw_source = 1;
        else draw_source = 2;

        mask_index = Math.floor (Math.random ()*mask_types.length);
        draw_mask_type = mask_types [mask_index];
    }

    program.create (displayWidth, res [0], res [1], mosaic_image, grid_mask_type, draw_source, draw_mask_type);
}
function prepareSource (source_index) {
    let source = sources [source_index];

    // get location
    let index;
    
    index = Math.floor (Math.random ()*video_locations.length);
    let file_location = video_locations_path+video_locations [index];

    // get shape
    index = Math.floor (Math.random ()*video_shapes.length);
    let file_shape = video_shapes_path+video_shapes [index];

    source.load (file_location, file_shape);
    createProgram (source.program);
    //source.loop ();
}
function launchSource (source_index) {
    current_source = source_index;
    let source = sources [source_index];

    source.loop ();
    repix.useProgram (source.program);
}
function getTrackData () {
    if (current_track<track_names.length) {
        sound_data = track_names [current_track];
        sound_card.clear ();
        sound_card.fill (24, 248);
        sound_card.noStroke ();
        sound_card.rect (displayWidth/3, 0, (displayWidth/3)*2, displayHeight);

        sound_card.fill (255);
        sound_card.stroke (0);
        sound_card.strokeWeight (7);

        sound_card.textSize (82);
        sound_card.textFont (font_2);
        sound_card.textAlign (LEFT, BOTTOM);
        sound_card.text (sound_data, (displayWidth/3)+160, (displayHeight/5)*4);


        sound_bar.clear ();
        sound_bar.fill (24, 232);
        sound_bar.noStroke ();
        sound_bar.rect (0, (displayHeight/5)*4, displayWidth, (displayHeight/12));

        sound_bar.fill (255);
        sound_bar.stroke (0);
        sound_bar.strokeWeight (7);

        let bar_text = sound_data.replace(/\n|\r/g, " ");
        sound_bar.textSize (48);
        sound_bar.textFont (font_2);
        sound_bar.textAlign (LEFT, TOP);
        sound_bar.text (bar_text, 80, ((displayHeight/5)*4)+16);

        // show first card
        showCard ();
        setTimeout (showBanner, (track_intervals [current_track]/2)*1000);

        // set timeout with track_interval
        setTimeout (getTrackData, track_intervals [current_track]*1000);
        current_track++;
        return;
    }

    // finito!!
    fadeOut ();
    audio_source.stop ();
    sound_data = "";

    setTimeout (showCredits, p_execution_tail);
    //cursor ();
}
function showCard () {
    show_data = 1;
    fadeCardIn ();
    setTimeout (fadeCardOut, p_sound_card_time);
}
function showBanner () {
    show_data = 2;
    fadeCardIn ();
    setTimeout (fadeCardOut, p_sound_card_time);
}
function startShow () {
    fullscreen (true);
    noCursor ();
    sound_alpha = 0;

    fadeOut ();
    setTimeout (honor, 3000);
}
function honor () {
    fadeIn ();

    playing = 0;
    setTimeout (execute, p_honor_time);
    setTimeout (fadeOut, p_honor_fade);
}
function execute () {
    current_track = 0;
    getTrackData ();

    audio_source.play ();
    current_source = 1;
    changeSource ();

    playing = 1;
    fadeIn ();
}
function showCredits () {
    playing = 2;
    fadeIn ();

    setTimeout (showArtists, p_credits_time);
    setTimeout (fadeOut, p_credits_fade);
}
function showArtists () {
    playing = 3;
    fadeIn ();

    setTimeout (attract, p_credits_time);
    setTimeout (fadeOut, p_credits_fade);
}
function attract () {
    playing = -1;

    fadeIn ();
    setTimeout (honor, p_attract_time);
    setTimeout (fadeOut, p_attract_fade);
}
function changeSource () {
    launchSource (abs (current_source-1));
    prepareSource (abs (current_source-1));

    setTimeout (changeSource, random ([40000, 60000, 90000, 70000]));
}

function mousePressed () {
    if (playing>=0) return;
    
    startShow ();
}
function keyPressed () {
    switch (key) {
        case ' ':
            if (playing>=0) {
                launchSource (abs (current_source-1));
                prepareSource (abs (current_source-1));
            }
            else startShow ();
            break;
        case 'd':
            debugging = !debugging;
            break;
        case 's':
            fullscreen (true);
            noCursor ();
            execute ();
            break;
        case 'c':
            fullscreen (true);
            noCursor ();
            showCredits ();
            break;
    }
}
// Just a reminder: ffmpeg -i in.mp4 -c:v libx264 -pix_fmt yuv420p -vf scale=1920:1080 -b:v 4000k out.mp4