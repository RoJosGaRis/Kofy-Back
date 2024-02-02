const OpenAI = require("openai");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateToken = require("../helper/validateToken");
const createAccess = require("../helper/createAccess.js");
const { encrypt, decrypt } = require("../helper/encryption.js");

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
  También deberá regresar una explicación sencilla, con puntos claves sobre cada medicamento que serían relevantes para una persona que regularmente no tiene experiencia con nada médico, como su uso adecuado, para qué suele recetarse, entre otros. Deberás regresar esos recodatorios individuales, concisos y relevantes.
  Lo que recuperes, deber regresarlo en un objeto JSON en el siguiente formato:
  { "reminders": [{drugName: "NOMBRE", dosis: "DOSIS", everyXHours: "INTERVALO"}, {drugName: "NOMBRE2", dosis: "DOSIS2", everyXHours: "INTERVALO"}, ...], "explanations" : [{name: "NOMBRE DEL MEDICAMENTO", explanation: ["PUNTO 1", "PUNTO 2", ...]}, {name: "NOMBRE DEL MEDICAMENTO 2", explanation: ["PUNTO 1", "PUNTO 2", ...]}]}
  
  Asegúrate de usar correctamente las palabras "reminders", "drugName", "explanations", "name" y "explanation" para los parámetros del JSON.

  Toma en cuenta que el paciente tiene las siguientes alergias y enfermedades: 
`;

router.post("/summary", validateToken, async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: speechSessionInstructions },
        { role: "user", content: req.body.session },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });

    console.log(req.body.accessId);

    let newAccess = encrypt({
      data: req.body.accessId,
      iv: req.body.accessId,
    });

    const session = await prisma.speech_sessions.updateMany({
      where: {
        access_id: newAccess.data,
      },
      data: {
        current_text: completion.choices[0].message.content,
      },
    });

    console.log(newAccess.data);

    res.status(200).send({ message: "ok" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/reminders", validateToken, async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: getRemindersInstructions + req.body.patientInfo,
        },
        { role: "user", content: req.body.prescription },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });

    console.log(completion);

    req.body = {
      success: true,
      completion: completion.choices[0],
    };

    let response = JSON.parse(req.body.completion.message.content);
    response.reminders.forEach((element) => {
      var newHours = element.everyXHours ? element.everyXHours : -1;
      element.everyXHours = parseInt(newHours);
    });

    console.log(response)

    res.json(response);
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: err.message });
  }
});

router.post("/createSpeechSession", validateToken, async (req, res) => {
  try {
    let flag = true;
    let newAccess;
    newAccess = createAccess(6);

    newAccess = encrypt({ data: newAccess, iv: newAccess });
    const newSession = await prisma.speech_sessions.create({
      data: {
        access_id: newAccess.data,
        current_text: "",
      },
      select: {
        access_id: true,
      },
    });

    res
      .status(200)
      .send({ access_id: decrypt({ data: newAccess.data, iv: newAccess.iv }) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/getSummary", validateToken, async (req, res) => {
  try {
    requestId = req.body.accessId;
    validatedId = "1" + requestId.substring(1, requestId.length);
    let validatedAccess = encrypt({ data: validatedId, iv: validatedId });

    const session = await prisma.speech_sessions.findFirst({
      where: {
        access_id: validatedAccess.data,
      },
      select: {
        current_text: true,
      },
    });

    if (session) {
      result = JSON.parse(JSON.parse(session.current_text));
      const resultadoArray = result.resultado;

      res.json({
        isValid: true,
        result: resultadoArray,
      });
    } else {
      res.json({
        isValid: false,
        result: [],
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/endSession", validateToken, async (req, res) => {
  try {
    requestId = req.body.accessId;
    validatedId = "1" + requestId.substring(1, requestId.length);
    validateAccess = encrypt({ data: validatedId, iv: validatedId });
    finishedId = "2" + requestId.substring(1, requestId.length);
    finishedAccess = encrypt({ data: finishedId, iv: finishedId });

    const session = await prisma.speech_sessions.updateMany({
      where: {
        access_id: validateAccess.data,
      },
      data: {
        access_id: finishedAccess.data,
        current_text: " ",
      },
    });

    if (session) {
      res.status(200).json({ message: "ok" });
    } else {
      res.status(200).json({ message: "not ok" });
    }
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.post("/encrypt", (req, res) => {
  try {
    let text = { iv: req.body.iv, data: req.body.data };

    res.json(encrypt(text));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/decrypt", (req, res) => {
  try {
    let text = { data: req.body.data };
    // console.log("TEXT" + text.iv);
    res.json(decrypt(text));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
