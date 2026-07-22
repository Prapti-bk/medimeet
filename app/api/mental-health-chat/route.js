import { NextResponse } from "next/server";

function generateReply({ message, name }) {
  const text = String(message || "").toLowerCase();
  const who = name ? `${name}` : "there";

  const crisisPhrases = [
    "suicide",
    "kill myself",
    "self-harm",
    "hurt myself",
    "end my life",
    "i want to die",
  ];

  const isCrisis = crisisPhrases.some((p) => text.includes(p));

  if (isCrisis) {
    return (
      `I’m really sorry you’re feeling this way, ${who}. ` +
      "I can’t help with anything that could make you unsafe. " +
      "If you’re in immediate danger or thinking about harming yourself, please contact your local emergency number or a crisis hotline right now. " +
      "If you can, reach out to someone you trust and stay with them."
    );
  }

  if (text.includes("anx") || text.includes("panic")) {
    return (
      `Thanks for sharing, ${who}. Anxiety can feel overwhelming. ` +
      "Let’s try a quick grounding step: " +
      "(1) Take a slow breath in for 4 seconds, (2) hold for 2, (3) exhale for 6. " +
      "Do that 3 times. " +
      "Then, name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste. " +
      "What’s one specific moment that your anxiety started today?"
    );
  }

  if (text.includes("sad") || text.includes("depress") || text.includes("down")) {
    return (
      `I hear you, ${who}. Feeling down can make everything heavier. ` +
      "Try this gentle approach for the next 10 minutes: " +
      "(1) Drink some water, (2) step into natural light if possible, " +
      "(3) do one small task (something that takes <5 minutes). " +
      "After that, tell me: what’s the main thought or situation weighing on you right now?"
    );
  }

  if (
    text.includes("stress") ||
    text.includes("overwhelm") ||
    text.includes("burnt")
  ) {
    return (
      `That sounds stressful, ${who}. When we’re overwhelmed, it helps to shrink the problem. ` +
      "Answer these two questions: " +
      "1) What’s the #1 thing you’re worried will happen? " +
      "2) What’s one tiny action you can take in the next 10 minutes?"
    );
  }

  return (
    `Thanks for telling me what’s going on, ${who}. ` +
    "I’m here with you. If you’re comfortable, share: " +
    "What are you feeling (e.g., anxious, sad, angry, numb)? " +
    "And what happened right before you started feeling that way?"
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body?.message;
    const name = body?.name;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { reply: "Please type a message so I can respond." },
        { status: 400 }
      );
    }

    const reply = generateReply({ message, name });
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      {
        reply:
          "Sorry—something went wrong while generating a response. Please try again.",
      },
      { status: 500 }
    );
  }
}

