import {PNG, PNGWithMetadata} from "pngjs";
import {readFileSync, writeFileSync} from "fs";
import clipboardController from "./clipboardController";

class ImageController {
	image: PNGWithMetadata;
	pixelDelta: number;
	whitePixelValue: number;
	outBuffer: Buffer;

	constructor(pixelDelta: number) {
		this.pixelDelta = pixelDelta;
		this.whitePixelValue = 213;
	}
/*
	async loadImage(url: string){
		const png = readFileSync(url);
		console.log(url);
		this.image = PNG.sync.read(png);
	}

 */

	async processImage(buffer: Buffer): Promise<Buffer>{
		this.image = PNG.sync.read(buffer);
		this.invertBlackPixels();
		return this.outBuffer;
	}

	invertBlackPixels() {
		for (let y = 0; y < this.image.height; y++) {
			for (let x = 0; x < this.image.width; x++) {
				const idx = (this.image.width * y + x) << 2;
				if(this.isBlackPixel(x, y, idx)){
					this.setWhitePixel(x, y, idx);
				}
			}
		}
		this.outBuffer = PNG.sync.write(this.image);
		writeFileSync("/Users/lorenzovaccarini/out.png", this.outBuffer)
		console.log("Image processed");
	}

	private isBlackPixel(x: number, y: number, idx: number): boolean {
		const r = this.image.data[idx];
		const g = this.image.data[idx + 1];
		const b = this.image.data[idx + 2];

		return r < this.pixelDelta && g < this.pixelDelta && b < this.pixelDelta;
	}

	private setWhitePixel(x: number, y: number, idx: number) {
		this.image.data[idx] = this.whitePixelValue;
		this.image.data[idx + 1] = this.whitePixelValue;
		this.image.data[idx + 2] = this.whitePixelValue;
	}

}

const imageController = new ImageController(140);
export default imageController;
