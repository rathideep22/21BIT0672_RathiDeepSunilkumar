class Game:
    def __init__(self):
        self.board = [["" for _ in range(5)] for _ in range(5)]
        self.current_player = "A"
        self.move_history = []
        self.board_history = []  # Stores the board states after each move
        self.init_board()

    def init_board(self):
        self.board[0] = ["A-P1", "A-H1", "A-H2", "A-H3", "A-P2"]
        self.board[4] = ["B-P1", "B-H1", "B-H2", "B-H3", "B-P2"]

    def is_valid_move(self, row, col, new_row, new_col):
        if not (0 <= new_row < 5 and 0 <= new_col < 5):
            return False
        if self.board[new_row][new_col] != "" and self.board[new_row][new_col][0] == self.current_player:
            return False
        return True

    def make_move(self, player, character, move):
        for row in range(5):
            for col in range(5):
                if self.board[row][col] == character:
                    dr, dc = self.get_move_direction(move, character)
                    new_row, new_col = row + dr, col + dc

                    if self.is_valid_move(row, col, new_row, new_col):
                        # Capture opponent's character if present
                        captured = self.board[new_row][new_col] if self.board[new_row][new_col] != "" else None

                        # Update board
                        self.board[new_row][new_col] = character
                        self.board[row][col] = ""

                        # Log the move
                        move_record = f"{character} moved {move} from ({row}, {col}) to ({new_row}, {new_col})"
                        if captured:
                            move_record += f", capturing {captured}"
                            self.remove_character(captured)

                        self.move_history.append(move_record)

                        # Save the current board state
                        self.save_board_state()

                        # Check for win condition
                        if self.check_win_condition():
                            self.move_history.append(f"Player {self.current_player} wins!")
                            return True, f"Player {self.current_player} wins!"

                        # Switch player
                        self.switch_player()
                        return True, move_record
                    else:
                        return False, "Invalid move"
        return False, "Character not found"

    def save_board_state(self):
        # Save a deep copy of the board state
        self.board_history.append([row[:] for row in self.board])

    def get_board_state_at(self, index):
        if 0 <= index < len(self.board_history):
            return self.board_history[index]
        return None

    def get_move_direction(self, move, character):
        if character.endswith('P'):  # Pawn
            move_map = {
                "L": (0, -1),
                "R": (0, 1),
                "F": (1, 0) if character.startswith('A') else (-1, 0),
                "B": (-1, 0) if character.startswith('A') else (1, 0)
            }
        elif character.endswith('H1'):  # Hero1
            move_map = {
                "L": (0, -2),
                "R": (0, 2),
                "F": (2, 0) if character.startswith('A') else (-2, 0),
                "B": (-2, 0) if character.startswith('A') else (2, 0)
            }
        elif character.endswith('H2'):  # Hero2
            move_map = {
                "FL": (2, -2) if character.startswith('A') else (-2, -2),
                "FR": (2, 2) if character.startswith('A') else (-2, 2),
                "BL": (-2, -2) if character.startswith('A') else (2, -2),
                "BR": (-2, 2) if character.startswith('A') else (2, 2)
            }
        elif character.endswith('H3'):  # Hero3
            move_map = {
                "FL": (3, -3) if character.startswith('A') else (-3, -3),
                "FR": (3, 3) if character.startswith('A') else (-3, 3),
                "BL": (-3, -3) if character.startswith('A') else (3, -3),
                "BR": (-3, 3) if character.startswith('A') else (3, 3),
                "RF": (2, 3) if character.startswith('A') else (-2, 3),
                "LF": (2, -3) if character.startswith('A') else (-2, -3),
                "RB": (-2, 3) if character.startswith('A') else (2, 3),
                "LB": (-2, -3) if character.startswith('A') else (2, -3)
            }
        else:
            move_map = {"L": (0, 0), "R": (0, 0), "F": (0, 0), "B": (0, 0)}  # Default case (should not happen)

        return move_map.get(move, (0, 0))

    def remove_character(self, character):
        for row in range(5):
            for col in range(5):
                if self.board[row][col] == character:
                    self.board[row][col] = ""  # Clear the position on the board
                    self.move_history.append(f"{character} was eliminated from the board.")

    def check_win_condition(self):
        opponent = "B" if self.current_player == "A" else "A"
        for row in self.board:
            for cell in row:
                if cell.startswith(opponent):
                    return False
        return True

    def switch_player(self):
        self.current_player = "B" if self.current_player == "A" else "A"

    def get_game_state(self):
        return {
            "board": self.board,
            "current_player": self.current_player,
            "move_history": self.move_history
        }
