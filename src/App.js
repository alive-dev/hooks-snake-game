import React, { useCallback, useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import Field from "./components/Field";
import Button from "./components/Button";
import ManipulationPanel from "./components/ManipulationPanel";
import { initFields, getFoodPosition } from "./utils/index";
import {
    defaultInterval,
    defaultDifficulty,
    Delta,
    Difficulty,
    Direction,
    DirectionKeyCodeMap,
    GameStatus,
    OppositeDirection,
    initialPosition,
    initialValues,
} from "./constants";

let timer = undefined;
const unsubscribe = () => {
    if (!timer) {
        return;
    }
    clearInterval(timer);
};

const isCollision = (fieldSize, position) => {
    // 上左端を超えた場合
    if (position.y < 0 || position.x < 0) {
        return true;
    }
    // 下右端を超えた場合
    if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
        return true;
    }
    return false;
};
const isEatingMyself = (fields, position) => {
    return fields[position.y][position.x] === "snake";
};
function App() {
    const [fields, setFields] = useState(initialValues);
    const [body, setBody] = useState([]);
    const [tick, setTick] = useState(0);
    const [status, setStatus] = useState(GameStatus.init);
    const [direction, setDirection] = useState(Direction.up);
    const [difficulty, setDifficulty] = useState(defaultDifficulty);

    const onStart = () => setStatus(GameStatus.playing);
    const onStop = () => setStatus(GameStatus.suspended);

    const onChangeDirection = useCallback(
        (newDirection) => {
            if (status !== GameStatus.playing) {
                return direction;
            }
            if (OppositeDirection[direction] === newDirection) {
                return;
            }
            setDirection(newDirection);
        },
        [direction, status]
    );

    const onRestart = () => {
        timer = setInterval(() => {
            setTick((tick) => tick + 1);
        }, defaultInterval);
        setDirection(Direction.up);
        setStatus(GameStatus.init);
        setBody([initialPosition]);
        setFields(initFields(fields.length, initialPosition));
    };

    const handleMoving = () => {
        const { x, y } = body[0];
        const delta = Delta[direction];
        const newPosition = {
            x: x + delta.x,
            y: y + delta.y,
        };
        if (
            isCollision(fields.length, newPosition) ||
            isEatingMyself(fields, newPosition)
        ) {
            return false;
        }
        const newBody = [...body];
        if (fields[newPosition.y][newPosition.x] !== "food") {
            const removingTrack = newBody.pop();
            fields[removingTrack.y][removingTrack.x] = "";
        } else {
            const food = getFoodPosition(fields.length, [
                ...newBody,
                newPosition,
            ]);
            fields[food.y][food.x] = "food";
        }
        fields[newPosition.y][newPosition.x] = "snake";
        newBody.unshift(newPosition);
        setFields(fields);
        setBody(newBody);
        return true;
    };

    const onChangeDifficulty = useCallback(
        (difficulty) => {
            if (status !== GameStatus.init) {
                return;
            }
            if (difficulty < 1 || difficulty > Difficulty.length) {
                return;
            }
            setDifficulty(difficulty);
        },
        [status, difficulty]
    );

    useEffect(() => {
        setBody([initialPosition]);
        const interval = Difficulty[difficulty - 1];
        timer = setInterval(() => {
            setTick((tick) => tick + 1);
        }, interval);
        return unsubscribe;
    }, [difficulty]);

    useEffect(() => {
        if (body.length === 0 || status !== GameStatus.playing) {
            return;
        }
        const canContinue = handleMoving();
        if (!canContinue) {
            unsubscribe();
            setStatus(GameStatus.gameover);
        }
    }, [tick]);

    useEffect(() => {
        const handlKeyDown = (e) => {
            const newDirection = DirectionKeyCodeMap[e.keyCode];
            if (!newDirection) {
                return;
            }
            onChangeDirection(newDirection);
        };
        document.addEventListener("keydown", handlKeyDown);
        return () => document.removeEventListener("keydown", handlKeyDown);
    }, [onChangeDirection]);

    return (
        <div className="App">
            <header className="header">
                <div className="title-container">
                    <h1 className="title">Snake Game</h1>
                </div>
                <Navigation
                    length={body.length}
                    difficulty={difficulty}
                    onChangeDifficulty={onChangeDifficulty}
                />
            </header>
            <main className="main">
                <Field fields={fields} />
            </main>
            <footer className="footer">
                <Button
                    status={status}
                    onStop={onStop}
                    onStart={onStart}
                    onRestart={onRestart}
                />
                <ManipulationPanel onChange={onChangeDirection} />
            </footer>
        </div>
    );
}

export default App;
