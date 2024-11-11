/*
    caosmosis.js
    by 220, jul 2024
    GPL-v3 license

    please give credit where it's due

    concept: Luis Clériga
    coding:  220
*/
let font_1;
let font_2;
let video_source;
let splat;
let playing = false;
let current_track = 0;

let index;
let file;

let audio_source;

let sound_data = "";
let visual_artist = "";

function preload () {
}
function setup () {
    let c = createCanvas (windowWidth, windowHeight, P2D);

    font_1 = loadFont ('assets/fonts/Silkscreen-Regular.ttf');
    font_2 = loadFont ('assets/fonts/Cantarell-Regular.otf');

    noSmooth ();
    textFont (font_2);
    textSize (52);
    
    splat = createGraphics (80, 45, P2D);
    splat.noSmooth ();
    splat.textFont (font_1);
    splat.textSize (8);
    
    audio_source = createAudio (null);
    audio_source.hide ();
    
    audio_source.elt.src = "assets/audio/caosmosis-2.mp3";

    video_source = createVideo (null);
    video_source.hide ();

    pb = new PixelBeamer ();
}
function draw () {
    background (0);
    
    if (playing) {
        splat.background (0);
        splat.image (video_source, 0, 0, splat.width, splat.height);
        splat.fill (255);
        splat.noSmooth ();
        
        //pb.draw (splat, 960, 540);
        pb.draw (splat, 840, 525);
        
        push ();
        fill (255);
        stroke (0);
        strokeWeight (6);
        textAlign (LEFT, BOTTOM);
        text (sound_data, 20, displayHeight-20);
        textAlign (RIGHT, BOTTOM);
        textFont (font_2);
        text (visual_artist, displayWidth-20, displayHeight-20);
        pop ();
    } else {
        push ();
        textAlign (CENTER, BOTTOM);
        noStroke ();
        fill (255);
        textFont (font_1);
        text ("CAOSMOSIS 2.0", windowWidth/2, windowHeight/2);
        pop ();
    }
}
function windowResized () {
    resizeCanvas (windowWidth, windowHeight);
}
function getNewVideo () {
    index = Math.floor (Math.random ()*file_names.length);
    file = file_names [index];
    visual_artist = visual_artists [index];

    video_source.elt.src = files_path+file;
    video_source.loop ();
}
function getTrackData () {
    if (current_track<track_names.length) {
        sound_data = track_names [current_track];
        // set timeout with track_interval
        setTimeout (getTrackData, track_intervals [current_track]*1000);
        current_track++;
        return;
    }

    // finito!!
    sound_data = "";
    visual_artist = "";
    console.log ("fini!");
    playing = false;
    cursor ();
}

function newStage () {
    pb.setImage (splat);

    getNewVideo ();
    video_source.speed = random ([0.7, 1.0, 1.2]);

    if (random (1000)>600) noStroke ();
    else {
        stroke (0);
        strokeWeight (random ([1, 1, 6, 10, 12, 15]));
    }

    pb.pixel_size = random ([24, 24, 24, 36]);

    if (random (1000)>850) {
        pb.shake_x = random ([0, 1, 4]);
        pb.shake_y = random ([0, 1, 4]);
    } else {
        pb.shake_x = 0;
        pb.shake_y = 0;
    }
}
function changeStage () {
    newStage ();
    setTimeout (changeStage, random ([40000, 55000, 70000]));
}
function mousePressed () {
    if (playing) return;
    
    fullscreen (true);
    noCursor ();

    current_track = 0;
    playing = true;
    audio_source.play ();

    getTrackData ();
    changeStage ();
}
class PixelBeamer {
    // Pixel Beamer by 220 | GPL-v3 license
    // please give credit where it's due
    // 2-2-0.online

    constructor () {
        this.pixel_size = 24;
        this.cursor_x = 0;
        this.cursor_y = 0;
        this.cursor_width = 0;
        this.height = 0;

        this.center_x = 0;
        this.center_y = 0;

        this.x = 0;
        this.y = 0;

        this.f_x = 0;
        this.f_y = 0;

        this.x_scaled = 0;
        this.xh_scaled = 0;
        this.y_scaled = 0;
        this.yh_scaled = 0;

        // FX params
        this.shake_x = 0;
        this.shake_y = 0;
    }
    setImage (source_image) {
        this.cursor_x = 0;
        this.cursor_y = 0;
        this.cursor_width = source_image.width;
        this.cursor_height = source_image.height;
        
        // FX moving stuff
        this.x_scaled = this.cursor_width*this.pixel_size;
        this.xh_scaled = this.x_scaled/2;
        
        this.y_scaled = this.cursor_height*this.pixel_size;
        this.yh_scaled = this.y_scaled/2;
    }
    draw (source_image, c_x, c_y) {
        
        source_image.loadPixels ();
        for (this.y=0; this.y<this.cursor_height; this.y++) {
            for (this.x=0; this.x<this.cursor_width; this.x++) {
                this.c = source_image.get (this.x, this.y);
                fill (this.c);

                this.f_x = c_x-this.xh_scaled+(this.x*this.pixel_size);
                this.f_y = c_y-this.yh_scaled+(this.y*this.pixel_size);

                this.f_x+= random (-this.shake_x, this.shake_x);
                this.f_y+= random (-this.shake_y, this.shake_y);
                
                rect (this.f_x, this.f_y, this.pixel_size, this.pixel_size);
            }
        }
    }
}
