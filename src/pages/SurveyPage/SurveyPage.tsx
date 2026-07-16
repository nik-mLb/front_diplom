import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles.scss";
import Button from "../../components/Button/Button";

import StarIcon from "../../shared/images/star-ico.svg";
import StarFilledIcon from "../../shared/images/star-filled-ico.svg";
import { getSurvey, sendSurvey, type SurveyQuestion } from "../../api/csat";
import { AJAXErrors } from "../../api/errors";

function SurveyPage() {
    const { id } = useParams<{ id: string }>();

    const [title, setTitle] = useState("");
    const [surveyId, setSurveyId] = useState("");
    const [questionCount, setQuestionCount] = useState(10);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [starCountHover, setStarCountHover] = useState(0);
    const [starCountSelected, setStarCountSelected] = useState(0);
    const [description, setDescription] = useState("Супер улётный опрос");
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [answers, setAnswers] = useState<{ questionId: string; value: number }[]>(
        [],
    );
    const [surveyPhase, setSurveyPhase] = useState(0);

    async function fetchSurvey() {
        if (id) {
            const { code, survey } = await getSurvey(id);
            if (code === AJAXErrors.NoError) {
                setSurveyId(survey!.surveyId);
                setDescription(survey!.description);
                setQuestions(survey!.questions);
                setTitle(survey!.title);
                setQuestionCount(survey!.questions.length);
            }
        }
    }

    useEffect(() => {
        fetchSurvey();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function nextQuestion() {
        setAnswers([
            ...answers,
            {
                questionId: questions[questionIndex].questionId,
                value: starCountSelected,
            },
        ]);
        setQuestionIndex(questionIndex + 1);
        setStarCountHover(0);
        setStarCountSelected(0);
    }

    function skipQuestion() {
        setAnswers([
            ...answers,
            {
                questionId: questions[questionIndex].questionId,
                value: 0,
            },
        ]);
        setQuestionIndex(questionIndex + 1);
        setStarCountHover(0);
        setStarCountSelected(0);
    }

    async function handleSendSurvey(f: boolean) {
        const code = await sendSurvey(surveyId, [
            ...answers,
            {
                questionId: questions[questionIndex].questionId,
                value: f ? 0 : starCountSelected,
            },
        ]);
        if (code === AJAXErrors.NoError) {
            setSurveyPhase(2);
        }
    }

    return (
        <div className="survey">
            <div className="survey__title">
                <div className="survey__title__name">
                    <div className="survey__title__name__h">{title}</div>
                    <div className="survey__title__name__counter">
                        {
                            [
                                "",
                                `Вопрос ${questionIndex + 1} из ${questionCount}`,
                                "Пройден",
                            ][surveyPhase]
                        }
                    </div>
                </div>
                <div className="survey__title__line">
                    {surveyPhase !== 0 && (
                        <div
                            className="survey__title__line__progress"
                            style={{
                                width: `${((questionIndex + 1) / questionCount) * 100}%`,
                            }}
                        />
                    )}
                </div>
            </div>
            <div className="survey__content">
                <div className="survey__content__question">
                    {
                        [
                            description,
                            questions[questionIndex]?.text,
                            "Спасибо за прохождение опроса. Нам важен каждый отзыв.",
                        ][surveyPhase]
                    }
                </div>
                {surveyPhase === 1 && (
                    <div className="survey__content__answer">
                        {Array(10)
                            .fill(0)
                            .map((E, I) => (
                                <img
                                    key={I}
                                    className={
                                        starCountHover !== 0 &&
                                        starCountHover <= I &&
                                        starCountSelected > I
                                            ? "survey__content__answer__star removed"
                                            : "survey__content__answer__star"
                                    }
                                    src={
                                        starCountHover > I ||
                                        starCountSelected > I
                                            ? StarFilledIcon
                                            : StarIcon
                                    }
                                    onMouseOver={() => setStarCountHover(I + 1)}
                                    onMouseLeave={() => setStarCountHover(0)}
                                    onClick={() =>
                                        setStarCountSelected(starCountHover)
                                    }
                                />
                            ))}
                    </div>
                )}
            </div>
            <div className="survey__actions">
                {surveyPhase === 1 && (
                    <Button
                        className="survey__actions__skip"
                        variant="text"
                        title="Пропустить вопрос"
                        onClick={() => {
                            if (questionIndex !== questionCount - 1) {
                                skipQuestion();
                            } else {
                                handleSendSurvey(true);
                            }
                        }}
                    />
                )}
                {surveyPhase === 1 ? (
                    <Button
                        className="survey__actions__next"
                        variant="primary"
                        title={
                            questionIndex !== questionCount - 1
                                ? "Следующий вопрос"
                                : "Отправить"
                        }
                        disabled={starCountSelected === 0}
                        onClick={() => {
                            if (questionIndex !== questionCount - 1) {
                                nextQuestion();
                            } else {
                                handleSendSurvey(false);
                            }
                        }}
                    />
                ) : (
                    <Button
                        className="survey__actions__next"
                        variant="primary"
                        title={surveyPhase === 0 ? "Поехали" : "Закрыть"}
                        onClick={() => {
                            if (surveyPhase === 0) {
                                setSurveyPhase(1);
                            } else {
                                window.parent.postMessage("finish");
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default SurveyPage;
