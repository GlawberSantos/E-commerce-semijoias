import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.SUA_CHAVE_API });

(async () => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Oi, pode me ajudar a escolher um anel?" }]
    });
    console.log(response.choices[0].message.content);
  } catch (err) {
    console.error("Erro no OpenAI:", err);
  }
})();
