/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";

// --- --- --- App State --- --- ---
let uploadedImage: {
    base64: string;
    mimeType: string;
} | null = null;

// --- --- --- DOM Elements --- --- ---
const imageUploadInput = document.getElementById('image-upload') as HTMLInputElement;
const uploadArea = document.getElementById('upload-area');
const originalImagePreview = document.getElementById('original-image-preview');
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const generatedImageContainer = document.getElementById('generated-image-container');
const downloadBtn = document.getElementById('download-btn') as HTMLAnchorElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const backgroundStyleSelectorContainer = document.getElementById('background-style-selector-container');
const hairStyleSelectorContainer = document.getElementById('hair-style-selector-container');
const clothingStyleSelectorContainer = document.getElementById('clothing-style-selector-container');
const faceShapeSelectorContainer = document.getElementById('face-shape-selector-container');
const expressionSelectorContainer = document.getElementById('expression-selector-container');


// --- --- --- Gemini AI Client --- --- ---
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

// --- --- --- Functions --- --- ---

/**
 * Converts a File object to a base64 encoded string.
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Handles the file upload event.
 */
async function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file && originalImagePreview && uploadArea && backgroundStyleSelectorContainer && hairStyleSelectorContainer && clothingStyleSelectorContainer && faceShapeSelectorContainer && expressionSelectorContainer && clearBtn) {
        try {
            const base64 = await fileToBase64(file);
            uploadedImage = {
                base64,
                mimeType: file.type,
            };

            // Display the preview
            originalImagePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = `data:${file.type};base64,${base64}`;
            img.alt = 'Uploaded image preview';
            originalImagePreview.appendChild(img);

            // Hide the upload box and show other controls
            uploadArea.style.display = 'none';
            backgroundStyleSelectorContainer.style.display = 'block';
            hairStyleSelectorContainer.style.display = 'block';
            clothingStyleSelectorContainer.style.display = 'block';
            faceShapeSelectorContainer.style.display = 'block';
            expressionSelectorContainer.style.display = 'block';
            clearBtn.style.display = 'inline-block';

            // Enable the generate button
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Error reading file:', error);
            originalImagePreview.innerHTML = '<p style="color: red;">Error loading image preview.</p>';
            generateBtn.disabled = true;
        }
    }
}

/**
 * Clears the uploaded image and resets the UI to its initial state.
 */
function clearUpload() {
    uploadedImage = null;
    if (imageUploadInput) {
        imageUploadInput.value = ''; // Allow re-uploading the same file
    }
    if (originalImagePreview) {
        originalImagePreview.innerHTML = '';
    }
    if (uploadArea) {
        uploadArea.style.display = 'flex';
    }
    if (backgroundStyleSelectorContainer) {
        backgroundStyleSelectorContainer.style.display = 'none';
    }
    if (hairStyleSelectorContainer) {
        hairStyleSelectorContainer.style.display = 'none';
    }
    if (clothingStyleSelectorContainer) {
        clothingStyleSelectorContainer.style.display = 'none';
    }
    if (faceShapeSelectorContainer) {
        faceShapeSelectorContainer.style.display = 'none';
    }
    if (expressionSelectorContainer) {
        expressionSelectorContainer.style.display = 'none';
    }
    if (generatedImageContainer) {
        generatedImageContainer.innerHTML = '<p class="placeholder-text">Your generated image will appear here.</p>';
    }
    if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    if (generateBtn) {
        generateBtn.disabled = true;
    }
    // Reset radio buttons to default
    const defaultBackground = document.querySelector('input[name="background-style"][value="modern office"]') as HTMLInputElement;
    if (defaultBackground) {
        defaultBackground.checked = true;
    }
    const defaultHair = document.querySelector('input[name="hair-style"][value="none"]') as HTMLInputElement;
    if (defaultHair) {
        defaultHair.checked = true;
    }
    const defaultClothing = document.querySelector('input[name="clothing-style"][value="professional blouse"]') as HTMLInputElement;
    if (defaultClothing) {
        defaultClothing.checked = true;
    }
    const defaultFaceShape = document.querySelector('input[name="face-shape"][value="none"]') as HTMLInputElement;
    if (defaultFaceShape) {
        defaultFaceShape.checked = true;
    }
    const defaultExpression = document.querySelector('input[name="expression"][value="none"]') as HTMLInputElement;
    if (defaultExpression) {
        defaultExpression.checked = true;
    }
}


/**
 * Shows a loading indicator in the output container.
 */
function showLoading() {
    if (generatedImageContainer) {
        generatedImageContainer.innerHTML = '<div class="loader"></div><p>Generating, this may take a moment...</p>';
    }
    generateBtn.disabled = true;
    clearBtn.disabled = true;
    downloadBtn.style.display = 'none';
}

/**
 * Shows an error message in the output container.
 */
function showError(message: string) {
    if (generatedImageContainer) {
        generatedImageContainer.innerHTML = `<p style="color: red;">${message}</p>`;
    }
    generateBtn.disabled = !uploadedImage;
    clearBtn.disabled = !uploadedImage;
}

/**
 * Calls the Gemini API to generate the professional headshot.
 */
async function generateHeadshot() {
    if (!uploadedImage) {
        showError('Please upload an image first.');
        return;
    }
    
    const selectedBackgroundStyle = (document.querySelector('input[name="background-style"]:checked') as HTMLInputElement)?.value || 'modern office';
    const selectedHairStyle = (document.querySelector('input[name="hair-style"]:checked') as HTMLInputElement)?.value || 'none';
    const selectedClothingStyle = (document.querySelector('input[name="clothing-style"]:checked') as HTMLInputElement)?.value || 'professional blouse';
    const selectedFaceShape = (document.querySelector('input[name="face-shape"]:checked') as HTMLInputElement)?.value || 'none';
    const selectedExpression = (document.querySelector('input[name="expression"]:checked') as HTMLInputElement)?.value || 'none';

    showLoading();

    try {
        let prompt = `Transform this photo into a professional corporate headshot suitable for a LinkedIn profile. Change the person's attire to a ${selectedClothingStyle}. The background should be a ${selectedBackgroundStyle} setting, clean, neutral, and slightly out-of-focus. The lighting should be flattering and professional. Retain the person's core facial features.`;
        
        if (selectedExpression !== 'none') {
            prompt += ` ${selectedExpression}.`;
        } else {
            prompt += ' Keep the original expression.';
        }

        if (selectedHairStyle !== 'none') {
            prompt += ` Additionally, ${selectedHairStyle}.`;
        }
        
        if (selectedFaceShape !== 'none') {
            prompt += ` Additionally, ${selectedFaceShape}.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: uploadedImage.base64,
                            mimeType: uploadedImage.mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart?.inlineData && generatedImageContainer) {
            const base64ImageData = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mimeType};base64,${base64ImageData}`;
            
            generatedImageContainer.innerHTML = '';
            const img = new Image();
            img.src = imageUrl;
            img.alt = 'Generated professional headshot';
            generatedImageContainer.appendChild(img);

            // Show download button
            downloadBtn.href = imageUrl;
            downloadBtn.style.display = 'inline-block';
        } else {
            showError('Could not generate an image. The model may have refused the request.');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        showError('An error occurred while generating the image. Please check the console.');
    } finally {
        generateBtn.disabled = !uploadedImage;
        clearBtn.disabled = !uploadedImage;
    }
}


// --- --- --- Event Listeners --- --- ---
imageUploadInput?.addEventListener('change', handleImageUpload);
generateBtn?.addEventListener('click', generateHeadshot);
clearBtn?.addEventListener('click', clearUpload);