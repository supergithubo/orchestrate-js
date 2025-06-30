# ✨ Effortless Creative Prompting with AI

Do you ever want to create amazing AI images, but aren't sure where to start or what to prompt? This workflow is for anyone who wants to:

- Quickly generate creative prompts with minimal effort
- Let AI do the heavy lifting of imagination
- Compare results from multiple models and get an expert evaluation

This example shows how you can automate the entire process—from prompt generation to image creation and analysis—so you can focus on exploring and enjoying creative results, no matter your experience or inspiration level.

## 🤖 What This Workflow Does

1. **AI-Generated Prompts**  
   Provide a simple idea (like "the sky") and let GPT-4o-mini generate a rich, creative image prompt for you.

2. **Parallel Image Creation**  
   Instantly create images using both `dall-e-3` and `dall-e-2`—see how different models interpret the same prompt.

3. **Automatic Image Download**  
   The generated images are automatically downloaded to your local folder for easy access and further use.

4. **AI-Powered Image Analysis**  
   OpenAI Vision (GPT-4o) compares the images, explaining:
   - Which one best matches the prompt
   - Which image is more realistic
   - The reasoning behind its evaluation

## 🧱 Commands and Models Used

- OpenAI APIs
  - Chat Response: `gpt-4o-mini`
  - Image Generation: `dall-e-3`, `dall-e-2`
  - Image Analysis: `gpt-4o`
- HTTP Image Download: `axios`

This workflow is designed to be accessible and modifiable—swap out models, change the analysis, or add your own creative steps!

## `index.js` Example

```js
[
  {
    type: "series",
    command: "generateResponse",
    params: {
      id: "openai-response-gpt-4o-mini",
      services: { llm: "openai-response" },
      params: {
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          input: "Give me a creative image prompt about the sky.",
          model: "gpt-4o-mini",
        },
      },
    },
    returnsAlias: { response: "prompt" },
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "generateImageResponse",
        params: (context: any) => ({
          id: "openai-image-dall-e-3",
          services: { imageGenerator: "openai-image" },
          params: {
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              prompt: context.prompt,
              model: "dall-e-3",
              size: "1024x1024",
              response_format: "url",
            },
          },
        }),
        returnsAlias: { images: "dall-e-3" },
      },
      {
        type: "series",
        command: "generateImageResponse",
        params: (context: any) => ({
          id: "openai-image-dall-e-2",
          services: { imageGenerator: "openai-image" },
          params: {
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              prompt: context.prompt,
              model: "dall-e-2",
              size: "1024x1024",
              response_format: "url",
            },
          },
        }),
        returnsAlias: { images: "dall-e-2" },
      },
    ],
  },
  {
    type: "series",
    command: "downloadImages",
    params: (context: any) => ({
      id: "http-download",
      services: { imageDownloader: "http-download" },
      params: {
        urls: [context["dall-e-3"]?.[0], context["dall-e-2"]?.[0]],
        outputDir: path.resolve(__dirname, "../../tmp"),
      },
    }),
    returns: ["imagePaths"],
  },
  {
    type: "series",
    command: "analyzeImages",
    params: (context: any) => ({
      id: "openai-vision",
      services: { vision: "openai-vision" },
      params: {
        images: context.imagePaths,
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content:
                `Compare the two images and tell me which: \n` +
                `1) One better represents this prompt:\n"${context.prompt}" \n` +
                `2) One is more realistic? \n Explain both why`,
            },
          ],
        },
      },
    }),
    returnsAlias: { analysis: "visionAnalysis" },
  },
];
```
