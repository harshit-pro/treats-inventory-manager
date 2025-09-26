/**
 * Cloudinary upload helper for unsigned uploads.
 * Configure env vars in Vite:
 *  - VITE_CLOUDINARY_CLOUD_NAME
 *  - VITE_CLOUDINARY_UPLOAD_PRESET (unsigned preset)
 */

export interface CloudinaryUploadResult {
    asset_id: string;
    public_id: string;
    secure_url: string;
    url: string;
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary config missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Cloudinary upload failed: ${response.status} ${text}`);
    }
    return (await response.json()) as CloudinaryUploadResult;
}

/**
 * Resolve an image reference to a usable URL.
 * - If it's already a full http(s) URL, return as-is
 * - Otherwise treat it as a Cloudinary public_id and construct a delivery URL
 */
export function resolveImageUrl(imageRef?: string, width: number = 600, height: number = 600): string | undefined {
    if (!imageRef) return undefined;
    if (/^https?:\/\//i.test(imageRef)) return imageRef;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
    if (!cloudName) return undefined;
    // Basic transformation: auto format/quality and crop
    const transformation = `f_auto,q_auto,c_fill,w_${width},h_${height}`;
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${encodeURIComponent(imageRef)}`;
}


