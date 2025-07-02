# 📹 Image-to-Video Helper Workflow

Easily turn a still image into a cinematic video animation using AI. This example workflow is perfect for creators, artists, and developers who want to:

- Generate a detailed video prompt from an input image using GPT-4o Vision
- Automatically create a video animation with RunwayML's Gen-2 model
- Retain the hand-drawn aesthetic and vibrant colors of the original image
- Save the resulting video locally for further use

## What This Workflow Does

1. **Describe the Image**  
   Uses OpenAI Vision (GPT-4o) to analyze your image and generate a cinematic video prompt tailored to the content and style of the input.

2. **Generate Video from Image**  
   Sends the prompt and input image to RunwayML's Gen-2 image-to-video API, producing a short animation that matches the described mood and style.

3. **Save Output**  
   Downloads the generated video to a local directory for easy access and sharing.

## Commands and Models Used

- Image Description: OpenAI Vision (`gpt-4o`)
- Video Generation: RunwayML Gen-2 (`gen4_turbo`)

## `index.js` Example

See [`index.ts`](./index.ts) for the full workflow implementation.

```ts
[
  {
    type: "series",
    command: "describeImages",
    params: (context: any) => ({
      id: "openai-vision",
      services: { vision: "openai-vision" },
      params: {
        images: [context.image],
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content:
                `You are a master anime filmmaker and visual director.` +
                `Based on the image, write a prompt (less than 900 characters) to generate a video animation. ` +
                `The animation should feature subtle ambient motion such as soft lighting shifts, gentle parallax for depth, and calm environmental movement. ` +
                `The result should evoke a peaceful, cinematic, and nostalgic atmosphere. ` +
                `The scene must retain the hand-drawn aesthetic and vibrant colors of the original image. ` +
                `The prompt should be clean, detailed, and suitable for an image-to-video AI model.`,
            },
          ],
        },
      },
    }),
    returnsAlias: { description: "prompt" },
  },
  {
    type: "series",
    command: "generateVideoFromImage",
    params: (context: any) => ({
      services: { image2videoConverter: "runway-ml" },
      params: {
        image: context.image,
        prompt: context.prompt[0],
        outputDir: path.resolve(__dirname, "../../tmp"),
        opts: {
          apiKey: process.env.RUNWAYML_API_KEY,
          model: "gen4_turbo",
          ratio: "832:1104",
          contentModeration: { publicFigureThreshold: "low" },
          duration: 5,
        },
      },
      id: "runway-ml-gen4-turbo",
    }),
    returnsAlias: { videoPaths: "paths" },
  },
]
```
