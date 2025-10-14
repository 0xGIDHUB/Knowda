# Knowda Updates
These are the updates and issues that will be addressed in newer releases of the knowda app.

## Updates to be added
+ Increase the number of players that can participate in the game
+ Give the host an option to remove a player from the game
+ Add new game mode: 'Three Winners'

## Issues to be addressed
+ Restrict the game host from participating in their own game (with the wallet address)

### Updates successfully added
+ ...

### Issues resolved
+ Restrict a wallet address from entering the same game two times
+ Reactivating an already closed game should reset all the 'game_players' record of that game and the 'current_no_of_participants'/'paid' status
+ Deleting a game should erase all the players record from the 'game_players' supabase table.
+ The 'join-game/[gamepass]' page should not be accessible once a player has completed the game, it should redirect to homepage if the player tries to access it.
+ Fix bug with the leaderboard where players with null/0 points are given first place.
+ ...
