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

  // 1️⃣ Upsert into game_questions
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

  // 2️⃣ Upsert into game_answers
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

  // 3️⃣ Fetch all qX_point columns to recalculate total
  const { data, error: fetchError } = await supabase
    .from("game_answers")
    .select(
      `
      q1_point, q2_point, q3_point, q4_point, q5_point,
      q6_point, q7_point, q8_point, q9_point, q10_point,
      q11_point, q12_point, q13_point, q14_point, q15_point,
      q16_point, q17_point, q18_point, q19_point, q20_point
      `
    )
    .eq("game_pass", game_pass)
    .single();

  if (fetchError) {
    console.error("Error fetching question points:", fetchError);
    throw fetchError;
  }

  // 4️⃣ Calculate total points
  const totalPoints = Object.values(data || {}).reduce(
    (sum, val) => sum + (typeof val === "number" ? val : 0),
    0
  );

  // 5️⃣ Update total_point column
  const { error: totalError } = await supabase
    .from("game_answers")
    .update({ total_point: totalPoints })
    .eq("game_pass", game_pass);

  if (totalError) {
    console.error("Error updating total points:", totalError);
    throw totalError;
  }

  return { success: true, total_point: totalPoints };
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
