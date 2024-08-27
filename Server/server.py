import asyncio
import websockets
import json
from game_logic import Game

game = Game()
players = {}

async def handler(websocket, path):
    player_id = None
    try:
        if len(players) < 2:
            player_id = "A" if "A" not in players else "B"
            players[player_id] = websocket

            # Send player assignment message
            await websocket.send(json.dumps({
                "type": "player_assignment",
                "player_id": player_id,
            }))

            # Send initial game state to the player
            await websocket.send(json.dumps({
                "type": "update",
                "state": game.get_game_state(),
            }))

            while True:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)

                    # Handle move messages
                    if data["type"] == "move" and data["player"] == game.current_player:
                        success, move_message = game.make_move(data["player"], data["character"], data["move"])
                        game_state = game.get_game_state()

                        # Broadcast the updated game state and move message to both players
                        for player_ws in players.values():
                            await player_ws.send(json.dumps({
                                "type": "update",
                                "state": game_state,
                                "message": move_message
                            }))

                    # Handle chat messages
                    elif data["type"] == "chat":
                        for player_ws in players.values():
                            await player_ws.send(json.dumps({
                                "type": "chat",
                                "message": data["message"]
                            }))

                except websockets.exceptions.ConnectionClosedOK:
                    print(f"Player {player_id} disconnected.")
                    break

        else:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Game is already in progress with two players.",
            }))
            await websocket.close()

    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Remove the player from the game if they disconnect
        if player_id and player_id in players:
            del players[player_id]
            print(f"Player {player_id} removed from the game.")

start_server = websockets.serve(handler, "localhost", 6789)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
