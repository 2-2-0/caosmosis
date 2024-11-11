// Repixelator r1.0d
// by 220 | GPL-v3 license
// please give credit where it's due
// 2-2-0.online

class RepixProgram {
    constructor () {
        this.width = 1;
        this.height = 1;
        this.pixel_size = 1;

        this.mosaic_image = false;

        this.grid_mask_type = null;

        this.draw_source = false;
        this.draw_mask_type = null;
    }
    create (screen_width, w, h, mosaic_image, grid_mask_type, draw_source, draw_mask_type) {
        // bool mosaic_image - uses source image as mosaics - ideal for bigger pixels!
        // maskType grid_mask_type - gets blended in the work res with the source
        // int draw_source - uses either video_location (1) or video_shape (2) to mask splat
        // maskType core_mask_type - blends the end product with hi res source

        this.width = w;
        this.height = h;
        this.pixel_size = this.width / screen_width;

        this.mosaic_image = mosaic_image;

        this.grid_mask_type = grid_mask_type;

        this.draw_source = draw_source;
        this.draw_mask_type = draw_mask_type;
    }
}

class Repixelator {
    // Repixelator by 220 | GPL-v3 license
    // please give credit where it's due
    // 2-2-0.online
    constructor (output_width, output_height) {
        console.log (displayWidth);
        console.log (displayHeight);

        this.program = null;

        this.screen = null;
        this.mask = null;

        this.splat = createGraphics (output_width, output_height, P2D);

        this.pixel_size = 1;
        this.stroke = 1;

        this.x = 0;
        this.y = 0;

        this.f_x = 0;
        this.f_y = 0;

        this.shake_range_x = 0;
        this.shake_range_y = 0;

        colorMode (HSL, 255);
    }
    useProgram (new_program) {
        this.program = new_program;

        this.setScreens (this.program.width, this.program.height);

    }
    setScreens (screen_width, screen_height) {
        this.screen = createGraphics (screen_width, screen_height, P2D);
        this.screen.attribute ('willReadFrequently', 'true');
        this.screen.noSmooth ();
        this.screen.colorMode (HSB, 255);
        
        this.mask = createGraphics (screen_width, screen_height, P2D);
        this.mask.noSmooth ();
        this.mask.colorMode (HSB, 255);

        this.pixel_size = this.splat.width / screen_width;
    }
    
    beamImage (source_image) {
        this.screen.image (source_image, 0, 0, this.screen.width, this.screen.height);
    }
    beamMask (source_image) {
        this.mask.image (source_image, 0, 0, this.mask.width, this.mask.height);
        this.screen.blend (this.mask, 0, 0, this.mask.width, this.mask.height, 0, 0, this.screen.width, this.screen.height, this.program.grid_mask_type);
    }
    
    preRender () {
        this.splat.background (0);
        this.splat.strokeWeight (this.stroke);
        this.splat.stroke (0);
        this.splat.noSmooth ();
    }
    renderImage () {
        this.screen.loadPixels ();
        for (this.y=0; this.y<this.screen.height; this.y++) {
            for (this.x=0; this.x<this.screen.width; this.x++) {
                this.c = this.screen.get (this.x, this.y);
                this.splat.fill (this.c);
            
                this.f_x = (this.x * this.pixel_size);
                this.f_y = (this.y * this.pixel_size);

                if (this.shake_range_x>0) {
                    this.f_x+= Math.floor (Math.random ()*this.shake_range_x);
                }
                if (this.shake_range_y>0) {
                    this.f_y+= Math.floor (Math.random ()*this.shake_range_y);
                }
                this.splat.image (this.screen, this.f_x, this.f_y, this.pixel_size, this.pixel_size);
            }
        }
    }
    renderMegaPixel () {
        this.screen.loadPixels ();
        for (this.y=0; this.y<this.screen.height; this.y++) {
            for (this.x=0; this.x<this.screen.width; this.x++) {
                this.c = this.screen.get (this.x, this.y);
                this.splat.fill (this.c);
            
                this.f_x = (this.x * this.pixel_size);
                this.f_y = (this.y * this.pixel_size);

                if (this.shake_range_x>0) {
                    this.f_x+= Math.floor (Math.random ()*this.shake_range_x);
                }
                if (this.shake_range_y>0) {
                    this.f_y+= Math.floor (Math.random ()*this.shake_range_y);
                }
                this.splat.rect (this.f_x, this.f_y, this.pixel_size, this.pixel_size);
            }
        }
    }
    render (video_location, video_shape) {
        this.beamImage (video_location);
        if (video_shape!=null) this.beamMask (video_shape);

        this.preRender ();

        if (this.program.mosaic_image) this.renderImage ();
        else this.renderMegaPixel ();
    }
    draw (video_location, video_shape) {
        image (this.splat, 0, 0, displayWidth, displayHeight);
        switch (this.program.draw_source) {
            case 1:
                blend (video_location, 0, 0, video_location.width, video_location.height, 0, 0, displayWidth, displayHeight, this.program.draw_mask_type);
                break;
            case 2:
                blend (video_shape, 0, 0, video_shape.width, video_shape.height, 0, 0, displayWidth, displayHeight, this.program.draw_mask_type);
                break;
        }
    }
}
