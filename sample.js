import ModelClient, { isUnexpected } from "@azure-rest/ai-inference"
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import path from "path";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const model = "gpt-4.1"; // Replace with your model name

export async function main() {
try {

    const client = ModelClient(
        endpoint,
        new AzureKeyCredential (token) ,
        );

    const modelName = model;

    const imagePath= path.join(process.cwd(), "contoso_layout_sketch.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image= imageBuffer.toString("base64");

    const userQuery = "Write HTML and CSS code for a web page based on the following hand-drawn sketch.";
    
    // Prepare the request with the image
    const requestBody = {
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: userQuery },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}` 
              } 
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    };

    console.log("Sending request to the model...");
    
    // Call the model with the correct endpoint
    const result = await client.path("/chat/completions").post({
        body: requestBody,
        headers: {
          "x-ms-model-mesh-model-name": modelName // Add model name in the header too
        }
    });
      
      if (!isUnexpected(result)) {
        const responseMessage = result.body.choices[0].message;
        console.log("Response:");
        console.log(responseMessage.content);
      } else {
        console.error("Error:", result.status, result.body);
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  }

main();

