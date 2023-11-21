const OpenAI = require("openai");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");

const openai = new OpenAI();

const router = express.Router();
const prisma = new PrismaClient();

const speechSessionInstructions = `
  Eres un asistente inteligente del equipo de KOFY. Tu trabajo es ayudar
  a resumir las sesiones de habla de los usuarios. Estas sesiones de habla
  son de contexto médico y se centran en la salud del paciente. Tu trabajo es
  tomar lo más imprtante del texto, resumirlos en puntos clave y enviarlos en
  un objeto JSON en el siguiente formato:
  { "resultado": ["EJEMPLO", "EJEMPLO", ...] }
`

router.post("/summary", async (req, res) => { 
  const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": speechSessionInstructions},
      {"role": "user", "content": req.body.session}],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });

  req.body = {
    success: true,
    completion: completion.choices[0],
  };

  res.json(req.body);
});

module.exports = router;
