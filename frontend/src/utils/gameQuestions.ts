import { supabase } from "./supabaseClient";

export type Question = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D" | "";
  points: number;
};

export async function getSingleQuestion(
  game_pass: number,
  index: number
): Promise<Question | null> {
  // Ensure row exists first
  await ensureRowsExist(game_pass);

  const { data: qData, error: qError } = await supabase
    .from("game_questions")
    .select("*")
    .eq("game_pass", game_pass)
    .single();

  const { data: aData, error: aError } = await supabase
    .from("game_answers")
    .select("*")
    .eq("game_pass", game_pass)
    .single();

  if (qError || aError) {
    console.error("Error fetching question:", qError || aError);
    return null;
  }

  return {
    questionText: qData?.[`q${index}`] || "",
    optionA: (qData?.[`q${index}_options`] || [])[0] || "",
    optionB: (qData?.[`q${index}_options`] || [])[1] || "",
    optionC: (qData?.[`q${index}_options`] || [])[2] || "",
    optionD: (qData?.[`q${index}_options`] || [])[3] || "",
    correctAnswer: (aData?.[`q${index}_ans`] as "A" | "B" | "C" | "D") || "",
    points: aData?.[`q${index}_point`] || 100,
  };
}

export async function saveSingleQuestion(
  game_pass: number,
  index: number,
  q: Question
) {
  // Ensure row exists before upsert
  await ensureRowsExist(game_pass);

  // Upsert into game_questions
  const { error: qError } = await supabase.from("game_questions").upsert(
    {
      game_pass,
      [`q${index}`]: q.questionText || "",
      [`q${index}_options`]: [
        q.optionA || "",
        q.optionB || "",
        q.optionC || "",
        q.optionD || "",
      ],
    },
    { onConflict: "game_pass" }
  );

  // Upsert into game_answers
  const { error: aError } = await supabase.from("game_answers").upsert(
    {
      game_pass,
      [`q${index}_ans`]: q.correctAnswer || null,
      [`q${index}_point`]: q.points || 100,
    },
    { onConflict: "game_pass" }
  );

  if (qError || aError) {
    console.error("Save error:", qError || aError);
    throw qError || aError;
  }
}

// Utility: make sure base rows exist
async function ensureRowsExist(game_pass: number) {
  // Check if row exists first in game_questions
  const { data: existingQ } = await supabase
    .from("game_questions")
    .select("game_pass")
    .eq("game_pass", game_pass)
    .maybeSingle();

  if (!existingQ) {
    await supabase.from("game_questions").insert({
      game_pass,
      q1: "" // required because q1 is NOT NULL
    });
  }

  // Check if row exists first in game_answers
  const { data: existingA } = await supabase
    .from("game_answers")
    .select("game_pass")
    .eq("game_pass", game_pass)
    .maybeSingle();

  if (!existingA) {
    await supabase.from("game_answers").insert({
      game_pass
    });
  }
}
