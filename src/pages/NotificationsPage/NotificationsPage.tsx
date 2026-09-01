import { useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./styles.scss";
import { Nofitication } from "../../api/nofitications";
import Button from "../../components/Button/Button";
import InfinityList from "../../components/InfinityList/InfinityList";
import { useUserStore } from "../../stores/UserStore";

function NotificationsPage() {
    const userStore = useUserStore();

    useEffect(() => {
        userStore.getNofitications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userStore.value.login]);

    useEffect(() => {
        const timer = setInterval(() => userStore.getNofitications(), 10000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const notifications = userStore.value.notifications ?? [];
    const unreadCount = userStore.value.unread_count ?? 0;
    const readBlock = userStore.value.notifications === undefined;

    return (
        <div className="nots-page">
            <Header />
            <main className="nots-page__main">
                <div className="nots-page__main__header">
                    <h1>Уведомления</h1>
                    {unreadCount !== 0 && (
                        <span className="nots-page__main__header__unread">
                            У вас {unreadCount} непрочитанных
                        </span>
                    )}
                </div>
                <div className="nots-page__main__notifications">
                    {notifications.length > 0 ? (
                        notifications.map((notification: Nofitication) => (
                            <div
                                key={notification.id}
                                className={
                                    notification.isRead
                                        ? "nots-page__main__notifications__item"
                                        : "nots-page__main__notifications__item unread"
                                }
                            >
                                <div className="nots-page__main__notifications__item__header">
                                    <h2 className="nots-page__main__notifications__item__header__h">
                                        {notification.title}
                                    </h2>
                                    {!notification.isRead && (
                                        <Button
                                            variant="text"
                                            title="Отметить как прочитанное"
                                            className="nots-page__main__notifications__item__header__viewed"
                                            onClick={() =>
                                                userStore.setVisibleNofitication(
                                                    notification.id,
                                                )
                                            }
                                        />
                                    )}
                                </div>
                                <p className="nots-page__main__notifications__item__value">
                                    {notification.text}
                                </p>
                                <div className="nots-page__main__notifications__item__date">
                                    {new Date(
                                        notification.updatedAt,
                                    ).toLocaleString("ru-RU")}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>У вас пока нет ни одного уведомления</div>
                    )}
                </div>
                <InfinityList
                    onShow={() =>
                        !readBlock && userStore.nextNofitications()
                    }
                />
            </main>
            <Footer />
        </div>
    );
}

export default NotificationsPage;
