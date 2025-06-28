# 🧠 How to Prompt If You Can't Imagine Anything

_Suppose you are a dumb person who can't imagine, so you just ask:_

> **"I'm a dumb user that can't imagine anything. Make me an image prompt about the sky."**

This example demonstrates how to automate prompt generation, image creation using multiple models, and AI-driven evaluation — without needing to think creatively.

## 🤖 What This Workflow Does

1. **Ask GPT for a prompt**  
   You give GPT-4o-mini a simple message saying you can't imagine anything and want a prompt about "the sky". GPT will generate a detailed prompt for you.

2. **Generate images using DALL·E models in parallel**  
   Using both `dall-e-3` and `dall-e-2`, the prompt is used to create two different images at the same time — because you don't know which model will do a better job.

3. **Download both images**  
   Once the images are generated (as URLs), they are downloaded into a local folder (`/tmp`), so they can be processed further.

4. **Analyze the results with OpenAI Vision**  
   GPT-4o (with vision capabilities) compares the two images side by side. It tells you:
   - Which one matches the prompt better
   - Which one looks more realistic
   - And **why**

## 🧱 Commands and Models Used

- OpenAI APIs
  - Chat Response: `gpt-4o-mini`
  - Image Generation: `dall-e-3`, `dall-e-2`
  - Image Analysis: `gpt-4o`
- HTTP Image Download: `axios`

## `index.js`

```js
const workflow = [
  {
    type: "series",
    command: "generateResponse",
    params: () => ({
      service: "openai",
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        input:
          "I'm a dumb user that can't imagine anything. Make me an image prompt about the sky.",
        model: "gpt-4o-mini",
      },
      name: "openai-gpt-4o-mini",
    }),
    returnsAlias: { response: "prompt" },
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          service: "openai-image",
          opts: {
            apiKey: process.env.OPENAI_API_KEY,
            prompt: context.prompt,
            model: "dall-e-3",
            size: "1024x1024",
            response_format: "url",
          },
          name: "openai-image-dall-e-3",
        }),
        returnsAlias: { images: "dall-e-3" },
      },
      {
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          service: "openai-image",
          opts: {
            apiKey: process.env.OPENAI_API_KEY,
            prompt: context.prompt,
            model: "dall-e-2",
            size: "1024x1024",
            response_format: "url",
          },
          name: "openai-image-dall-e-2",
        }),
        returnsAlias: { images: "dall-e-2" },
      },
    ],
  },
  {
    type: "series",
    command: "downloadImages",
    params: (context) => ({
      service: "http-download",
      urls: [context["dall-e-3"]?.[0], context["dall-e-2"]?.[0]],
      outputDir: path.resolve(__dirname, "../../tmp"),
      name: "http-download",
    }),
    returns: ["imagePaths"],
  },
  {
    type: "series",
    command: "analyzeImages",
    params: (context) => ({
      service: "openai-vision",
      images: context.imagePaths,
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
        message:
          `Compare the two images and tell me which: \n` +
          `1) One better represents this prompt:\n"${context.prompt}" \n` +
          `2) One is more realistic? \n Explain both why`,
      },
      name: "openai-vision-gpt-4o",
    }),
    returnsAlias: { analysis: "visionAnalysis" },
  },
];
```
