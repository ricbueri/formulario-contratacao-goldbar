import { processFormSubmission } from "../../server/submitForm.js";

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Método não permitido." }, { status: 405 });
  }

  try {
    const body = await req.json();
    const result = await processFormSubmission(body);
    return Response.json(result.json, { status: result.status });
  } catch (error) {
    console.error("[submit]", error.message);
    return Response.json(
      { error: error.message || "Não foi possível enviar. Tente novamente em instantes." },
      { status: 500 }
    );
  }
};
