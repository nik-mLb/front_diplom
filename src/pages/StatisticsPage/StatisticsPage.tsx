import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./styles.scss";
import Button from "../../components/Button/Button";
import StarFilledIcon from "../../shared/images/star-filled-ico.svg";
import { getAllSurveys, getStats, SurveyInfo } from "../../api/csat";
import { AJAXErrors } from "../../api/errors";

interface SelectedSurvey {
    name: string;
    description: string;
    questions: {
        text: string;
        stats: number[];
        rating: number;
    }[];
}

function StatisticsPage() {
    const navigate = useNavigate();

    const [surveys, setSurveys] = useState<SurveyInfo[] | null>(null);
    const [selectedSurver, setSelectedSurver] =
        useState<SelectedSurvey | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState(0);

    async function fetchSurvey(survey: SurveyInfo) {
        const { code, data } = await getStats(survey.id);
        if (code === AJAXErrors.NoError) {
            setSelectedSurver({
                name: survey.title,
                description: data!.description,
                questions: data!.questions.map((E: any) => {
                    const sm = E.stats.reduce(
                        (partialSum: number, a: number) => partialSum + a,
                        0,
                    );
                    let summ = 0;
                    let count = 0;
                    E.stats.forEach((E2: number, I: number) => {
                        summ += E2 * I;
                        count += I === 0 ? 0 : E2;
                    });
                    return {
                        text: E.text,
                        stats: E.stats.map((stat: any) =>
                            sm === 0 ? 0 : (stat / sm) * 100,
                        ),
                        rating: count === 0 ? 0 : summ / count,
                    };
                }),
            });
            setSelectedQuestion(0);
        }
    }

    async function fetchSurveys() {
        const { code, surveys: newSurveys } = await getAllSurveys();
        if (code === AJAXErrors.NoError) {
            setSurveys(newSurveys!);
            if (newSurveys!.length > 0) {
                fetchSurvey(newSurveys![0]);
            }
        } else {
            navigate("/");
        }
    }

    useEffect(() => {
        fetchSurveys();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="stats-page">
            <Header />
            <main className="stats-page__main">
                <h1 className="stats-page__main__h">Статистика</h1>
                <div className="stats-page__main__result">
                    <div className="stats-page__main__result__list">
                        <div className="stats-page__main__result__list__items">
                            {surveys?.map((survey) => (
                                <Button
                                    key={survey.id}
                                    title={survey.title}
                                    className="stats-page__main__result__list__items__item"
                                    variant="text"
                                    onClick={() => fetchSurvey(survey)}
                                />
                            ))}
                        </div>
                    </div>
                    {selectedSurver && (
                        <div className="stats-page__main__result__survey">
                            <h2 className="stats-page__main__result__survey__h">
                                {selectedSurver.name}
                            </h2>
                            <div className="stats-page__main__result__survey__description">
                                {selectedSurver.description}
                            </div>
                            <hr />
                            <div className="stats-page__main__result__survey__questions">
                                <span className="stats-page__main__result__survey__questions__t">
                                    Вопросы:
                                </span>
                                <span className="stats-page__main__result__survey__questions__actions">
                                    {Array(selectedSurver.questions.length)
                                        .fill(0)
                                        .map((E, I) => (
                                            <Button
                                                key={I}
                                                className={
                                                    selectedQuestion !== I
                                                        ? "stats-page__main__result__survey__questions__actions__b"
                                                        : "stats-page__main__result__survey__questions__actions__b-selected"
                                                }
                                                size="s"
                                                title={I + 1}
                                                onClick={() =>
                                                    setSelectedQuestion(I)
                                                }
                                            />
                                        ))}
                                </span>
                            </div>
                            <hr />
                            <div className="stats-page__main__result__survey__question">
                                <span className="stats-page__main__result__survey__question__t">
                                    Вопрос:
                                </span>
                                <span className="stats-page__main__result__survey__question__actions">
                                    {
                                        selectedSurver.questions[
                                            selectedQuestion
                                        ].text
                                    }
                                </span>
                            </div>
                            <div className="stats-page__main__result__survey__question-result">
                                <div className="stats-page__main__result__survey__question-result__t">
                                    Результаты:
                                </div>
                                <div className="stats-page__main__result__survey__question-result__value">
                                    {Array(10)
                                        .fill(0)
                                        .map((_, I) => (
                                            <div
                                                key={I}
                                                className="stats-page__main__result__survey__question-result__value__c"
                                            >
                                                <div className="stars">
                                                    {Array(I + 1)
                                                        .fill(0)
                                                        .map((_2, J) => (
                                                            <img
                                                                key={J}
                                                                className="star"
                                                                src={
                                                                    StarFilledIcon
                                                                }
                                                            />
                                                        ))}
                                                </div>
                                                <div className="stats-page__main__result__survey__question-result__value__c__res">
                                                    {parseInt(
                                                        selectedSurver
                                                            .questions[
                                                            selectedQuestion
                                                        ].stats[
                                                            I + 1
                                                        ] as unknown as string,
                                                    )}{" "}
                                                    %
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <div className="stats-page__main__result__survey__question-result__s">
                                    Количество пропусков данного вопроса -{" "}
                                    {
                                        selectedSurver.questions[
                                            selectedQuestion
                                        ].stats[0]
                                    }
                                </div>
                                <div className="stats-page__main__result__survey__question-result__r">
                                    Средний рейтинг -{" "}
                                    {selectedSurver.questions[
                                        selectedQuestion
                                    ].rating.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default StatisticsPage;
