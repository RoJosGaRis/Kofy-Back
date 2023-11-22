const OpenAI = require("openai");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");
const createAccess = require("../helper/createAccess.js");

const openai = new OpenAI();

const router = express.Router();
const prisma = new PrismaClient();

const speechSessionInstructions = `
  Eres un asistente inteligente del equipo de KOFY. Tu trabajo es ayudar
  a resumir las sesiones de habla de los usuarios. Estas sesiones de habla
  son de contexto médico y se centran en la salud del paciente. Tu trabajo es
  tomar lo más importante del texto, resumirlos en puntos clave y enviarlos en
  un objeto JSON en el siguiente formato:
  { "resultado": ["EJEMPLO", "EJEMPLO", ...] }
`;

const getRemindersInstructions = `
  Eres un asistente inteligente del equipo de KOFY. Tu trabajo es ayudar 
  a obtener posibles recordatorios de recetas médicas. Estos recordatorios deben
  de basarse en los medicamentos recetados por el doctor, y deben se concisos.
  Tu trabajp es tomar un texto escaneado de la recta e interpretar la información,
  obteniendo los medicamentos o tratamientos recetados. Omite la información que no hace
  sentido o que hace referencia al paciente o consultorio. Los intervalos de tiempo, en caso de tener uno, debes de retornar solamente un número que sea equivalente a la cantidad de horas de ese intervalo, sin ningún texto. En caso de no tener un intervalo, regresa un string vacío.
  También deberá regresar una explicación sencilla, con puntos claves 
  Lo que recuperes, deber regresarlo en un objeto JSON en el siguiente formato:
  { "recordatorios": [{nombre: "NOMBRE", dosis: "DOSIS", intervalo: "INTERVALO"}, {nombre: "NOMBRE2", dosis: "DOSIS2", intervalo: "INTERVALO"}, ...]}
  
`;

router.post("/summary", validateToken, async (req, res) => {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: speechSessionInstructions },
      { role: "user", content: req.body.session },
    ],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });

  req.body = {
    success: true,
    completion: completion.choices[0],
  };

  res.json(req.body);
});

router.post("/reminders", validateToken, async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: getRemindersInstructions },
        { role: "user", content: req.body.prescription },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });

    req.body = {
      success: true,
      completion: completion.choices[0],
    };

    res.json(req.body.completion.message.content);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/createSpeechSession", validateToken, async (req, res) => {
  try {
    sessionDate = req.body.sessionDate;

    var year = sessionDate.split("-")[0];
    var month = sessionDate.split("-")[1];
    var day = sessionDate.split("-")[2];

    var newDate = new Date(year, month - 1, day);

    const newSession = await prisma.speech_sessions.create({
      data: {
        access_id: createAccess(6),
        session_name: req.body.sessionName,
        session_description: req.body.sessionDescription,
        session_doctor: parseInt(req.body.sessionDoctor),
        session_date: newDate,
        color: parseInt(req.body.color),
        current_text: "",
      },
      select: {
        id: true,
        access_id: true,
      },
    });

    res.status(200).send(newSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
