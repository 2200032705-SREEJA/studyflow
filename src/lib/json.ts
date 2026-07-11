export async function repairJSON(
  text: string,
  repairFn: (prompt: string) => Promise<string>
) {
  try {
    return JSON.parse(text);
  } catch {}
  const repaired = await repairFn(`
Fix the following JSON.
Return ONLY valid JSON.
${text}
`);
  return JSON.parse(repaired);
}
