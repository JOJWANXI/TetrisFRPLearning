/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { Observable, fromEvent, interval, merge, pipe, takeWhile, takeUntil, BehaviorSubject } from "rxjs";
import { map, filter, scan, startWith,  switchMap, withLatestFrom } from "rxjs/operators";
import { Action, State, Key, Constants } from './types'
import { initialState, Move, Rotate, Restart} from "./states";
import { Vec,} from "./positionUtils";
import { show, hide, render, gameover, svg } from "./view";


/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  // Observable for keypress events
  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key, actionCreator: () => Action) =>
    key$.pipe(
      filter(({ code }) => code === keyCode),
      map(actionCreator)
    );
  
  // Define observables for specific game actions
  const left$ = fromKey("KeyA", () => new Move(new Vec(-1, 0)));
  const right$ = fromKey("KeyD", () => new Move(new Vec(1, 0)));
  const down$ = fromKey("KeyS", () => new Move(new Vec(0, 1)));
  const rotation$ = fromKey("KeyW", () => new Rotate());
  const restart$ = fromKey("KeyR", () => new Restart());
  
  // Merge all the key action observables into one
  const KeyAction$: Observable<Action> = merge(left$, right$, down$, rotation$, restart$);

  /**
  * Determines the game tick rate based on cleared rows.
  * @param totalClearedRows - Total number of cleared rows.
  */
  function getTickRate(totalClearedRows: number): number {
    const level = Math.floor(totalClearedRows / 1) + 1;
    const baseSpeed = calculateSpeed(level);
    return baseSpeed; 
  }
  
  /**
  * Calculates game speed based on the current level.
  * @param level - Current game level.
  */
  function calculateSpeed(level: number): number {
    return Math.max(950 - (level * 30), 100);
  }

  // Create a BehaviorSubject to manage and emit current game state
  const currentState$ = new BehaviorSubject<State>(initialState);  

  //Observable for game ticks, emits Move actions based on current game state and speed
  const tick$ = currentState$.pipe(
    switchMap(state => interval(getTickRate(state.totalClearedRows))),
    map(() => new Move(new Vec(0, 1)))
  );

  /**
   * Reducer function to update the state based on an action.
   * @param s - The current state.
   * @param action - The action applied to the state.
   */
  function reduceState(s: State, action: Action): State {
    return action.apply(s);
  }

  // Observable to manage the high score
  const highScore$ = new BehaviorSubject<number>(0);
  
  /**
   * Handles game sessions, emitting game states as they change.
   * @param initialHighScore - The initial high score to start the session with.
   */
  function gameSession(initialHighScore: number = 0): Observable<State> {
    return merge(tick$, KeyAction$).pipe(
      scan((currentState: State, action: Action): State => {
        const newState = reduceState(currentState, action);

        currentState$.next(newState);

        if (newState.highScore > currentState.highScore) {
          highScore$.next(newState.highScore);
        }

        return newState;
      }, { ...initialState, highScore: initialHighScore })
    );
  }

  /**
  * Manages game sessions and reacts to the restart action.
  * @param initialHighScore - Initial high score to start the session.
  */
  function manageGameSessions(initialHighScore: number = 0): Observable<State> {
    return gameSession(initialHighScore).pipe(
      takeUntil(restart$),
      takeWhile(state => !state.gameEnd, true)
    );
  }

  // Restart the game and manage sessions while considering the high score
  restart$.pipe(
    //startWith(null) ensure the game can start automatically
    startWith(null),
    withLatestFrom(highScore$),
    switchMap(([_, currentHighScore]) => manageGameSessions(currentHighScore)),
  )
    .subscribe((gameOutput: State) => {
      render(gameOutput);
      if (gameOutput.gameEnd) {
        show(gameover, svg);
      } else {
        hide(gameover);
      }
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}