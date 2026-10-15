export function formatCepInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function fetchAddressByCep(cep) {
  const digits = String(cep || "").replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) return null;

  const data = await response.json();
  if (data.erro) return null;

  const rua = [data.logradouro, data.bairro].filter(Boolean).join(", ");
  return {
    CEP: formatCepInput(data.cep || digits),
    ENDERECO: rua,
    CIDADE: data.localidade || "",
    ESTADO: data.uf || "",
  };
}
