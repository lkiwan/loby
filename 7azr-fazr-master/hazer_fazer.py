import os
import sys
import time
import random

SECRET_ACTIONS = [
    "Start every sentence with the word 'yes'.",
    "End every sentence with a question.",
    "Scratch your nose every time you speak.",
    "Say the word 'actually' as often as possible.",
    "Look up at the ceiling before answering.",
    "Repeat the last word of your answer back to them.",
    "Speak only in a whisper.",
    "Say 'good question' before every answer.",
    "Use the phrase 'in my opinion' constantly.",
    "Cross your arms whenever someone asks you something.",
    "Blink slowly and dramatically after each sentence.",
    "Answer every question with another question.",
    "Stand up every time you talk.",
    "Say 'hmm, let me think' before answering.",
    "Touch your ear whenever you are asked a question.",
    "Laugh lightly at the end of every answer.",
]

FONT = {
    "A": (".##..", "#..#.", "#..#.", "#####", "#..#."),
    "B": ("####.", "#...#", "####.", "#...#", "####."),
    "C": (".###.", "#...#", "#....", "#...#", ".###."),
    "D": ("####.", "#...#", "#...#", "#...#", "####."),
    "E": ("#####", "#....", "####.", "#....", "#####"),
    "F": ("#####", "#....", "####.", "#....", "#...."),
    "G": (".###.", "#....", "#.###", "#...#", ".###."),
    "H": ("#...#", "#...#", "#####", "#...#", "#...#"),
    "I": ("#####", "..#..", "..#..", "..#..", "#####"),
    "J": ("..###", "...#.", "...#.", "#..#.", ".##.."),
    "K": ("#...#", "#..#.", "###..", "#..#.", "#...#"),
    "L": ("#....", "#....", "#....", "#....", "#####"),
    "M": ("#...#", "##.##", "#.#.#", "#...#", "#...#"),
    "N": ("#...#", "##..#", "#.#.#", "#..##", "#...#"),
    "O": (".###.", "#...#", "#...#", "#...#", ".###."),
    "P": ("####.", "#...#", "####.", "#....", "#...."),
    "Q": (".###.", "#...#", "#.#.#", "#..#.", ".###."),
    "R": ("####.", "#...#", "####.", "#..#.", "#...#"),
    "S": (".####", "#....", ".###.", "....#", "####."),
    "T": ("#####", "..#..", "..#..", "..#..", "..#.."),
    "U": ("#...#", "#...#", "#...#", "#...#", ".###."),
    "V": ("#...#", "#...#", "#...#", ".#.#.", "..#.."),
    "W": ("#...#", "#...#", "#.#.#", "##.##", "#...#"),
    "X": ("#...#", ".#.#.", "..#..", ".#.#.", "#...#"),
    "Y": ("#...#", ".#.#.", "..#..", "..#..", "..#.."),
    "Z": ("#####", "...#.", "..#..", ".#...", "#####"),
    "0": ("#####", "#...#", "#...#", "#...#", "#####"),
    "1": ("..#..", ".##..", "..#..", "..#..", "#####"),
    "2": ("####.", "....#", ".###.", "#....", "#####"),
    "3": ("####.", "....#", "..##.", "....#", "####."),
    "4": ("#..#.", "#..#.", "#####", "...#.", "...#."),
    "5": ("#####", "#....", "####.", "....#", "####."),
    "6": (".###.", "#....", "####.", "#...#", ".###."),
    "7": ("#####", "...#.", "..#..", ".#...", ".#..."),
    "8": (".###.", "#...#", ".###.", "#...#", ".###."),
    "9": (".###.", "#...#", ".####", "....#", ".###."),
    "!": ("..#..", "..#..", "..#..", ".....", "..#.."),
    "?": ("#####", "....#", "..#..", ".....", "..#.."),
    ":": (".....", "..#..", ".....", "..#..", "....."),
    ".": (".....", ".....", ".....", ".....", "..#.."),
    "-": (".....", ".....", "#####", ".....", "....."),
    "'": ("..#..", "..#..", ".....", ".....", "....."),
    ",": (".....", ".....", ".....", "..#..", ".#..."),
    "/": ("....#", "...#.", "..#..", ".#...", "#...."),
    "_": (".....", ".....", ".....", ".....", "#####"),
    " ": (".....", ".....", ".....", ".....", "....."),
}

FALLBACK_GLYPH = ("#####", "#...#", "#...#", "#...#", "#####")


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def beep():
    sys.stdout.write("\a")
    sys.stdout.flush()


def pause():
    try:
        input("    Press Enter to continue... ")
    except (EOFError, KeyboardInterrupt):
        sys.exit(0)


def panel(lines, width=70, symbol="#"):
    if isinstance(lines, str):
        lines = [lines]
    lines = [str(l) for l in lines]
    content_width = max(len(l) for l in lines)
    width = max(width, content_width + 4)
    print(symbol * width)
    for line in lines:
        pad = width - len(line) - 2
        left = pad // 2
        right = pad - left
        print(symbol + " " * left + line + " " * right + symbol)
    print(symbol * width)
    print()


def box(text, width=70, fill="-"):
    text = str(text)
    width = max(width, len(text) + 6)
    print(fill * width)
    print(fill + " " + text + " " + fill)
    print(fill * width)


def big_text(text):
    text = str(text).upper()
    rows = ["", "", "", "", ""]
    for ch in text:
        glyph = FONT.get(ch, FALLBACK_GLYPH)
        for i in range(5):
            rows[i] += glyph[i] + " "
    rows = [r.rstrip() for r in rows]
    longest = max(len(r) for r in rows)
    longest = max(longest, 5)
    edge = "#" * (longest + 4)
    print(edge)
    for r in rows:
        print("# " + r.ljust(longest) + " #")
    print(edge)
    print()


def ask_int(prompt, default, low, high):
    while True:
        raw = input(prompt).strip()
        if raw == "":
            return default
        try:
            value = int(raw)
        except ValueError:
            print(f"    Please enter a number between {low} and {high}.")
            continue
        if low <= value <= high:
            return value
        print(f"    Please enter a number between {low} and {high}.")


def setup_game():
    clear_screen()
    panel(["* 7ZER FZER *", "\u062d\u0632\u0631 \u0641\u0632\u0631", "", "A pass-and-play party game."])
    box("ROOM SETUP", width=70)
    print()

    num_players = ask_int(f"    Number of players ({3}-{15}): ", 6, 3, 15)
    print()
    print("    Enter each player's name. Leave blank for the default name.")
    print()
    names = []
    for i in range(1, num_players + 1):
        raw = input(f"    Player {i} name: ").strip()
        names.append(raw if raw else f"Player {i}")

    max_imp = min(2, num_players - 1)
    num_imp = ask_int(f"    Number of imposters (1-{max_imp}): ", 1, 1, max_imp)
    timer = ask_int("    Interrogation timer in seconds (default 120): ", 120, 10, 600)
    print()
    return names, num_imp, timer


def choose_imposters(names, num_imp):
    return random.sample(names, num_imp)


def pick_action():
    return random.choice(SECRET_ACTIONS)


def reveal_imposters(imposters):
    clear_screen()
    beep()
    panel(["PASS-AND-PLAY NIGHT", "Everyone, look at the screen!"])
    print()
    for imposter in imposters:
        box("THE IMPOSTER IS:")
        print()
        big_text(imposter)
        print()
    if len(imposters) == 1:
        panel("Only ONE imposter among you. Hide your identity well!")
    else:
        panel("TWO imposters work as a team. Hide your identities well!")
    print()
    pause()


def pass_around(players, imposters, action):
    for player in players:
        clear_screen()
        panel(["PASS THE DEVICE TO: " + player.upper(), "", "Do NOT look at the screen yet!", "Press Enter when you are looking."])
        pause()
        clear_screen()
        if player in imposters:
            panel(["YOU ARE THE IMPOSTER!", "", "You do NOT have a secret action.", "Your job: interrogate and GUESS the secret", "action the other players are performing."])
            print()
            box("Memorize nothing. Hide with Enter!", width=70)
        else:
            panel(["YOUR SECRET ACTION IS:", "", action.upper(), "", "Perform this while answering questions.", "Do NOT let the imposters discover it."])
            print()
            box("Memorize it. Hide with Enter!", width=70)
        print()
        pause()
        clear_screen()


def countdown(seconds):
    end = time.time() + seconds
    bar_len = 30
    while True:
        remaining = max(0, int(end - time.time()))
        elapsed = seconds - remaining
        minutes, secs = divmod(remaining, 60)
        filled = int(bar_len * elapsed / seconds) if seconds else bar_len
        bar = "=" * filled + "-" * (bar_len - filled)
        line = f"  TIME LEFT: {minutes:02d}:{secs:02d}  [{bar}]  "
        sys.stdout.write("\r" + " " * 90 + "\r")
        sys.stdout.write(line)
        sys.stdout.flush()
        if remaining <= 0:
            print()
            return
        time.sleep(0.2)


def time_up_flash():
    for _ in range(4):
        beep()
        print("=" * 70)
        print("=" * 70)
        print("=" * 70)
        time.sleep(0.3)
        clear_screen()
    time.sleep(0.3)
    beep()


def interrogation_round(imposter_name, players, seconds, tagline):
    clear_screen()
    panel(["INTERROGATION PHASE", "", tagline])
    box("YOUR TURN: " + imposter_name.upper())
    print()
    panel(["Ask questions and listen carefully.", "Someone is performing a SECRET ACTION.", "Find it before time runs out!"])
    print("    Players under interrogation:")
    for i, name in enumerate(players, 1):
        print(f"      {i}. {name}")
    print()
    pause()
    clear_screen()
    print()
    panel(["INTERROGATE! " + imposter_name.upper(), "The clock is ticking..."])
    print()
    countdown(seconds)
    time_up_flash()


def final_guess(action):
    clear_screen()
    panel(["TIME IS UP!"])
    print()
    panel(["Imposter, make your guess OUT LOUD!", "Shout it so everyone hears your answer."])
    print()
    box("Press Enter to reveal the secret action.", width=70)
    print()
    pause()
    clear_screen()
    panel(["THE SECRET ACTION WAS:"])
    box(action)
    print()
    panel(action.upper(), width=80)
    print()
    box("Good job, imposter... or good hiding, crew!", width=70)
    print()
    pause()


def play_round(names, num_imp, timer):
    clear_screen()
    panel(["NEW ROUND"])
    box("Shuffling the roles...")
    time.sleep(1.0)

    imposters = choose_imposters(names, num_imp)
    action = pick_action()

    reveal_imposters(imposters)

    passaround_msg = "Pass this device from player to player."
    if num_imp == 1:
        passaround_msg = passaround_msg + " Let it land on everyone ONCE."
    print()
    box(passaround_msg)
    print()
    pause()
    pass_around(names, imposters, action)

    clear_screen()
    beep()
    panel(["INTERROGATION PHASE BEGINS!"])
    print()
    pause()

    crew = [name for name in names if name not in imposters]
    if num_imp == 1:
        interrogation_round(imposters[0], crew, timer, "One imposter is on the hunt!")
    else:
        interrogation_round(
            imposters[0],
            crew,
            timer,
            "Imposter 1 goes first. Work as a team, but you guess SEPARATELY!",
        )
        clear_screen()
        beep()
        panel(["PASS THE DEVICE TO: " + imposters[1].upper(), "", "Imposter 2, fresh timer, your turn!"])
        pause()
        interrogation_round(
            imposters[1],
            crew,
            timer,
            "Imposter 2, the second interrogation!",
        )

    final_guess(action)


def main():
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        names = None
        num_imp = 1
        timer = 120
        while True:
            clear_screen()
            if names is None:
                names, num_imp, timer = setup_game()
            else:
                panel(["WELCOME BACK"])
                box("Current players: " + ", ".join(names))
                print()
                choice = input("    (r) Reconfigure the game   /   (k) Keep same players: ").strip().lower()
                if choice == "r":
                    names, num_imp, timer = setup_game()

            play_round(names, num_imp, timer)

            clear_screen()
            again = input("    Play another round? (y/n): ").strip().lower()
            if again not in ("y", "yes"):
                break
    except (EOFError, KeyboardInterrupt):
        clear_screen()
        panel(["Thanks for playing 7ZER FZER!"])


if __name__ == "__main__":
    main()