# Knowda Updates
These are the updates and issues that will be addressed in newer releases of the knowda app.

## Updates to be added
+ Increase the number of players that can participate in the game
+ Give the host an option to remove a player from the game
+ Add new game mode: 'Three Winners'

## Issues to be addressed
+ The 'join-game/[gamepass]' page should not be accessible once a player has completed the game, it should redirect to homepage if the player tries to access it.
+ Deleting a game should erase all the players record from the 'game_players' supabase table.
+ Reactivating an already closed game should reset all the 'game_players' record of that game.
+ Fix the display glitch of the question form after player result has been calculated.