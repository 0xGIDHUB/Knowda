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
    .select("id, name, address, completed")
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
    .update({ game_state: true })
    .eq("game_pass", gamePass);

  if (error) throw error;
}

/**
 * Reset a game before activation:
 * - Sets current_no_of_participants to 0
 * - Sets reward_paid to false
 * - Deletes all player records for that game
 */
export async function resetGameBeforeActivation(gamePass: number) {
  try {
    // Step 1: Reset main game info fields
    const { error: updateError } = await supabase
      .from("game_info")
      .update({
        current_no_of_participants: 0,
        reward_paid: false,
      })
      .eq("game_pass", gamePass);

    if (updateError) throw new Error(updateError.message);

    // Step 2: Delete all player rows for this game
    const { error: deleteError } = await supabase
      .from("game_players")
      .delete()
      .eq("game_pass", gamePass);

    if (deleteError) throw new Error(deleteError.message);

    console.log(`✅ Game ${gamePass} reset successfully.`);
    return { success: true };
  } catch (err) {
    console.error("❌ Error resetting game before activation:", err);
    return { success: false, error: err };
  }
}

/**
 * Delete a game across all related tables by game id
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

    // ✅ Step 3: Delete all related players
    const { error: pError } = await supabase
      .from("game_players")
      .delete()
      .eq("game_pass", gamePass);
    if (pError) throw new Error(pError.message);

    // Step 4: Delete from main table
    const { error: gError } = await supabase
      .from("game_info")
      .delete()
      .eq("id", gameId);
    if (gError) throw new Error(gError.message);

    console.log(`✅ Game ${gamePass} and all related data deleted successfully.`);
    return true;
  } catch (err) {
    console.error("❌ Error deleting game:", err);
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

/**
 * Check if a wallet address has already joined a specific game
 */
export async function hasPlayerJoined(gamePass: number, walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from("game_players")
      .select("id")
      .eq("game_pass", gamePass)
      .eq("address", walletAddress)
      .maybeSingle();

    if (error) throw error;

    // ✅ return true if player exists
    return !!data;
  } catch (err) {
    console.error("Error checking existing player:", err);
    throw err;
  }
}

export async function joinGame(
  gamePass: number,
  address: string,
  name: string
) {
  try {
    // Insert into game_players
    const { error: insertError } = await supabase
      .from("game_players")
      .insert([{ game_pass: gamePass, address, name }]);

    if (insertError) throw insertError;

    // Fetch current count
    const { data, error: fetchError } = await supabase
      .from("game_info")
      .select("current_no_of_participants")
      .eq("game_pass", gamePass)
      .single();

    if (fetchError) throw fetchError;

    const newCount = (data?.current_no_of_participants || 0) + 1;

    // Update participant count
    const { error: updateError } = await supabase
      .from("game_info")
      .update({ current_no_of_participants: newCount })
      .eq("game_pass", gamePass);

    if (updateError) throw updateError;

    return { success: true };
  } catch (err) {
    console.error("Error joining game:", err);
    return { success: false, error: err };
  }
}

export async function checkPlayerCompleted(gamePass: number, address: string, name: string) {
  const { data, error } = await supabase
    .from("game_players")
    .select("completed")
    .eq("game_pass", gamePass)
    .eq("address", address)
    .eq("name", name)
    .single();

  if (error) throw error;
  return data?.completed === true;
}

export async function leaveGame(
  gamePass: number,
  address: string,
  nickname: string
) {
  try {
    // 1️⃣ Remove the player entry from game_players
    const { error: deleteError } = await supabase
      .from("game_players")
      .delete()
      .eq("game_pass", gamePass)
      .eq("address", address)
      .eq("name", nickname); // 👈 include nickname in deletion criteria

    if (deleteError) throw deleteError;

    // 2️⃣ Fetch current count
    const { data, error: fetchError } = await supabase
      .from("game_info")
      .select("current_no_of_participants")
      .eq("game_pass", gamePass)
      .single();

    if (fetchError) throw fetchError;

    const newCount = Math.max((data?.current_no_of_participants || 1) - 1, 0);

    // 3️⃣ Update participant count
    const { error: updateError } = await supabase
      .from("game_info")
      .update({ current_no_of_participants: newCount })
      .eq("game_pass", gamePass);

    if (updateError) throw updateError;

    return { success: true };
  } catch (err) {
    console.error("Error leaving game:", err);
    return { success: false, error: err };
  }
}

export async function getPlayerAnswers(gamePass: number, address: string,
  nickname: string) {
  const { data, error } = await supabase
    .from("game_players")
    .select("answers")
    .eq("game_pass", gamePass)
    .eq("address", address)
    .eq("name", nickname)
    .single();
  if (error) throw error;
  return data?.answers || [];
}

export async function savePlayerAnswer(gamePass: number, address: string,
  nickname: string, answers: string[]) {
  const { error } = await supabase
    .from("game_players")
    .update({ answers })
    .eq("game_pass", gamePass)
    .eq("name", nickname)
    .eq("address", address);
  if (error) throw error;
}

export async function getGameQuestions(gamePass: number) {
  const { data, error } = await supabase
    .from("game_questions")
    .select("*")
    .eq("game_pass", gamePass)
    .single();
  if (error) throw error;
  return data;
}

//
// ✅ Mark player as completed
//
export const markPlayerCompleted = async (
  gamePass: number,
  walletAddress: string,
  nickname: string
) => {
  const { error } = await supabase
    .from("game_players")
    .update({ completed: true })
    .eq("game_pass", gamePass)
    .eq("address", walletAddress)
    .eq("name", nickname);

  if (error) throw error;
  return true;
};

// ✅ Calculate and save result for a player
export const calculateAndSaveResult = async (
  gamePass: number,
  walletAddress: string,
  nickname: string
) => {
  try {
    // 1️⃣ Fetch player answers
    const { data: playerData, error: playerError } = await supabase
      .from("game_players")
      .select("answers")
      .eq("game_pass", gamePass)
      .eq("address", walletAddress)
      .eq("name", nickname)
      .maybeSingle();

    if (playerError) throw playerError;
    if (!playerData || !playerData.answers) throw new Error("No player answers found");

    const playerAnswers: string[] = playerData.answers;

    // 2️⃣ Fetch correct answers and points
    const { data: answerData, error: ansError } = await supabase
      .from("game_answers")
      .select("*")
      .eq("game_pass", gamePass)
      .single();

    if (ansError) throw ansError;

    // 3️⃣ Calculate total score
    let totalPoints = 0;
    let maxPoints = 0;

    for (let i = 1; i <= 20; i++) {
      const correct = answerData[`q${i}_ans`];
      const questionPoint = answerData[`q${i}_point`] || 0;

      if (correct) {
        maxPoints += questionPoint;
        const playerAns = playerAnswers[i - 1] || "";
        if (playerAns.trim().toUpperCase() === correct.trim().toUpperCase()) {
          totalPoints += questionPoint;
        }
      }
    }

    // 4️⃣ Update player's total points
    const { error: updateError } = await supabase
      .from("game_players")
      .update({ points: totalPoints })
      .eq("game_pass", gamePass)
      .eq("address", walletAddress)
      .eq("name", nickname);

    if (updateError) throw updateError;

    return { totalPoints, maxPoints };
  } catch (err) {
    console.error("❌ Error calculating result:", err);
    throw err;
  }
};

export async function endGame(gamePass: number) {
  // ✅ Update game_state to false
  const { error } = await supabase
    .from("game_info")
    .update({ game_state: false })
    .eq("game_pass", Number(gamePass));

  if (error) throw error;
}

export async function getGameTotalPoints(game_pass: number) {
  try {
    const { data, error } = await supabase
      .from("game_answers")
      .select("total_point")
      .eq("game_pass", game_pass);

    if (error) throw error;

    // Sum all total_point values in case there are multiple
    const totalPoints = data?.reduce((sum, row) => sum + (row.total_point || 0), 0) || 0;

    return totalPoints;
  } catch (err) {
    console.error("Error fetching total points:", err);
    return 0;
  }
}

// ✅ Fetch leaderboard data by game_pass, sorted by points descending
export const getLeaderboardByPass = async (gamePass: number) => {
  try {
    const { data, error } = await supabase
      .from("game_players")
      .select("name, address, points")
      .eq("game_pass", gamePass)
      .order("points", { ascending: false }); // highest → lowest

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    return [];
  }
};



