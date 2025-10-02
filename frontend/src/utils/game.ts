import { supabase } from "./supabaseClient";

// Generate a unique 4-digit passcode
async function generateUniquePasscode(): Promise<number> {
  let passcode: number;
  let isUnique = false;

  while (!isUnique) {
    passcode = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const { data, error } = await supabase
      .from("game_info")
      .select("game_pass")
      .eq("game_pass", passcode);

    if (!error && (!data || data.length === 0)) {
      isUnique = true;
    }
  }
  return passcode!;
}

/**
 * Create a new game
 */
export async function createGame({
  owner,
  title,
  reward,
  questions,
  duration,
}: {
  owner: string;
  title: string;
  reward: number;
  questions: number;
  duration: number;
}) {
  try {
    const passcode = await generateUniquePasscode();

    const { data, error } = await supabase.from("game_info").insert([
      {
        owner,
        title,
        reward_amount: reward,
        no_of_questions: questions,
        duration,
        game_pass: passcode,
        max_no_of_participants: 5,
        game_state: false,
      },
    ]).select("*"); // return inserted row

    if (error) throw new Error(error.message);

    return data?.[0] || null;
  } catch (err) {
    console.error("Error creating game:", err);
    throw err;
  }
}

/**
 * Fetch games by owner wallet address
 */
export async function getGamesByOwner(owner: string) {
  try {
    const { data, error } = await supabase
      .from("game_info")
      .select("*")
      .eq("owner", owner);

    if (error) throw new Error(error.message);

    return data || [];
  } catch (err) {
    console.error("Error fetching games:", err);
    return [];
  }
}

// Get game by pass
export async function getGameByPass(gamePass: string) {
  const { data, error } = await supabase
    .from("game_info")
    .select("*")
    .eq("game_pass", gamePass)
    .single();

  if (error) throw error;
  return data;
}

export async function getPlayersByPass(game_pass: number) {
  const { data, error } = await supabase
    .from("game_players")
    .select("id, name, address, submitted")
    .eq("game_pass", game_pass);

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }
  return data;
}

// Fetch game info by game pass
export async function getGameInfo(gamePass: number) {
  const { data, error } = await supabase
    .from("game_info")
    .select("*")
    .eq("game_pass", gamePass)
    .single();

  if (error && error.code !== "PGRST116") {
    // 116 means "no rows found"
    throw new Error(error.message);
  }

  return data;
}

// Update is_active flag
export async function activateGame(gamePass: string) {
  const { error } = await supabase
    .from("game_info")
    .update({game_state: true })
    .eq("game_pass", gamePass);

  if (error) throw error;
}


/**
 * Delete a game across all tables by game id
 */
export async function deleteGame(gameId: string) {
  try {
    // Step 1: Fetch game_pass from game_info
    const { data: game, error: fetchError } = await supabase
      .from("game_info")
      .select("game_pass")
      .eq("id", gameId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!game) throw new Error("Game not found");

    const gamePass = game.game_pass;

    // Step 2: Delete from dependent tables first
    const { error: qError } = await supabase
      .from("game_questions")
      .delete()
      .eq("game_pass", gamePass);

    if (qError) throw new Error(qError.message);

    const { error: aError } = await supabase
      .from("game_answers")
      .delete()
      .eq("game_pass", gamePass);

    if (aError) throw new Error(aError.message);

    // Step 3: Delete from main table
    const { error: gError } = await supabase
      .from("game_info")
      .delete()
      .eq("id", gameId);

    if (gError) throw new Error(gError.message);

    return true;
  } catch (err) {
    console.error("Error deleting game:", err);
    throw err;
  }
}

/**
 * Update an existing game
 */
export async function updateGame({
  id,
  title,
  reward,
  questions,
  duration,
}: {
  id: string; // game id from Supabase
  title?: string;
  reward?: number;
  questions?: number;
  duration?: number;
}) {
  try {
    const { data, error } = await supabase
      .from("game_info")
      .update({
        ...(title !== undefined && { title }),
        ...(reward !== undefined && { reward_amount: reward }),
        ...(questions !== undefined && { no_of_questions: questions }),
        ...(duration !== undefined && { duration }),
      })
      .eq("id", id)
      .select("*"); // return updated row

    if (error) throw new Error(error.message);

    return data?.[0] || null;
  } catch (err) {
    console.error("Error updating game:", err);
    throw err;
  }
}

export const updateGameTxId = async (gamePass: string, txId: string) => {
  try {
    const { error } = await supabase
      .from("game_info")
      .update({ tx_id: txId })
      .eq("game_pass", gamePass);

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error(error.message);
    }

    return true;
  } catch (err) {
    console.error("updateGameTxId failed:", err);
    return false;
  }
};

// Check if game is full
export const checkGameCapacity = async (gamePass: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from("game_info")
    .select("current_no_of_participants, max_no_of_participants")
    .eq("game_pass", gamePass)
    .single();

  if (error) throw error;

  if (!data) return true; // no game found → treat as full to be safe

  return data.current_no_of_participants >= data.max_no_of_participants;
};
