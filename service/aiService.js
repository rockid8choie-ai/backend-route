// OpenAI API로 민원 텍스트를 분류/우선순위 추천
// - 키가 없으면 503(AiUnavailableError)으로 명확히 안내하고,
//   프론트는 수동 입력으로 자연스럽게 폴백한다.
function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

const SYSTEM_PROMPT = `당신은 빌딩 시설관리(FM) 민원 분류 도우미입니다.
사용자가 입력한 민원 제목/설명을 보고 아래 기준으로 분류하세요.

category (하나만):
- elec: 전기 (조명, 콘센트, 정전, 센서등)
- plumb: 배관/누수 (물, 배수, 화장실 설비, 역류)
- hvac: 냉난방 (에어컨, 히터, 환기, 실외기)
- clean: 미화 (청소, 쓰레기, 오염)
- etc: 기타 (위에 해당 없음)

priority (하나만):
- 긴급: 안전 위험, 침수/역류, 정전, 영업 중단급 장애
- 보통: 그 외 일반 민원

JSON으로만 답하세요: {"category": "...", "priority": "...", "reason": "한 문장 근거(한국어)"}`;

const VALID_CATEGORIES = ["elec", "plumb", "hvac", "clean", "etc"];
const VALID_PRIORITIES = ["보통", "긴급"];

export const classifyWork = async ({ title, desc }) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw createError(
      "AiUnavailableError",
      "AI 분류 기능이 아직 설정되지 않았습니다. 직접 분류를 선택해 주세요.",
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `제목: ${title}\n설명: ${desc || "(없음)"}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("OpenAI API error:", response.status, await response.text());
    throw createError(
      "AiRequestError",
      "AI 분류 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  const data = await response.json();

  let parsed;
  try {
    parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "");
  } catch {
    throw createError(
      "AiRequestError",
      "AI 응답을 해석하지 못했습니다. 다시 시도해 주세요.",
    );
  }

  // 모델이 규칙을 벗어난 값을 주면 안전한 기본값으로 보정
  return {
    category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "etc",
    priority: VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : "보통",
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
  };
};
