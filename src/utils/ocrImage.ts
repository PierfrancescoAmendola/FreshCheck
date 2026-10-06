// Builds enhanced variants of a date photo so OCR can read small, faint,
// embossed or light-on-grey print. Pure image work, no network.
import { FilterMode, ImageFormat, MipmapMode, Skia, SkImage } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';

export interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Region of the screen to keep, mapped onto the photo like the camera's "cover" preview
export interface ScreenRegion {
    screenWidth: number;
    screenHeight: number;
    rect: CropRect;
}

const R = 0.299;
const G = 0.587;
const B = 0.114;

// Grayscale with contrast around mid grey; negative contrast also inverts
const grayContrast = (c: number): number[] => {
    const t = 0.5 * (1 - c);
    return [
        c * R, c * G, c * B, 0, t,
        c * R, c * G, c * B, 0, t,
        c * R, c * G, c * B, 0, t,
        0, 0, 0, 1, 0,
    ];
};

// Order matters: gentle first, then inverted (white text on grey), then harsh for faint embossing
const VARIANTS = [grayContrast(1.8), grayContrast(-1.8), grayContrast(3)];

const MAX_SIDE = 2400;

const cropFor = (img: SkImage, region?: ScreenRegion): CropRect => {
    const iw = img.width();
    const ih = img.height();
    const full = { x: 0, y: 0, width: iw, height: ih };
    if (!region) return full;
    const { screenWidth: W, screenHeight: H, rect } = region;
    // Photo not rotated like the screen: mapping is unreliable, keep everything
    if (iw > ih !== W > H) return full;
    const s = Math.max(W / iw, H / ih);
    const ox = (iw * s - W) / 2;
    const oy = (ih * s - H) / 2;
    const x = Math.max(0, (rect.x + ox) / s);
    const y = Math.max(0, (rect.y + oy) / s);
    const width = Math.min(iw - x, rect.width / s);
    const height = Math.min(ih - y, rect.height / s);
    return width > 32 && height > 32 ? { x, y, width, height } : full;
};

const render = (img: SkImage, src: CropRect, matrix: number[]): string | null => {
    // Upscale small crops so tiny print gets more pixels, cap big ones to save memory
    const scale = Math.min(2, MAX_SIDE / Math.max(src.width, src.height));
    const w = Math.round(src.width * scale);
    const h = Math.round(src.height * scale);
    const surface = Skia.Surface.Make(w, h);
    if (!surface) return null;
    const paint = Skia.Paint();
    paint.setColorFilter(Skia.ColorFilter.MakeMatrix(matrix));
    surface.getCanvas().drawImageRectOptions(
        img,
        Skia.XYWHRect(src.x, src.y, src.width, src.height),
        Skia.XYWHRect(0, 0, w, h),
        FilterMode.Linear,
        MipmapMode.Linear,
        paint,
    );
    surface.flush();
    const bytes = surface.makeImageSnapshot().encodeToBytes(ImageFormat.JPEG, 95);
    const file = new File(Paths.cache, `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
    file.write(bytes);
    return file.uri;
};

// Yields the URIs of enhanced variants one at a time, so the caller can stop early
export async function* enhancedVariants(uri: string, region?: ScreenRegion): AsyncGenerator<string> {
    const data = await Skia.Data.fromURI(uri);
    const img = Skia.Image.MakeImageFromEncoded(data);
    if (!img) return;
    const src = cropFor(img, region);
    for (const matrix of VARIANTS) {
        const out = render(img, src, matrix);
        if (out) yield out;
    }
}

export const deleteFile = (uri: string) => {
    try {
        new File(uri).delete();
    } catch {
        // Cache files are cleaned by the OS anyway
    }
};
